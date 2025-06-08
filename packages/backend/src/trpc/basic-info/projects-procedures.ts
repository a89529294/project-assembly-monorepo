import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  BOM_PROCESS_STATUS,
  BomProcessStatus,
  ContactFromDb,
  contactsTable,
  projectBomImportJobRecordTable,
  projectContactsTable,
  projectFormSchema,
  projectsPaginationSchema,
  projectsQuerySchema,
  projectsTable,
  readProjectOutputSchema,
  processWorkTypesTable,
} from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  bomProcessQueue,
  ProjectBomImportProgress,
} from "../../bom-process-queue.js";
import { db } from "../../db/index.js";
import { s3Client } from "../../s3.js";
import { protectedProcedure } from "../core";
import { orderDirectionFn } from "../helpers.js";
import {
  BOM_DIR_NAME,
  BOM_FILE_NAME,
  NC_DIR_NAME,
  NC_FILE_NAME,
} from "../../file/constants";

const genProjectsWhereCondition = (term: string) => {
  const searchTerm = `%${term}%`;
  return or(
    ilike(projectsTable.name, searchTerm),
    ilike(projectsTable.projectNumber, searchTerm),
    ilike(projectsTable.address, searchTerm),
    ilike(projectsTable.county, searchTerm),
    ilike(projectsTable.district, searchTerm)
  );
};

