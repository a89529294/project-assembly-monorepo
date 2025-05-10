import {
  paginatedUserSummarySchema,
  selectionInputSchema,
  UsersSummaryQueryInputSchema,
  usersTable,
} from "@myapp/shared";
import {
  count,
  ilike,
  inArray,
  or,
  eq,
  notInArray,
  and,
  not,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { hashPassword } from "../../db/password";
import { employeesTable } from "../../db/schema";
import { generatePassword } from "../../helpers/auth";
import { protectedProcedure } from "../core";
import { orderDirectionFn } from "../helpers";

const excludeAdminCondition = not(ilike(usersTable.account, "admin%"));

export const readUsersProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(UsersSummaryQueryInputSchema)
  .output(paginatedUserSummarySchema)
  .query(async ({ input }) => {
    const { page, pageSize, orderBy, orderDirection, searchTerm } = input;
    const offset = (page - 1) * pageSize;

    const countQuery = db
      .select({ count: count() })
      .from(usersTable)
      .$dynamic();

    const usersBaseQuery = db.select().from(usersTable).$dynamic();

    let finalWhereCondition = excludeAdminCondition;

    if (searchTerm) {
      const term = `%${searchTerm}%`;
      const whereCondition = or(
        ilike(usersTable.account, term),
        ilike(usersTable.name, term)
      );
      finalWhereCondition = and(excludeAdminCondition, whereCondition)!;
    }

    countQuery.where(finalWhereCondition);
    usersBaseQuery.where(finalWhereCondition);

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
  .input(selectionInputSchema)
  .output(
    z.array(
      z.object({
        user: paginatedUserSummarySchema.shape.data.element,
        plainPassword: z.string(),
      })
    )
  )
  .mutation(async ({ input }) => {
    let employeeIds: string[];
    if ("selectedIds" in input) {
      employeeIds = input.selectedIds;
    } else {
      const term = `%${input.searchTerm}%`;
      const whereCondition = or(
        ilike(employeesTable.chName, term),
        ilike(employeesTable.enName, term),
        ilike(employeesTable.email, term),
        ilike(employeesTable.idNumber, term),
        ilike(employeesTable.phone, term),
        ilike(employeesTable.email, term)
      );
      const employees = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            whereCondition,
            notInArray(employeesTable.id, input.deSelectedIds)
          )
        );
      employeeIds = employees.map((e) => e.id);
    }

    if (employeeIds.length === 0) {
      return [];
    }

    // Fetch employees by IDs
    const employees = await db
      .select()
      .from(employeesTable)
      .where(inArray(employeesTable.id, employeeIds));

    if (employees.length !== employeeIds.length) {
      throw new Error("One or more employee IDs not found");
    }

    // Check for existing users for these employees
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.employeeId, employeeIds));
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

export const deleteUsersProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(selectionInputSchema)
  .output(z.object({ deletedUserIds: z.array(z.string()) }))
  .mutation(async ({ input }) => {
    if ("selectedIds" in input) {
      // Mode 1: Delete by userIds
      const users = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.id, input.selectedIds));

      if (users.length !== input.selectedIds.length) {
        throw new Error("One or more user IDs not found");
      }

      // Only delete users whose account does not start with 'admin'
      await db
        .delete(usersTable)
        .where(
          and(inArray(usersTable.id, input.selectedIds), excludeAdminCondition)
        );
      // Only return actually deleted user IDs
      const deletedUsers = users.filter(
        (u) => !u.account.toLowerCase().startsWith("admin")
      );
      return { deletedUserIds: deletedUsers.map((u) => u.id) };
    } else {
      // Mode 2: Delete by searchTerm except deSelectedIds
      const term = `%${input.searchTerm}%`;
      const whereCondition = or(
        ilike(usersTable.account, term),
        ilike(usersTable.name, term)
      );

      // Never delete users whose account starts with 'admin'
      // Fetch matching users
      const users = await db
        .select({ id: usersTable.id, account: usersTable.account })
        .from(usersTable)
        .where(
          and(
            whereCondition,
            notInArray(usersTable.id, input.deSelectedIds),
            excludeAdminCondition
          )
        );
      const toDeleteIds = users.map((u) => u.id);

      await db
        .delete(usersTable)
        .where(and(inArray(usersTable.id, toDeleteIds), excludeAdminCondition));
      return { deletedUserIds: toDeleteIds };
    }
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
