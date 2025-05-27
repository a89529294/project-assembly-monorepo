import {
  BomProcessStatus,
  ProjectAssembly,
  processWorkTypesTable,
  projectAssembliesTable,
  projectAssemblyChangeStatus,
  projectAssemblyProcessTable,
  projectBomImportJobRecordTable,
} from "@myapp/shared";
import Queue from "bull";
import { db } from "./db";
import { queueOptions } from "./redis";

import { and, eq, inArray } from "drizzle-orm";
import extract from "extract-zip";
import * as fs from "fs/promises";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import {
  BOM_DIR_NAME,
  BOM_FILE_NAME,
  NC_DIR_NAME,
  NC_FILE_NAME,
} from "./file/constants";
import bom2json from "./helpers/guanda-bom2json/index.js";
import { chunkArray } from "./helpers/misc";
import { downloadFileFromS3, getS3FileMetadata } from "./helpers/s3";

// type DeepPartial<T> = {
//   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
// };

const bucketName = process.env.S3_BUCKET_NAME;

export interface ProjectBomImportQueueData {
  projectId: string;
  operator: string;
  queuedAt: number;
  force: boolean;
  s3Key?: string;
  eTag?: string;
  fileSize?: number;
}

export interface BomImportJobResult {
  success: boolean;
  processedRows?: number;
  errors?: string[];
  completedAt: number;
}

interface ProjectBomImportProgress {
  processedAssemblies: number;
  totalAssemblies: number;
}

interface AddJobResult {
  job: Queue.Job<ProjectBomImportQueueData> | null;
  jobRecord: any | null;
  skipped: boolean;
  error?: Error;
}

export class BomImportQueue {
  private queue: Queue.Queue<ProjectBomImportQueueData>;

  constructor() {
    this.queue = new Queue<ProjectBomImportQueueData>(
      "bom-import",
      queueOptions
    );
    this.setupProcessors();
    this.setupEventListeners();
  }

  private setupProcessors() {
    this.queue.process("process-bom-import", 1, async (job) => {
      return this.processBomImport(job);
    });
  }

  private setupEventListeners() {
    this.queue.on("completed", (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
    });

    this.queue.on("failed", (job, err) => {
      console.error(`Job ${job.id} failed:`, err);
    });

    this.queue.on("stalled", (job) => {
      console.warn(`Job ${job.id} stalled`);
    });
  }

  private async processBomImport(
    job: Queue.Job<ProjectBomImportQueueData>
  ): Promise<BomImportJobResult> {
    const { projectId, operator } = job.data;

    try {
      // Update job status to processing
      await this.updateJobStatus(projectId, "processing");

      // Process the BOM import
      const result = await this.importAssembliesFromBom(
        job,
        projectId,
        operator
      );

      // Update job status to completed
      await this.updateJobStatus(projectId, "done");

      return {
        success: true,
        processedRows: result.processedRows,
        completedAt: Date.now(),
      };
    } catch (error) {
      // Update job status to failed
      await this.updateJobStatus(
        projectId,
        "failed",
        error instanceof Error ? error.message : "unknown error"
      );
      throw error;
    }
  }

  private async importAssembliesFromBom(
    job: Queue.Job<ProjectBomImportQueueData>,
    projectId: string,
    operator: string
  ) {
    await this.jobLog(job, "parsing bom-file");
    const { assemblies: importedAssemblies, bomFileEtag } =
      await this.getAssembliesFromBomFile(projectId);

    await this.jobLog(job, "parsing assemblies");
    const sortResult = await this.sortImportedAssemblies(
      projectId,
      importedAssemblies
    );

    // Update job progress with actual totals
    const totalAssemblies =
      sortResult.newAssemblies.length +
      sortResult.replacements.length +
      sortResult.missingAssemblies.length;

    let jobProgress: ProjectBomImportProgress = {
      processedAssemblies: 0,
      totalAssemblies,
    };

    await this.updateJobProgress(job, jobProgress);
    await this.updateJobRecord(projectId, {
      bomFileEtag: bomFileEtag ?? null,
      totalSteps: totalAssemblies,
    });

    try {
      // Handle new assemblies
      await this.handleNewAssemblies(job, projectId, sortResult, operator);

      // Handle replacements
      await this.handleReplacements(job, sortResult, operator);

      // Handle missing assemblies
      await this.handleMissingAssemblies(job, sortResult, operator);

      // Update final record
      await this.jobLog(job, "updating database record");
      jobProgress = await this.getJobProgress(job);
      await this.updateJobRecord(projectId, {
        jobId: job.id.toString(),
        status: "done" as BomProcessStatus,
        processedSteps: jobProgress.processedAssemblies ?? null,
        errorMessage: null,
        latestImportedAt: new Date(),
      });

      await this.jobLog(job, "done");

      return {
        processedRows: totalAssemblies,
      };
    } catch (error) {
      throw error;
    }
  }

