import {
  contactsTable,
  projectBomImportJobRecordTable,
  projectContactsTable,
  projectCreateSchema,
  projectsPaginationSchema,
  projectsQuerySchema,
  projectsTable,
} from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { protectedProcedure } from "../core";
import { orderDirectionFn } from "../helpers.js";
import { ilike } from "drizzle-orm";
import { z } from "zod";
import { bomImportQueue } from "../../bom-import-queue.js";

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

    return {
      page,
      pageSize,
      total,
      totalPages,
      data,
    };
  });

// Create a new BOM import job record when a BOM file is successfully uploaded
// Create a new BOM import job record when a BOM file is successfully uploaded
export const onBomUploadSuccessProcedure = protectedProcedure([
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
  .mutation(async ({ input, ctx }) => {
    const { projectId, s3Key, eTag, fileSize } = input;

    // const [jobRecord] = await db
    //   .insert(projectBomImportJobRecordTable)
    //   .values({
    //     id: projectId,
    //     bomFileEtag: eTag,
    //     status: "waiting",
    //   })
    //   .returning();

    // if (!jobRecord) {
    //   throw new TRPCError({
    //     code: "INTERNAL_SERVER_ERROR",
    //     message: "Failed to create BOM import job record",
    //   });
    // }

    // return jobRecord;

    return db.transaction(async (tx) => {
      // 1. Check if a job record already exists for this project
      const [existingRecord] = await tx
        .select()
        .from(projectBomImportJobRecordTable)
        .where(eq(projectBomImportJobRecordTable.id, projectId))
        .limit(1);

      // 2. If there's an existing record with status waiting/processing, throw an error
      if (existingRecord && ["waiting", "processing"].includes(existingRecord.status)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "BOM processing is already in progress for this project",
        });
      }

      // 3. Either update existing record or insert a new one
      const jobRecord = existingRecord
        ? (
            await tx
              .update(projectBomImportJobRecordTable)
              .set({
                bomFileEtag: eTag,
                status: "waiting",
                processedSteps: 0,
                totalSteps: 0,
                errorMessage: null,
                updatedAt: new Date(),
              })
              .where(eq(projectBomImportJobRecordTable.id, projectId))
              .returning()
          )[0]
        : (
            await tx
              .insert(projectBomImportJobRecordTable)
              .values({
                id: projectId,
                bomFileEtag: eTag,
                status: "waiting",
              })
              .returning()
          )[0];

      if (!jobRecord) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create BOM import job record",
        });
      }

      // 2. Add job to queue
      try {
        const job = await bomImportQueue.addJob({
          projectId,
          operator: ctx.user.id,
          queuedAt: Date.now(),
          force: false,
          s3Key,
          eTag,
          fileSize,
        });

        // 3. Update job record with the queue job ID
        await tx
          .update(projectBomImportJobRecordTable)
          .set({
            jobId: String(job.id),
          })
          .where(eq(projectBomImportJobRecordTable.id, projectId));

        return {
          ...jobRecord,
          jobId: String(job.id),
        };
      } catch (error) {
        // If queue operation fails, update the job record
        await tx
          .update(projectBomImportJobRecordTable)
          .set({
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "unknown error",
            updatedAt: new Date(),
          })
          .where(eq(projectBomImportJobRecordTable.id, projectId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue BOM import job",
          cause: error,
        });
      }
    });
  });

export const checkBomImportStatusProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(z.string().uuid("Invalid project ID"))
  .query(async ({ input }) => {
    const [job] = await db
      .select()
      .from(projectBomImportJobRecordTable)
      .where(eq(projectBomImportJobRecordTable.id, input))
      .limit(1);

    if (!job) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "BOM import job not found",
      });
    }

    if (!job.processedSteps) return 0;
    if (!job.totalSteps || job.totalSteps === 0) return 0;

    return (job.processedSteps / job.totalSteps) * 100;
  });

export const createProjectProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(projectCreateSchema)
  .mutation(async ({ input }) => {
    const { contactIdObjects, ...projectData } = input;
    const contactIds = contactIdObjects.map((v) => v.id);
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

      // 2. If there are contacts, create the associations
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
