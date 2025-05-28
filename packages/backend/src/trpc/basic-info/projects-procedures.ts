import {
  ContactFromDb,
  contactsTable,
  projectBomImportJobRecordTable,
  projectContactsTable,
  projectCreateSchema,
  projectsPaginationSchema,
  projectsQuerySchema,
  projectsTable,
  projectUpdateSchema,
} from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { bomImportQueue } from "../../bom-import-queue.js";
import { db } from "../../db/index.js";
import { protectedProcedure } from "../core";
import { orderDirectionFn } from "../helpers.js";

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
  .output(projectUpdateSchema)
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

    return {
      ...project,
      contacts: contacts.map((c) => c.contacts),
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

    try {
      const { job, jobRecord, skipped } = await bomImportQueue.addJob({
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
          message: "BOM import skipped - no changes detected",
        };
      }

      return {
        ...jobRecord,
        jobId: job?.id.toString(),
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