  private async getAssembliesFromBomFile(projectId: string) {
    const { bomJson, bomFileEtag } = await this.transformBomFile(projectId);
    const projectAssemblyTemplatesMap = new Map();

    for (const assembly of bomJson.assemblyTemplates) {
      projectAssemblyTemplatesMap.set(assembly.name, assembly);
    }

    // Create imported-Assembly entities
    const importedAssemblies = bomJson.root.assemblies
      .map((el) => {
        const projectAssemblyTemplate = projectAssemblyTemplatesMap.get(
          el.name
        );

        const { specification, material, type } = el.mainPart;

        if (!specification || !material || !type) {
          return null;
        }

        return {
          ...projectAssemblyTemplate,
          installPosition: el.installPosition,
          installHeight: el.installHeight,
          areaType: el.areaType,
          transportNumber: el.transportNumber,
          transportDesc: null,
          memo1: el.memo,
          id: undefined,
          assemblyId: el.id,
          projectId: projectId,
          specification,
          material,
          type,
        };
      })
      .filter((el): el is ProjectAssembly => el !== null);

    return {
      assemblies: importedAssemblies,
      bomFileEtag,
    };
  }

  private async transformBomFile(projectId: string) {
    const { bomFilePath, ncDirPath, tempDir, bomFileEtag } =
      await this.downloadRequireFilesToTempdir(projectId);

    try {
      const projectBom = await bom2json.Project.fromBomFileAndNcDir(
        bomFilePath,
        ncDirPath,
        {
          encoding: "big5",
          ignoreNcSpecNotMatch: true,
          ignoreSpecConflict: true,
        }
      );

      const bomJson = bom2json.transform(projectBom);

      return {
        bomJson,
        bomFileEtag,
      };
    } finally {
      tempDir.destroy().catch((error) => console.error(error));
    }
  }

  private async downloadRequireFilesToTempdir(projectId: string) {
    // Check if BOM file exists
    const bomS3Key = `projects/${projectId}/${BOM_DIR_NAME}/${BOM_FILE_NAME}`;
    const bomMetadata = await getS3FileMetadata(bucketName!, bomS3Key);

    if (!bomMetadata) {
      throw new Error("BOM 檔案不存在");
    }

    const tempDir = await mkdtemp(join(tmpdir(), "bomtrans-"));
    const bomFilePath = join(tempDir, BOM_FILE_NAME);
    const ncDirPath = join(tempDir, "DSTV_Profile");

    await downloadFileFromS3(bucketName!, bomS3Key, bomFilePath);
    await fs.mkdir(ncDirPath);

    // Try to download NC file
    try {
      const ncS3Key = `projects/${projectId}/${NC_DIR_NAME}/${NC_FILE_NAME}`;
      const ncFilePath = join(tempDir, NC_FILE_NAME);

      await downloadFileFromS3(bucketName!, ncS3Key, ncFilePath);
      await extract(ncFilePath, { dir: ncDirPath });
    } catch (error) {
      console.warn("NC file not found or extraction failed:", error);
    }

    return {
      tempDir: {
        path: tempDir,
        destroy: async () => rm(tempDir, { recursive: true, force: true }),
      },
      bomFilePath,
      bomFileEtag: bomMetadata.etag,
      ncDirPath,
    };
  }

