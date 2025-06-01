import {
  customersTable,
  projectsTable,
  projectAssembliesTable,
  projectAssembliesSummaryQueryInputSchema,
  paginatedProjectAssemblySchema,
} from "@myapp/shared";
import { and, count, eq, or, ilike, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { protectedProcedure } from "../core";
import { orderDirectionFn } from "../helpers";

export const readSimpleProjectsProcedure = protectedProcedure([
  "ProductionManagement",
])
  .input(z.string().optional())
  .query(async ({ input: customerId }) => {
    // Create base query
    const query = db
      .select()
      .from(projectsTable)
      .leftJoin(customersTable, eq(customersTable.id, projectsTable.customerId))
      .$dynamic();

    // Add customer filter if provided
    if (customerId) {
      query.where(eq(projectsTable.customerId, customerId));
    }

    // Fetch all projects
    const projects = await query;

    return projects.map((v) => ({
      ...v.projects,
      customerName: v.customers?.name,
    }));
  });

export const readProjectAssembliesProcedure = protectedProcedure([
  "ProductionManagement",
])
  .input(
    z.object({
      projectId: z.string(),
      pagination: projectAssembliesSummaryQueryInputSchema,
    })
  )
  .output(paginatedProjectAssemblySchema)
  .query(async ({ input }) => {
    const { projectId, pagination } = input;
    const { page, pageSize, orderBy, orderDirection, searchTerm } = pagination;
    const offset = (page - 1) * pageSize;

    // Create base conditions that are always applied
    const baseConditions = [];

    baseConditions.push(eq(projectAssembliesTable.projectId, projectId));
    baseConditions.push(ne(projectAssembliesTable.change, "DELETED"));

    // Add search conditions if searchTerm exists
    if (searchTerm.length > 0) {
      const term = `%${searchTerm}%`;
      baseConditions.push(
        or(
          ilike(projectAssembliesTable.tagId, term),
          ilike(projectAssembliesTable.name, term)
        )
      );
    }

    // Create the final where clause
    const whereClause = and(...baseConditions);

    // Get total count
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(projectAssembliesTable)
      .where(whereClause);

    // Get paginated data with ordering
    const data = await db
      .select()
      .from(projectAssembliesTable)
      .where(whereClause)
      .orderBy(
        orderDirectionFn(orderDirection)(projectAssembliesTable[orderBy])
      )
      .limit(pageSize)
      .offset(offset);

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);

    // Return paginated result
    return {
      page,
      pageSize,
      total,
      totalPages,
      data,
    };
  });
