import {
  departmentsTable,
  departmentSummarySchema,
  roleDepartmentsTable,
  roleNameEnum,
  rolesTable,
  employeeDepartmentsTable,
  usersTable,
} from "@myapp/shared";
import { and, eq, exists, notExists, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { protectedProcedure } from "../core";

export const readDepartmentsProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .output(z.array(departmentSummarySchema))
  .query(async () => {
    const departments = await db.select().from(departmentsTable);

    return departments.map((e) => {
      const { updated_at, created_at, ...rest } = e;
      return rest;
    });
  });

export const readUnassignedDepartmentsProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      roleName: z.enum(roleNameEnum.enumValues),
    })
  )
  .output(z.array(departmentSummarySchema))
  .query(async ({ input }) => {
    const { roleName } = input;

    const departments = await db
      .select()
      .from(departmentsTable)
      .where(
        notExists(
          db
            .select()
            .from(roleDepartmentsTable)
            .innerJoin(
              rolesTable,
              eq(roleDepartmentsTable.roleId, rolesTable.id)
            )
            .where(
              and(
                eq(roleDepartmentsTable.departmentId, departmentsTable.id),
                eq(rolesTable.name, roleName)
              )
            )
        )
      );

    return departments.map((e) => {
      return e;
    });
  });

export const readAssignedDepartmentsProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      roleName: z.enum(roleNameEnum.enumValues),
    })
  )
  .output(z.array(departmentSummarySchema))
  .query(async ({ input }) => {
    const { roleName } = input;

    const departments = await db
      .select()
      .from(departmentsTable)
      .where(
        exists(
          db
            .select()
            .from(roleDepartmentsTable)
            .innerJoin(
              rolesTable,
              eq(roleDepartmentsTable.roleId, rolesTable.id)
            )
            .where(
              and(
                eq(roleDepartmentsTable.departmentId, departmentsTable.id),
                eq(rolesTable.name, roleName) // Filter for the specific role name
              )
            )
        )
      );

    return departments.map((e) => {
      return e;
    });
  });

export const removeDepartmentsFromRoleProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      roleName: z.enum(roleNameEnum.enumValues),
      departmentIds: z.array(z.string().uuid()).min(1),
    })
  )
  .mutation(async ({ input }) => {
    const { roleName, departmentIds } = input;

    const role = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, roleName));

    if (!role[0]) {
      throw new Error("Role not found");
    }

    const roleId = role[0].id;

    // Find existing associations to remove
    const existing = await db
      .select({ departmentId: roleDepartmentsTable.departmentId })
      .from(roleDepartmentsTable)
      .where(
        and(
          eq(roleDepartmentsTable.roleId, roleId),
          inArray(roleDepartmentsTable.departmentId, departmentIds)
        )
      );
    const existingIds = new Set(existing.map((e) => e.departmentId));

    if (existingIds.size === 0) {
      return { removed: [], skipped: departmentIds };
    }

    await db
      .delete(roleDepartmentsTable)
      .where(
        and(
          eq(roleDepartmentsTable.roleId, roleId),
          inArray(roleDepartmentsTable.departmentId, Array.from(existingIds))
        )
      );

    return {
      removed: Array.from(existingIds),
      skipped: departmentIds.filter((id) => !existingIds.has(id)),
    };
  });

export const addDepartmentsToRoleProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      roleName: z.enum(roleNameEnum.enumValues),
      departmentIds: z.array(z.string().uuid()).min(1),
    })
  )
  .mutation(async ({ input }) => {
    const { roleName, departmentIds } = input;

    const role = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.name, roleName));

    if (!role[0]) {
      throw new Error("Role not found");
    }

    const roleId = role[0].id;

    // Find already associated departmentIds for this role
    const existing = await db
      .select({ departmentId: roleDepartmentsTable.departmentId })
      .from(roleDepartmentsTable)
      .where(
        and(
          eq(roleDepartmentsTable.roleId, roleId),
          inArray(roleDepartmentsTable.departmentId, departmentIds)
        )
      );
    const existingIds = new Set(existing.map((e) => e.departmentId));

    // Filter out departmentIds that are already associated
    const toInsert = departmentIds.filter((id) => !existingIds.has(id));
    if (toInsert.length === 0) {
      return { added: [], skipped: departmentIds };
    }

    await db
      .insert(roleDepartmentsTable)
      .values(toInsert.map((departmentId) => ({ roleId, departmentId })));

    return { added: toInsert, skipped: Array.from(existingIds) };
  });

export const readDepartmentUsersProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(z.object({ departmentId: z.string(), valid: z.boolean() }))
  .query(async ({ input }) => {
    const { departmentId } = input;

    // 1. Terminate early if department does not exist
    const department = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, departmentId))
      .limit(1);
    if (department.length === 0) {
      throw new Error("Department not found");
    }

    // 2. Find all valid employee-department entries
    const employeeDepartments = await db
      .select()
      .from(employeeDepartmentsTable)
      .where(
        and(
          eq(employeeDepartmentsTable.departmentId, departmentId),
          eq(employeeDepartmentsTable.valid, input.valid)
        )
      );
    if (employeeDepartments.length === 0) {
      return [];
    }

    // 3. Get employeeIds and fetch users
    const employeeIds = employeeDepartments.map((ed) => ed.employeeId);

    return await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.employeeId, employeeIds));
  });

export const updateUserDepartmentRelationProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      userIds: z.array(z.string().uuid()).min(1),
      valid: z.boolean(),
      departmentId: z.string().uuid(),
    })
  )
  .mutation(async ({ input }) => {
    const { userIds, valid, departmentId } = input;

    // 1. Verify department exists
    const department = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, departmentId))
      .limit(1);

    if (department.length === 0) {
      throw new Error("Department not found");
    }

    // 2. Find employees associated with the users
    const users = await db
      .select({ id: usersTable.id, employeeId: usersTable.employeeId })
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));

    if (users.length === 0) {
      throw new Error("No users found");
    }

    // Get all valid employeeIds
    const employeeIds = users
      .map((user) => user.employeeId)
      .filter(Boolean) as string[];

    // 3. Find the entries in employeeDepartmentsTable
    const employeeDepartments = await db
      .select()
      .from(employeeDepartmentsTable)
      .where(
        and(
          inArray(employeeDepartmentsTable.employeeId, employeeIds),
          eq(employeeDepartmentsTable.departmentId, departmentId)
        )
      );

    // 4. Update the valid field for all found relations
    try {
      await Promise.all(
        employeeDepartments.map((ed) =>
          db
            .update(employeeDepartmentsTable)
            .set({ valid })
            .where(eq(employeeDepartmentsTable.id, ed.id))
        )
      );
    } catch (e) {
      console.log(e);
      throw e;
    }

    return {
      success: true,
      updatedCount: employeeDepartments.length,
      userIds,
    };
  });