  private async handleNewAssemblies(
    job: Queue.Job<ProjectBomImportQueueData>,
    projectId: string,
    sortResult: Awaited<ReturnType<typeof this.sortImportedAssemblies>>,
    operator: string
  ) {
    await this.jobLog(job, "updating database for new-assemblies");

    const insertAssemblies = sortResult.newAssemblies.map((na) => ({
      ...na,
      change: projectAssemblyChangeStatus.enumValues[0], // 'NEW'
    }));

    const processWorkTypes = await db
      .select()
      .from(processWorkTypesTable)
      .where(
        and(
          eq(processWorkTypesTable.projectId, projectId),
          eq(processWorkTypesTable.sequence, 0)
        )
      );

    let jobProgress = await this.getJobProgress(job);
    let progressPercentage =
      (jobProgress.processedAssemblies / jobProgress.totalAssemblies) * 100;

    const chunkSize = 100;
    const assemblyChunks = chunkArray(insertAssemblies, chunkSize);

    for (const assemblyChunk of assemblyChunks) {
      const tagIds = await this.generateTagIds(assemblyChunk.length);

      await db.transaction(async (tx) => {
        const insertedAssemblies = await Promise.all(
          assemblyChunk.map(async (asm, index) => {
            const [inserted] = await tx
              .insert(projectAssembliesTable)
              .values({
                ...asm,
                tagId: tagIds[index],
                projectId,
                createdBy: operator,
                updatedBy: operator,
              } as any)
              .returning();
            return inserted;
          })
        );

        const newAssemblyProcesses = insertedAssemblies.flatMap((assembly) =>
          processWorkTypes.map((workType) => ({
            name: workType.name,
            sequence: workType.sequence,
            queue: workType.queue,
            processWorkTypeId: workType.id,
            projectAssemblyId: assembly.id,
            status: "PENDING",
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: operator,
            updatedBy: operator,
          }))
        );

        if (newAssemblyProcesses.length > 0) {
          await tx
            .insert(projectAssemblyProcessTable)
            .values(newAssemblyProcesses);
        }
      });

      jobProgress.processedAssemblies += assemblyChunk.length;
      const newPercentage =
        (jobProgress.processedAssemblies / jobProgress.totalAssemblies) * 100;

      if (newPercentage === 100 || newPercentage - progressPercentage >= 10) {
        progressPercentage = newPercentage;
        await this.updateJobProgress(job, jobProgress);
      }
    }
  }

  private async handleReplacements(
    job: Queue.Job<ProjectBomImportQueueData>,
    sortResult: Awaited<ReturnType<typeof this.sortImportedAssemblies>>,
    operator: string
  ) {
    await this.jobLog(job, "updating database for replaced-assemblies");

    let jobProgress = await this.getJobProgress(job);
    let progressPercentage =
      (jobProgress.processedAssemblies / jobProgress.totalAssemblies) * 100;

    const chunkSize = 100;
    const replacementChunks = chunkArray(sortResult.replacements, chunkSize);

    for (const replacementChunk of replacementChunks) {
      const updateAssemblies: Array<ProjectAssembly> = [];

      for (const replacement of replacementChunk) {
        const { replacedAssembly, replacementAssembly } = replacement;

        updateAssemblies.push({
          ...replacementAssembly,
          id: replacedAssembly.id,
          change: projectAssemblyChangeStatus.enumValues[3],
          tagId: replacedAssembly.tagId,
        });
      }

      await db.transaction(async (tx) => {
        await Promise.all(
          updateAssemblies.map(async (assembly) => {
            if (!assembly.id) return;
            return tx
              .update(projectAssembliesTable)
              .set({
                ...assembly,
                updatedBy: operator,
                updatedAt: new Date(),
              } as any)
              .where(eq(projectAssembliesTable.id, assembly.id));
          })
        );
      });

      jobProgress.processedAssemblies += replacementChunk.length;
      const newPercentage =
        (jobProgress.processedAssemblies / jobProgress.totalAssemblies) * 100;

      if (newPercentage === 100 || newPercentage - progressPercentage >= 10) {
        progressPercentage = newPercentage;
        await this.updateJobProgress(job, jobProgress);
      }
    }
  }

  private async handleMissingAssemblies(
    job: Queue.Job<ProjectBomImportQueueData>,
    sortResult: Awaited<ReturnType<typeof this.sortImportedAssemblies>>,
    operator: string
  ) {
    await this.jobLog(job, "updating database for missing-assemblies");

    let jobProgress = await this.getJobProgress(job);
    let progressPercentage =
      (jobProgress.processedAssemblies / jobProgress.totalAssemblies) * 100;

    const chunkSize = 100;
    const missingAssemblyChunks = chunkArray(
      sortResult.missingAssemblies,
      chunkSize
    );

    for (const missingAssemblyChunk of missingAssemblyChunks) {
      const updateAssemblies: Array<ProjectAssembly> = [];

      for (const missingAssembly of missingAssemblyChunk) {
        updateAssemblies.push({
          ...missingAssembly,
          change: projectAssemblyChangeStatus.enumValues[2], // 'MISSING'
        });
      }

      await db.transaction(async (tx) => {
        await Promise.all(
          updateAssemblies.map(async (assembly) => {
            return tx
              .update(projectAssembliesTable)
              .set({
                ...assembly,
                updatedBy: operator,
                updatedAt: new Date(),
              })
              .where(eq(projectAssembliesTable.id, assembly.id));
          })
        );
      });

      jobProgress.processedAssemblies += missingAssemblyChunk.length;
      const newPercentage =
        (jobProgress.processedAssemblies / jobProgress.totalAssemblies) * 100;

      if (newPercentage === 100 || newPercentage - progressPercentage >= 10) {
        progressPercentage = newPercentage;
        await this.updateJobProgress(job, jobProgress);
      }
    }
  }

