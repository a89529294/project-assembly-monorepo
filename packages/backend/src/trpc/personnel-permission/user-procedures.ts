import {
  paginatedUserSummarySchema,
  UsersSummaryQueryInputSchema,
  usersTable,
} from "@myapp/shared";
import { count, ilike, inArray, or, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { hashPassword } from "../../db/password";
import { employeesTable } from "../../db/schema";
import { generatePassword } from "../../helpers/auth";
import { protectedProcedure } from "../core";
import { orderDirectionFn } from "../helpers";

export const readUsersProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(UsersSummaryQueryInputSchema)
  .output(paginatedUserSummarySchema)
  .query(async ({ input }) => {
    const { page, pageSize, orderBy, orderDirection, searchTerm } = input;
    const offset = (page - 1) * pageSize;
    console.log(page, pageSize);

    const countQuery = db
      .select({ count: count() })
      .from(usersTable)
      .$dynamic();

    const usersBaseQuery = db.select().from(usersTable).$dynamic();

    // TODO allow searchTerm to search for associated departments, which comes from the associated employee
    if (searchTerm) {
      const term = `%${searchTerm}%`;
      const whereCondition = or(
        ilike(usersTable.account, term),
        ilike(usersTable.name, term)
      );

      countQuery.where(whereCondition);
      usersBaseQuery.where(whereCondition);
    }

    // Get total count (now properly filtered)
    const [{ count: total }] = await countQuery;

    // Get paginated data
    const users = await usersBaseQuery
      .orderBy(orderDirectionFn(orderDirection)(usersTable[orderBy]))
      .limit(pageSize)
      .offset(offset);

    const data = users.map((u) => {
      const { updated_at, created_at, ...rest } = u;
      return rest;
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      data,
    };
  });

export const createUsersFromEmployeesProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(z.object({ employeeIds: z.array(z.string().min(1)).min(1) }))
  .output(
    z.array(
      z.object({
        user: paginatedUserSummarySchema.shape.data.element,
        plainPassword: z.string(),
      })
    )
  )
  .mutation(async ({ input }) => {
    // Fetch employees by IDs
    const employees = await db
      .select()
      .from(employeesTable)
      .where(inArray(employeesTable.id, input.employeeIds));

    if (employees.length !== input.employeeIds.length) {
      throw new Error("One or more employee IDs not found");
    }

    // Check for existing users for these employees
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.employeeId, input.employeeIds));
    const existingEmployeeIds = new Set(existingUsers.map((u) => u.employeeId));

    const results = [];
    for (const emp of employees) {
      if (existingEmployeeIds.has(emp.id)) continue; // Skip if user already exists
      const plainPassword = generatePassword();
      const passwordHash = await hashPassword(plainPassword);
      const [user] = await db
        .insert(usersTable)
        .values({
          account: emp.idNumber,
          name: emp.chName,
          employeeId: emp.id,
          passwordHash,
        })
        .returning();
      // Remove created_at, updated_at from user
      const { created_at, updated_at, ...userSummary } = user;
      results.push({ user: userSummary, plainPassword });
    }
    return results;
  });

export const generatePasswordForUserProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(z.object({ userId: z.string().min(1) }))
  .output(z.object({ plainPassword: z.string() }))
  .mutation(async ({ input }) => {
    // Generate a new password
    const plainPassword = generatePassword();
    const passwordHash = await hashPassword(plainPassword);

    // Update the user's passwordHash
    const [user] = await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, input.userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return { plainPassword };
  });
