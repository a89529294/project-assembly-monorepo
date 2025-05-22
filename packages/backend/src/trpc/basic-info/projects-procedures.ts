import {
  contactsTable,
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