  private async sortImportedAssemblies(
    projectId: string,
    importedAssemblies: Array<ProjectAssembly>
  ) {
    const result = {
      newAssemblies: [] as Array<ProjectAssembly>,
      missingAssemblies: [] as Array<ProjectAssembly>,
      replacements: [] as Array<{
        replacementAssembly: ProjectAssembly;
        replacedAssembly: ProjectAssembly;
      }>,
    };

    const oldProjectAssemblies = await db
      .select()
      .from(projectAssembliesTable)
      .where(eq(projectAssembliesTable.projectId, projectId));

    const oldProjectAssemblyMap = new Map<string, ProjectAssembly>();

    for (const assembly of oldProjectAssemblies) {
      oldProjectAssemblyMap.set(assembly.assemblyId, assembly);
    }

    // Main loop
    for (const importedAssembly of importedAssemblies) {
      if (!importedAssembly.assemblyId) {
        continue;
      }

      const oldAssembly = oldProjectAssemblyMap.get(
        importedAssembly.assemblyId
      );

      if (!oldAssembly) {
        result.newAssemblies.push(importedAssembly);
        continue;
      }

      const replacedAssembly = this.isAssembliesSameSpec(
        importedAssembly,
        oldAssembly
      )
        ? undefined
        : oldAssembly;

      if (replacedAssembly) {
        result.replacements.push({
          replacedAssembly,
          replacementAssembly: importedAssembly,
        });
      }

      oldProjectAssemblyMap.delete(oldAssembly.assemblyId!);
    }

    result.missingAssemblies.push(...oldProjectAssemblyMap.values());

    return result;
  }

  private async generateTagIds(count: number): Promise<string[]> {
    const tagSet = new Set<string>(
      Array.from({ length: count }).map(() => this.generateTagId())
    );

    while (tagSet.size < count) {
      tagSet.add(this.generateTagId());
    }

    let existTags: Array<Pick<ProjectAssembly, "tagId">>;
    const maximumRetryTimes = 10;
    let retryTimes = 0;

    do {
      if (retryTimes++ >= maximumRetryTimes) {
        throw new Error(`無法成功產生足夠的 TagId (已嘗試次數: ${retryTimes})`);
      }

      existTags = await db
        .select({ tagId: projectAssembliesTable.tagId })
        .from(projectAssembliesTable)
        .where(inArray(projectAssembliesTable.tagId, [...tagSet]));

      for (const existTagIdAssembly of existTags) {
        tagSet.delete(existTagIdAssembly.tagId);
      }

      while (tagSet.size < count) {
        tagSet.add(this.generateTagId());
      }
    } while (existTags.length > 0);

    return [...tagSet];
  }

