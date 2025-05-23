import Queue from "bull";
import { queueOptions } from "./redis";
import { db } from "./db";
import {
  BomProcessStatus,
  projectBomImportJobRecordTable,
  projectAssembliesTable,
  projectAssemblyProcessTable,
  projectAssemblyChangeStatus,
  ProjectAssembly,
} from "@myapp/shared";

import { and, eq, inArray, sql } from "drizzle-orm";
import { mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import {
  BOM_DIR_NAME,
  BOM_FILE_NAME,
  NC_DIR_NAME,
  NC_FILE_NAME,
} from "./file/constants";
import * as path from "path";
import * as fs from "fs/promises";
import { downloadFileFromS3 } from "./helpers/s3";
import extract from "extract-zip";
import bom2json from "./helpers/guanda-bom2json/index.js";
import { chunkArray } from "./helpers/misc";

// Use the existing chunkArray function from helpers/misc

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
// type A = DeepPartial<ProjectAssembly>
type A = any;

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
    // Process BOM import jobs
    this.queue.process("process-bom-import", 5, async (job) => {
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
    const { projectId, operator, force } = job.data;

    try {
      // Update job status to processing
      await this.updateJobStatus(projectId, "processing");

      // Your BOM processing logic here
      const result = await this.processS3BomFile(job.data);

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

  // This is where you'll implement your actual BOM processing logic
  // 1. Download file from S3
  // 2. Parse CSV
  // 3. Validate data
  // 4. Insert into database
  // 5. Return results

  // private async processS3BomFile(data: ProjectBomImportQueueData) {
  //   console.log(`Processing BOM for project ${data.projectId}`);

  //   const updateProgress = async (
  //     processedSteps: number,
  //     totalSteps: number
  //   ) => {
  //     try {
  //       console.log(`Updating progress: ${processedSteps}/${totalSteps}`);
  //       const result = await db
  //         .update(projectBomImportJobRecordTable)
  //         .set({
  //           processedSteps,
  //           totalSteps,
  //         })
  //         .where(eq(projectBomImportJobRecordTable.id, data.projectId))
  //         .returning();

  //       console.log("Update result:", result);
  //       return result;
  //     } catch (error) {
  //       console.error("Error updating progress:", error);
  //       throw error;
  //     }
  //   };

  //   try {
  //     // Initial update
  //     await updateProgress(0, 100);

  //     // Simulate work with progress updates
  //     for (let i = 1; i <= 10; i++) {
  //       await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate work
  //       await updateProgress(i * 10, 100);
  //     }

  //     console.log(`Completed BOM import for project ${data.projectId}`);
  //     return { processedRows: 100 };
  //   } catch (error) {
  //     console.error("Error in processS3BomFile:", error);
  //     throw error;
  //   }
  // }

  private async processS3BomFile(data: ProjectBomImportQueueData) {
    console.log(`Processing BOM for project ${data.projectId}`);
    let tempDir: string | null = null;

    const updateProgress = async (
      processedSteps: number,
      totalSteps: number
    ) => {
      try {
        const result = await db
          .update(projectBomImportJobRecordTable)
          .set({
            processedSteps,
            totalSteps,
          })
          .where(eq(projectBomImportJobRecordTable.id, data.projectId))
          .returning();
        return result;
      } catch (error) {
        console.error("Error updating progress:", error);
        throw error;
      }
    };

    try {
      // Create a temporary directory
      tempDir = await mkdtemp(join(tmpdir(), "bom-import-"));
      console.log(`Created temporary directory: ${tempDir}`);

      // Update progress
      await updateProgress(10, 100);

      // 1. Download the BOM file and NC file from S3
      const bucketName = process.env.S3_BUCKET_NAME;
      if (!bucketName) {
        throw new Error("S3_BUCKET_NAME environment variable is not set");
      }

      // Create necessary directories
      const bomFilePath = join(tempDir, BOM_FILE_NAME);
      const ncFilePath = join(tempDir, NC_FILE_NAME);
      const ncDirPath = path.join(tempDir, "DSTV_Profile");
      await fs.mkdir(ncDirPath, { recursive: true });

      // Download BOM file
      const bomS3Key = `projects/${data.projectId}/${BOM_DIR_NAME}/${BOM_FILE_NAME}`;
      await downloadFileFromS3(bucketName, bomS3Key, bomFilePath);
      console.log("Downloaded BOM file from S3");

      // Download NC file if it exists
      try {
        const ncS3Key = `projects/${data.projectId}/${NC_DIR_NAME}/${NC_FILE_NAME}`;
        await downloadFileFromS3(bucketName, ncS3Key, ncFilePath);
        console.log("Downloaded NC file from S3");

        // Extract NC file
        await extract(ncFilePath, { dir: ncDirPath });
        console.log("Extracted NC file");
      } catch (error) {
        console.warn(
          "NC file not found or failed to extract, continuing without it"
        );
      }

      await updateProgress(30, 100);

      // 2. Transform BOM file using the custom bom2json library
      let projectBom;
      try {
        // Note: The actual transformation is done in two steps:
        // 1. Create a Project instance from BOM file and NC directory
        // 2. Transform the Project instance to the final format
        projectBom = await bom2json.Project.fromBomFileAndNcDir(
          bomFilePath,
          ncDirPath,
          {
            encoding: "big5", // Using big5 encoding as required
            ignoreNcSpecNotMatch: true,
            ignoreSpecConflict: true,
          }
        );
        console.log("Transformed BOM data using bom2json");
      } catch (error) {
        console.error("Error transforming BOM file:", error);
        throw new Error(
          `Failed to process BOM file: ${error instanceof Error ? error.message : "unknown error"}`
        );
      }

      // Transform the project to the final JSON format
      const bomJson = bom2json.transform(projectBom);

      await updateProgress(60, 100);

      // 3. Parse and process assembly data
      const assemblies = this.parseAssemblyData(bomJson);
      console.log(`Extracted ${assemblies.length} assemblies from BOM`);
      console.log(assemblies);

      await this.processAssemblies(data.projectId, assemblies, data.operator);

      // Final progress update
      await updateProgress(100, 100);
      console.log(`Completed BOM import for project ${data.projectId}`);

      return {
        processedRows: assemblies.length,
        assemblies, // Return the parsed assemblies for further processing
        bomJson, // Return the transformed BOM data
      };
    } catch (error) {
      console.error("Error in processS3BomFile:", error);
      throw error;
    } finally {
      // Clean up temporary directory
      if (tempDir) {
        try {
          await rm(tempDir, { recursive: true, force: true });
          console.log(`Cleaned up temporary directory: ${tempDir}`);
        } catch (cleanupError) {
          console.error("Error cleaning up temporary directory:", cleanupError);
        }
      }
    }
  }

  private async processAssemblies(
    projectId: string,
    assemblies: Array<DeepPartial<ProjectAssembly>>,
    operator: string
  ) {
    // 1. Sort assemblies into categories
    const sortResult = await this.sortImportedAssemblies(projectId, assemblies);

    // 2. Calculate total work for progress tracking
    const totalWork =
      sortResult.newAssemblies.length +
      sortResult.replacements.length * 2 + // Each replacement counts as 2 (old + new)
      sortResult.missingAssemblies.length;

    // 3. Initialize progress
    let processedCount = 0;
    const updateProgress = async () => {
      const progress = Math.min(
        90,
        Math.floor((processedCount / totalWork) * 90)
      ); // Cap at 90%
    };

    // 4. Process new assemblies
    if (sortResult.newAssemblies.length > 0) {
      await this.handleNewAssemblies(
        sortResult.newAssemblies,
        projectId,
        operator,
        updateProgress
      );
      processedCount += sortResult.newAssemblies.length;
    }

    // 5. Process replacements
    if (sortResult.replacements.length > 0) {
      await this.handleReplacements(
        sortResult.replacements,
        operator,
        updateProgress
      );
      processedCount += sortResult.replacements.length * 2; // Count both old and new
    }

    // 6. Process missing assemblies
    if (sortResult.missingAssemblies.length > 0) {
      await this.handleMissingAssemblies(
        sortResult.missingAssemblies,
        operator,
        updateProgress
      );
      processedCount += sortResult.missingAssemblies.length;
    }
  }

  private parseAssemblyData(bomData: any) {
    if (!bomData || !bomData.root || !Array.isArray(bomData.root.assemblies)) {
      return [];
    }

    // Create a map of assembly templates for quick lookup
    const assemblyTemplatesMap = new Map();
    if (Array.isArray(bomData.assemblyTemplates)) {
      for (const template of bomData.assemblyTemplates) {
        if (template && template.name) {
          assemblyTemplatesMap.set(template.name, template);
        }
      }
    }

    return bomData.root.assemblies
      .map((assembly: any) => {
        if (!assembly || !assembly.name) return null;

        const template = assemblyTemplatesMap.get(assembly.name);
        if (!template) {
          console.warn(`No template found for assembly: ${assembly.name}`);
          return null;
        }

        // Create the assembly object with all required fields
        const projectAssembly = {
          // Required fields with defaults
          tagId:
            assembly.tagId ||
            `TAG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          assemblyId: assembly.id || assembly.assemblyId || "",
          name: assembly.name,
          installPosition: assembly.installPosition || "",
          installHeight: assembly.installHeight?.toString() || "0",
          areaType: assembly.areaType || "",
          transportNumber: assembly.transportNumber || null,
          transportDesc: assembly.transportDesc || null,
          tagTransportNumber: assembly.tagTransportNumber || null,
          drawingName: assembly.drawingName || template.drawingName || "",
          totalWidth: template.totalWidth?.toString() || "0",
          totalHeight: template.totalHeight?.toString() || "0",
          totalLength: parseFloat(template.totalLength) || 0,
          totalWeight: template.totalWeight?.toString() || "0",
          totalArea: template.totalArea?.toString() || "0",
          specification: template.specification || "",
          material: template.material || "",
          type: template.type || "DEFAULT",
          memo1: assembly.memo1 || template.memo1 || null,
          memo2: assembly.memo2 || template.memo2 || null,
          vehicleIdentificationNumber:
            assembly.vehicleIdentificationNumber || null,
          shippingNumber: assembly.shippingNumber || null,
          shippingDate: assembly.shippingDate
            ? new Date(assembly.shippingDate)
            : null,
          change: assembly.change,
          // || ProjectAssemblyChangeStatus.NEW,

          // Relationships will be set by the caller
          project: undefined, // Will be set by the caller
          projectParts: [], // Will be populated if needed
          projectAssemblyProcesses: [], // Will be populated based on process work types
          materialRelations: [], // Will be populated if needed
        };

        return projectAssembly;
      })
      .filter((assembly: A | null): assembly is A => assembly !== null);
  }

  private async updateJobStatus(
    projectId: string,
    status: BomProcessStatus,
    errorMessage?: string
  ) {
    // Update your database job record
    // This should match your existing database update logic

    await db
      .update(projectBomImportJobRecordTable)
      .set({
        status,
        ...(errorMessage && { errorMessage }),
        ...(status === "done" && { latestImportedAt: new Date() }),
      })
      .where(eq(projectBomImportJobRecordTable.id, projectId));

    console.log(`Updating job status for ${projectId}: ${status}`);
  }

  private async handleNewAssemblies(
    newAssemblies: Array<DeepPartial<ProjectAssembly>>,
    projectId: string,
    operator: string,
    updateProgress: () => Promise<void>
  ) {
    const chunkSize = 50; // Adjust based on performance testing
    const chunks = chunkArray(newAssemblies, chunkSize);

    for (const chunk of chunks) {
      // 1. Get process work types for this project
      const processWorkTypes = await db
        .select()
        .from(processWorkTypesTable)
        .where(
          and(
            eq(processWorkTypesTable.projectId, projectId),
            eq(processWorkTypesTable.sequence, 0)
          )
        );

      // 2. Generate tag IDs for new assemblies
      const tagIds = await this.generateTagIds(chunk.length);

      // 3. Process in transaction
      await db.transaction(async (tx) => {
        // 4. Insert assemblies with tag IDs
        const insertedAssemblies = await Promise.all(
          chunk.map(async (asm, index) => {
            const [inserted] = await tx
              .insert(projectAssembliesTable)
              .values({
                ...asm,
                tagId: tagIds[index],
                projectId,
                change: projectAssemblyChangeStatus.enumValues[0], // 'CREATED'
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: operator,
                updatedBy: operator,
              })
              .returning();
            return inserted;
          })
        );

        // 5. Create assembly processes
        const assemblyProcesses = insertedAssemblies.flatMap((assembly) =>
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

        if (assemblyProcesses.length > 0) {
          await tx
            .insert(projectAssemblyProcessTable)
            .values(assemblyProcesses);
        }
      });

      // 6. Update progress
      await updateProgress();
    }
  }

  private async handleReplacements(
    replacements: Array<{
      replacedAssembly: DeepPartial<ProjectAssembly>;
      replacementAssembly: DeepPartial<ProjectAssembly>;
      oldReplacementAssembly?: DeepPartial<ProjectAssembly>;
    }>,
    operator: string,
    updateProgress: () => Promise<void>
  ) {
    const chunkSize = 50;
    const chunks = chunkArray(replacements, chunkSize);

    for (const chunk of chunks) {
      await db.transaction(async (tx) => {
        const updates: any[] = [];
        const inserts: any[] = [];
        const now = new Date();

        for (const {
          replacedAssembly,
          replacementAssembly,
          oldReplacementAssembly,
        } of chunk) {
          if (!replacedAssembly.id) continue;

          // 1. Mark old assembly as REPLACED
          updates.push(
            tx
              .update(projectAssembliesTable)
              .set({
                change: projectAssemblyChangeStatus.enumValues[2], // 'REPLACED'
                replacedBy: replacementAssembly.assemblyId,
                updatedAt: now,
                updatedBy: operator,
              })
              .where(eq(projectAssembliesTable.id, replacedAssembly.id))
          );

          // 2. Handle replacement assembly
          if (oldReplacementAssembly?.id) {
            // Update existing replacement
            updates.push(
              tx
                .update(projectAssembliesTable)
                .set({
                  ...replacementAssembly,
                  change: projectAssemblyChangeStatus.enumValues[3], // 'REPLACEMENT'
                  tagId: oldReplacementAssembly.tagId,
                  updatedAt: now,
                  updatedBy: operator,
                })
                .where(eq(projectAssembliesTable.id, oldReplacementAssembly.id))
            );
          } else {
            // Create new replacement
            inserts.push(
              tx.insert(projectAssembliesTable).values({
                ...replacementAssembly,
                change: projectAssemblyChangeStatusEnum.enumValues[3], // 'REPLACEMENT'
                tagId: replacedAssembly.tagId, // Keep same tag ID
                projectId,
                createdAt: now,
                updatedAt: now,
                createdBy: operator,
                updatedBy: operator,
              })
            );
          }
        }

        // 3. Execute updates and inserts in parallel
        await Promise.all([...updates, ...inserts]);
      });

      // 4. Update progress (count both old and new)
      await updateProgress();
      await updateProgress(); // Call twice since each replacement has 2 operations
    }
  }

  private async handleMissingAssemblies(
    missingAssemblies: Array<DeepPartial<ProjectAssembly>>,
    operator: string,
    updateProgress: () => Promise<void>
  ) {
    const chunkSize = 100;
    const chunks = chunkArray(missingAssemblies, chunkSize);
    const now = new Date();

    for (const chunk of chunks) {
      await db.transaction(async (tx) => {
        // Process each update in parallel
        await Promise.all(
          chunk.map(async (asm: DeepPartial<ProjectAssembly>) => {
            if (!asm.id) return;
            return tx
              .update(projectAssembliesTable)
              .set({
                change: projectAssemblyChangeStatus.enumValues[4], // 'MISSING'
                updatedAt: now,
                updatedBy: operator,
              })
              .where(eq(projectAssembliesTable.id, asm.id));
          })
        );
      });

      await updateProgress();
    }
  }

  private async sortImportedAssemblies(
    projectId: string,
    importedAssemblies: Array<DeepPartial<ProjectAssembly>>
  ) {
    const result = {
      newAssemblies: [] as Array<DeepPartial<ProjectAssembly>>,
      missingAssemblies: [] as Array<DeepPartial<ProjectAssembly>>,
      replacements: [] as Array<{
        replacementAssembly: DeepPartial<ProjectAssembly>;
        oldReplacementAssembly?: DeepPartial<ProjectAssembly>;
        replacedAssembly: DeepPartial<ProjectAssembly>;
      }>,
    };

    // Get all existing assemblies for this project
    const oldProjectAssembly = await db
      .select()
      .from(projectAssembliesTable)
      .where(eq(projectAssembliesTable.projectId, projectId));

    const oldProjectAssemblyMap = new Map<string, any>();
    const oldReplacementProjectAssemblyMap = new Map<string, any>();

    // Categorize existing assemblies
    for (const assembly of oldProjectAssembly) {
      if (assembly.change === projectAssemblyChangeStatus.enumValues[3]) {
        // 'REPLACEMENT'
        oldReplacementProjectAssemblyMap.set(assembly.assemblyId, assembly);
      } else {
        oldProjectAssemblyMap.set(assembly.assemblyId, assembly);
      }
    }

    // Main loop to process imported assemblies
    for (const importedAssembly of importedAssemblies) {
      if (!importedAssembly.assemblyId) {
        continue;
      }

      const oldAssembly = oldProjectAssemblyMap.get(
        importedAssembly.assemblyId
      );

      if (!oldAssembly) {
        // Completely new assembly
        result.newAssemblies.push(importedAssembly);
        continue;
      }

      const replacedAssembly = !this.isAssembliesSameSpec(
        importedAssembly,
        oldAssembly
      )
        ? oldAssembly
        : undefined;

      if (replacedAssembly) {
        // Existing assembly with changes
        result.replacements.push({
          replacedAssembly,
          replacementAssembly: importedAssembly,
          oldReplacementAssembly: oldReplacementProjectAssemblyMap.get(
            replacedAssembly.assemblyId
          ),
        });
      }

      oldProjectAssemblyMap.delete(oldAssembly.assemblyId);
    }

    // Any remaining assemblies in oldProjectAssemblyMap are missing from the import
    result.missingAssemblies.push(...oldProjectAssemblyMap.values());

    return result;
  }

  private async generateTagIds(count: number): Promise<string[]> {
    // Get the maximum numeric tag ID
    const result = await db
      .select({
        maxId: sql<string>`MAX(CAST(${projectAssembliesTable.tagId} AS UNSIGNED))`,
      })
      .from(projectAssembliesTable);

    const maxId = parseInt(result[0]?.maxId || "0", 10);
    return Array.from({ length: count }, (_, i) => (maxId + i + 1).toString());
  }

  async addJob(
    data: ProjectBomImportQueueData,
    options?: Queue.JobOptions
  ): Promise<Queue.Job<ProjectBomImportQueueData>> {
    return this.queue.add("process-bom-import", data, {
      jobId: `bom-import-${data.projectId}-${Date.now()}`,
      removeOnComplete: true,
      removeOnFail: 50,
      ...options,
    });
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

// Singleton instance
export const bomImportQueue = new BomImportQueue();