export const readProjectProcedure = protectedProcedure(["BasicInfoManagement"])
  .input(z.string())
  .output(readProjectOutputSchema)
  .query(async ({ input }) => {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input));

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const contacts = await db
      .select()
      .from(projectContactsTable)
      .innerJoin(
        contactsTable,
        eq(contactsTable.id, projectContactsTable.contactId)
      )
      .where(eq(projectContactsTable.projectId, input));

    let bom;
    let nc;
    let constructorPDF;
    let installedPlanePDF;
    let designedPlanePDF;
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;
    const ncFilePath = `projects/${input}/${NC_DIR_NAME}/${NC_FILE_NAME}`;
    const constructorPdfZipFilePath = `uploads/constructor-pdf-zip/${input}.zip`;
    const installedPlaneZipFilePath = `uploads/installed-plane-zip/${input}.zip`;
    const designedPlaneZipFilePath = `uploads/designed-plane-zip/${input}.zip`;

    try {
      // Check if NC file exists
      const ncFileCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: ncFilePath,
      });

      // This will throw an error if the file doesn't exist
      await s3Client.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: ncFilePath,
        })
      );

      // If we get here, the file exists - generate a presigned URL
      nc = await getSignedUrl(s3Client, ncFileCommand, {
        expiresIn: 3600, // 1 hour expiration
      });
    } catch (error) {
      // File doesn't exist or other S3 error - nc remains undefined
      console.debug(`No NC file found for project ${input}`);
    }

    const bomFilePath = `projects/${input}/${BOM_DIR_NAME}/${BOM_FILE_NAME}`;

    try {
      // Check if BOM file exists
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: bomFilePath,
      });

      // This will throw an error if the file doesn't exist
      await s3Client.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: bomFilePath,
        })
      );

      // If we get here, the file exists - generate a presigned URL
      bom = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour expiration
      });
    } catch (error) {
      // File doesn't exist or other S3 error - bomFileUrl remains null
      console.debug(`No BOM file found for project ${input}`);
    }

    try {
      // Check if constructor PDF zip file exists
      const constructorPdfCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: constructorPdfZipFilePath,
      });

      // This will throw an error if the file doesn't exist
      await s3Client.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: constructorPdfZipFilePath,
        })
      );

      // If we get here, the file exists - generate a presigned URL
      constructorPDF = await getSignedUrl(s3Client, constructorPdfCommand, {
        expiresIn: 3600, // 1 hour expiration
      });
    } catch (error) {
      // File doesn't exist or other S3 error - constructorPDF remains undefined
      console.debug(
        `No constructor PDF zip file found for project ${input}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    try {
      // Check if installed plane zip file exists
      const installedPlaneCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: installedPlaneZipFilePath,
      });

      // This will throw an error if the file doesn't exist
      await s3Client.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: installedPlaneZipFilePath,
        })
      );

      // If we get here, the file exists - generate a presigned URL
      installedPlanePDF = await getSignedUrl(s3Client, installedPlaneCommand, {
        expiresIn: 3600, // 1 hour expiration
      });
    } catch (error) {
      // File doesn't exist or other S3 error - constructorPDF remains undefined
      console.debug(
        `No installed plane zip file found for project ${input}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    try {
      // Check if installed plane zip file exists
      const designedPlaneCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: designedPlaneZipFilePath,
      });

      // This will throw an error if the file doesn't exist
      await s3Client.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: designedPlaneZipFilePath,
        })
      );

      // If we get here, the file exists - generate a presigned URL
      designedPlanePDF = await getSignedUrl(s3Client, designedPlaneCommand, {
        expiresIn: 3600, // 1 hour expiration
      });
    } catch (error) {
      // File doesn't exist or other S3 error - constructorPDF remains undefined
      console.debug(
        `No desgined plane zip file found for project ${input}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // BOM import job status/progress
    let bomJobStatus: BomProcessStatus | null = null;
    let bomJobProgress: number | null = null;
    const [jobRecord] = await db
      .select()
      .from(projectBomImportJobRecordTable)
      .where(eq(projectBomImportJobRecordTable.id, input));

    if (jobRecord) {
      bomJobStatus = jobRecord.status;
      if (jobRecord.status === "done" || jobRecord.status === "failed") {
        // done or failed, just return status
        bomJobProgress = null;
      } else {
        // try to get progress from the queue
        const job = await bomProcessQueue.getJob(jobRecord.jobId);
        if (job) {
          const jobProgress =
            (await job.progress()) as ProjectBomImportProgress;
          if (jobProgress.totalAssemblies > 0) {
            bomJobProgress = Number(
              (
                (jobProgress.processedAssemblies /
                  jobProgress.totalAssemblies) *
                100
              ).toFixed(2)
            );
          } else {
            bomJobProgress = 0;
          }
        }
      }
    }

    return {
      ...project,
      contacts: contacts.map((c) => c.contacts),
      bom,
      nc,
      constructorPDF,
      installedPlanePDF,
      designedPlanePDF,
      bomProcess: {
        jobStatus: bomJobStatus,
        jobProgress: bomJobProgress,
        projectId: project.id,
      },
    };
  });

export const readCustomerProjectsProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(projectsQuerySchema)
  .output(projectsPaginationSchema)
  .query(async ({ input }) => {
    const {
      search: { page, pageSize, orderBy, orderDirection, searchTerm },
      customerId,
    } = input;
    const offset = (page - 1) * pageSize;

    const countQuery = db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(projectsTable)
      .$dynamic();
    const projectsBaseQuery = db.select().from(projectsTable).$dynamic();

    // Collect all conditions to combine with AND
    const conditions = [];

    if (customerId) {
      conditions.push(eq(projectsTable.customerId, customerId));
    }

    if (searchTerm) {
      const term = `%${searchTerm}%`;
      const whereCondition = genProjectsWhereCondition(term);
      conditions.push(whereCondition);
    }

    if (conditions.length > 0) {
      projectsBaseQuery.where(and(...conditions));
      countQuery.where(and(...conditions));
    }

    const [{ count: total }] = await countQuery;

    const data = await projectsBaseQuery
      .orderBy(orderDirectionFn(orderDirection)(projectsTable[orderBy]))
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    const projectIds = data.map((project) => project.id);
    const contacts = await db
      .select()
      .from(projectContactsTable)
      .innerJoin(
        contactsTable,
        eq(contactsTable.id, projectContactsTable.contactId)
      )
      .where(inArray(projectContactsTable.projectId, projectIds));

    // Group contacts by projectId
    const contactsByProject = contacts.reduce(
      (acc, contact) => {
        acc[contact.project_contacts.projectId] =
          acc[contact.project_contacts.projectId] || [];
        acc[contact.project_contacts.projectId].push(contact.contacts);
        return acc;
      },
      {} as Record<string, ContactFromDb[]>
    );

    const dataWithContacts = data.map((project) => ({
      ...project,
      contacts: contactsByProject[project.id] || [],
    }));

    return {
      page,
      pageSize,
      total,
      totalPages,
      data: dataWithContacts,
    };
  });

const onAddBomToProcessQueueOutputSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("skipped"),
    message: z.string(),
  }),
  z.object({
    status: z.literal("failed"),
    message: z.string(),
  }),
  z.object({
    status: z.literal("waiting"),
    jobId: z.union([z.string(), z.number()]),
  }),
]);

export const onAddBomToProcessQueueProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(
    z.object({
      projectId: z.string().uuid("Invalid project ID"),
      s3Key: z.string().min(1, "S3 key is required"),
      eTag: z.string().min(1, "ETag is required"),
      fileSize: z
        .number()
        .int()
        .positive("File size must be a positive number"),
    })
  )
  .output(onAddBomToProcessQueueOutputSchema)
  .mutation(async ({ input, ctx }) => {
    const { projectId, s3Key, eTag, fileSize } = input;

    try {
      const { jobRecord, skipped, job } = await bomProcessQueue.addJob({
        projectId,
        operator: ctx.user.id,
        queuedAt: Date.now(),
        force: false,
        s3Key,
        eTag,
        fileSize,
      });

      if (skipped) {
        return {
          status: "skipped",
          message: "BOM process skipped - no changes detected",
        };
      }

      // failed to create job or add job record into db
      if (jobRecord === null || job === null)
        return {
          status: "failed",
          message: "BOM process failed",
        };

      return {
        status: "waiting",
        jobId: job.id,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to queue BOM import job",
        cause: error,
      });
    }
  });

export const readProjectContactsProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(z.string().uuid("Invalid customer ID"))
  .query(async ({ input: customerId }) => {
    const contacts = await db.query.contactsTable.findMany({
      where: eq(contactsTable.customerId, customerId),
    });

    return contacts;
  });

export const checkBomProcessStatusProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(z.string().uuid("Invalid project ID"))
  .output(
    z.discriminatedUnion("status", [
      z.object({
        status: z.literal(BOM_PROCESS_STATUS[3]),
      }),
      z.object({
        status: z.literal(BOM_PROCESS_STATUS[2]),
        progress: z.literal(100),
      }),
      z.object({
        status: z.literal(BOM_PROCESS_STATUS[0]),
        progress: z.number(),
      }),
      z.object({
        status: z.literal(BOM_PROCESS_STATUS[1]),
        progress: z.number(),
      }),
    ])
  )
  .query(async ({ input }) => {
    const [jobRecord] = await db
      .select()
      .from(projectBomImportJobRecordTable)
      .where(eq(projectBomImportJobRecordTable.id, input))
      .limit(1);

    if (!jobRecord) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "BOM import job not found",
      });
    }

    if (jobRecord.status === "failed") {
      return {
        status: "failed",
      };
    }

    if (jobRecord.status === "done") {
      return {
        status: "done",
        progress: 100,
      };
    }

    const job = await bomProcessQueue.getJob(jobRecord.jobId);

    if (!job) {
      return {
        status: "failed",
      };
    }

    const jobProgress = (await job.progress()) as ProjectBomImportProgress;
    const isActive = await job.isActive();

    if (jobProgress.totalAssemblies === 0) {
      return {
        status: "failed",
      };
    }

    if (
      Number.isNaN(jobProgress.processedAssemblies) ||
      Number.isNaN(jobProgress.totalAssemblies)
    )
      return {
        status: "failed",
      };

    return {
      status: isActive ? "processing" : "waiting",
      progress:
        (jobProgress.processedAssemblies / jobProgress.totalAssemblies) * 100,
    };
  });

// Special process work types for new projects
const SPECIAL_PROCESS_WORK_TYPES = [
  {
    name: "核銷庫存", // Inventory Write-off
    sequence: 0,
    queue: 1,
  },
  {
    name: "成品出貨", // Finished Goods Shipment
    sequence: 0,
    queue: 2,
  },
  {
    name: "待出貨區", // Pre-shipment Area
    sequence: 0,
    queue: 3,
  },
  {
    name: "製程ID變更", // Process ID Change
    sequence: 0,
    queue: 4,
  },
];

export const createProjectProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(projectFormSchema)
  .mutation(async ({ input, ctx }) => {
    const { contacts, ...projectData } = input;
    const contactIds = contacts.map((v) => v.id);
    const userId = ctx.session.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User ID is required to create process work types",
      });
    }
    return db.transaction(async (tx) => {
      // 1. Create the project
      const [project] = await tx
        .insert(projectsTable)
        .values(projectData)
        .returning();

      if (!project) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }

      // 2. Insert special process work types for this project
      await tx.insert(processWorkTypesTable).values(
        SPECIAL_PROCESS_WORK_TYPES.map((type) => ({
          ...type,
          projectId: project.id,
          createdBy: userId,
          updatedBy: userId,
        }))
      );

      // 3. If there are contacts, create the associations
      if (contactIds.length > 0) {
        // Verify all contact IDs exist and belong to the same customer
        const contacts = await tx
          .select({ id: contactsTable.id })
          .from(contactsTable)
          .where(
            and(
              eq(contactsTable.customerId, projectData.customerId),
              inArray(contactsTable.id, contactIds)
            )
          );

        if (contacts.length !== contactIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "One or more contact IDs are invalid or don't belong to the customer",
          });
        }

        // Create project-contact associations
        await tx.insert(projectContactsTable).values(
          contactIds.map((contactId) => ({
            projectId: project.id,
            contactId,
          }))
        );
      }

      return project;
    });
  });

export const updateProjectProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(
    z.object({
      projectId: z.string().uuid("Invalid project ID"),
      data: projectFormSchema,
    })
  )
  .mutation(async ({ input }) => {
    const { projectId, data } = input;
    const { contacts, ...projectData } = data;
    const contactIds = contacts.map((v) => v.id);

    return db.transaction(async (tx) => {
      // 1. Update the project
      const [project] = await tx
        .update(projectsTable)
        .set(projectData)
        .where(eq(projectsTable.id, projectId))
        .returning();

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // 2. Update associations
      // Remove all old associations
      await tx
        .delete(projectContactsTable)
        .where(eq(projectContactsTable.projectId, project.id));

      if (contactIds.length > 0) {
        // Verify all contact IDs exist and belong to the same customer
        const validContacts = await tx
          .select({ id: contactsTable.id })
          .from(contactsTable)
          .where(
            and(
              eq(contactsTable.customerId, projectData.customerId),
              inArray(contactsTable.id, contactIds)
            )
          );

        if (validContacts.length !== contactIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "One or more contact IDs are invalid or don't belong to the customer",
          });
        }
        // Create new associations
        await tx.insert(projectContactsTable).values(
          contactIds.map((contactId) => ({
            projectId: project.id,
            contactId,
          }))
        );
      }
      return project;
    });
  });