  private generateTagId(): string {
    // Generate a unique tag ID - implement your logic here
    return `TAG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private isAssembliesSameSpec(
    a1: ProjectAssembly,
    a2: ProjectAssembly
  ): boolean {
    return (
      a1.name === a2.name &&
      a1.installPosition === a2.installPosition &&
      this.isNumberEqual(a1.installHeight, a2.installHeight) &&
      a1.areaType === a2.areaType &&
      a1.drawingName === a2.drawingName &&
      this.isNumberEqual(a1.totalWidth, a2.totalWidth) &&
      this.isNumberEqual(a1.totalHeight, a2.totalHeight) &&
      this.isNumberEqual(a1.totalLength, a2.totalLength) &&
      this.isNumberEqual(a1.totalWeight, a2.totalWeight) &&
      this.isNumberEqual(a1.totalArea, a2.totalArea) &&
      a1.specification === a2.specification &&
      a1.material === a2.material
    );
  }

  private isNumberEqual(n1?: number | string, n2?: number | string): boolean {
    if (n1 === undefined || n2 === undefined) {
      return n1 === n2;
    }
    return Math.abs(Number(n1) - Number(n2)) < 0.0000001;
  }

  private async isImportNecessary(projectId: string): Promise<boolean> {
    const [record] = await db
      .select()
      .from(projectBomImportJobRecordTable)
      .where(eq(projectBomImportJobRecordTable.id, projectId))
      .limit(1);

    if (!record) {
      return true;
    }

    if (record.errorMessage || !record.latestImportedAt) {
      return true;
    }

    const bomS3Key = `projects/${projectId}/${BOM_DIR_NAME}/${BOM_FILE_NAME}`;
    const bomMetadata = await getS3FileMetadata(bucketName!, bomS3Key);

    if (!bomMetadata) {
      throw new Error("BOM 檔案不存在");
    }

    return bomMetadata.etag !== record.bomFileEtag;
  }

  // Helper methods for job management
  private async jobLog(job: Queue.Job, message: string): Promise<void> {
    const date = new Date().toISOString();
    return job.log(`[${date}] ${message}`);
  }

  private async updateJobProgress(
    job: Queue.Job,
    progress: ProjectBomImportProgress
  ): Promise<void> {
    await job.progress(progress);
  }

  private async getJobProgress(
    job: Queue.Job
  ): Promise<ProjectBomImportProgress> {
    return (await job.progress()) as ProjectBomImportProgress;
  }

  private async updateJobStatus(
    projectId: string,
    status: BomProcessStatus,
    errorMessage?: string
  ): Promise<void> {
    await db
      .update(projectBomImportJobRecordTable)
      .set({
        status,
        ...(errorMessage && { errorMessage }),
        ...(status === "done" && { latestImportedAt: new Date() }),
      })
      .where(eq(projectBomImportJobRecordTable.id, projectId));
  }

  private async updateJobRecord(
    projectId: string,
    updates: Record<string, any>
  ): Promise<void> {
    await db
      .update(projectBomImportJobRecordTable)
      .set(updates)
      .where(eq(projectBomImportJobRecordTable.id, projectId));
  }

  // In bom-import-queue.ts
  private async upsertJobRecord(
    projectId: string,
    eTag: string,
    jobId?: string
  ) {
    return db
      .insert(projectBomImportJobRecordTable)
      .values({
        id: projectId,
        bomFileEtag: eTag,
        status: "waiting",
        processedSteps: 0,
        totalSteps: 0,
        errorMessage: null,
        jobId: jobId || null,
      })
      .onConflictDoUpdate({
        target: projectBomImportJobRecordTable.id,
        set: {
          bomFileEtag: eTag,
          status: "waiting",
          processedSteps: 0,
          totalSteps: 0,
          errorMessage: null,
          updatedAt: new Date(),
          ...(jobId && { jobId }),
        },
      })
      .returning();
  }

  // Public methods
  async addJob(
    data: ProjectBomImportQueueData,
    options?: Queue.JobOptions
  ): Promise<AddJobResult> {
    try {
      // First check if we even need to process this import
      if (!data.force && !(await this.isImportNecessary(data.projectId))) {
        console.log(
          `Skipping unnecessary BOM import for project ${data.projectId}`
        );
        return {
          job: null,
          jobRecord: null,
          skipped: true,
        };
      }

      // Create job in the queue
      const job = await this.queue.add("process-bom-import", data, {
        jobId: `bom-import-${data.projectId}-${Date.now()}`,
        removeOnComplete: true,
        removeOnFail: 50,
        ...options,
      });

      try {
        // Create/update job record in the database
        const [jobRecord] = await this.upsertJobRecord(
          data.projectId,
          data.eTag!,
          job.id.toString()
        );

        return {
          job,
          jobRecord,
          skipped: false,
        };
      } catch (error) {
        // If we fail to create the job record, remove the job from the queue
        await job.remove();
        throw error;
      }
    } catch (error) {
      console.error("Failed to add job to queue:", error);
      return {
        job: null,
        jobRecord: null,
        skipped: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async getJob(
    jobId: string
  ): Promise<Queue.Job<ProjectBomImportQueueData> | null> {
    return this.queue.getJob(jobId);
  }

  async getJobCounts(): Promise<Queue.JobCounts> {
    return this.queue.getJobCounts();
  }

  getQueue(): Queue.Queue<ProjectBomImportQueueData> {
    return this.queue;
  }
}

export const bomImportQueue = new BomImportQueue();
