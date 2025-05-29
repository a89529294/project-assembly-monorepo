import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ContactFromDb,
  contactsTable,
  projectBomImportJobRecordTable,
  projectContactsTable,
  projectFormSchema,
  projectsPaginationSchema,
  projectsQuerySchema,
  projectsTable,
} from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { bomProcessQueue } from "../../bom-process-queue.js";
import { db } from "../../db/index.js";
import { s3Client } from "../../s3.js";
import { protectedProcedure } from "../core";
import { orderDirectionFn } from "../helpers.js";
import { BOM_DIR_NAME, BOM_FILE_NAME } from "../../file/constants.js";

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
  .output(projectFormSchema)
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

    // Check if BOM file exists and generate presigned URL if it does
    let bom = "";
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;
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

    return {
      ...project,
      contacts: contacts.map((c) => c.contacts),
      bom,
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
      const { jobRecord, skipped } = await bomProcessQueue.addJob({
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
      if (jobRecord === null)
        return {
          status: "failed",
          message: "BOM process failed",
        };

      return {
        status: "waiting",
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

    console.log(job);

    if (job.status === "failed")
      throw new TRPCError({ message: "匯入BOM表出錯", code: "PARSE_ERROR" });

    if (job.status === "done") return 100;

    if (!job.processedSteps) return 0;
    if (!job.totalSteps || job.totalSteps === 0) return 0;

    return (job.processedSteps / job.totalSteps) * 100;
  });

export const createProjectProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(projectFormSchema)
  .mutation(async ({ input }) => {
    const { contacts, ...projectData } = input;
    const contactIds = contacts.map((v) => v.id);
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
