import {
  departmentsTable,
  departmentSummarySchema,
  roleDepartmentsTable,
  roleNameEnum,
  rolesTable,
  employeeDepartmentsTable,
  usersTable,
  employeesTable,
  selectionInputSchema,
} from "@myapp/shared";
import {
  and,
  eq,
  exists,
  notExists,
  inArray,
  ilike,
  or,
  notInArray,
  desc,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { protectedProcedure } from "../core";

export const readDepartmentsProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(
    z
      .object({
        searchTerm: z.string(),
      })
      .optional()
  )
  .output(z.array(departmentSummarySchema))
  .query(async ({ input }) => {
    let query = db.select().from(departmentsTable).$dynamic();

    if (input?.searchTerm) {
      const search = `%${input.searchTerm}%`;
      query.where(
        or(
          ilike(departmentsTable.name, search),
          ilike(departmentsTable.enPrefix, search),
          ilike(departmentsTable.zhPrefix, search)
        )
      );
    }

    const departments = await query.orderBy(desc(departmentsTable.updatedAt));

    return departments.map((e) => {
      const { updatedAt, createdAt, ...rest } = e;
      return rest;
    });
  });

export const createDepartmentProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(departmentSummarySchema.omit({ id: true }))
  .output(departmentSummarySchema)
  .mutation(async ({ input }) => {
    // Check for duplicate name or prefix
    const exists = await db
      .select({ id: departmentsTable.id })
      .from(departmentsTable)
      .where(
        or(
          eq(departmentsTable.name, input.name),
          eq(departmentsTable.enPrefix, input.enPrefix),
          eq(departmentsTable.zhPrefix, input.zhPrefix)
        )
      );
    if (exists.length > 0) {
      throw new Error("部門名稱或前綴已存在");
    }
    const [created] = await db
      .insert(departmentsTable)
      .values(input)
      .returning();
    if (!created) {
      throw new Error("部門創建失敗");
    }
    const { createdAt, updatedAt, ...rest } = created;
    return rest;
  });

export const readDepartmentByIdProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(z.object({ departmentId: z.string() }))
  .output(departmentSummarySchema)
  .query(async ({ input }) => {
    const department = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, input.departmentId))
      .then((rows) => rows[0]);

    if (!department) throw new Error("部門不存在");

    const { updatedAt, createdAt, ...rest } = department;
    return rest;
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
  .input(
    z.object({ departmentId: z.string(), inheritsDepartmentRoles: z.boolean() })
  )
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
          eq(
            employeeDepartmentsTable.inheritsDepartmentRoles,
            input.inheritsDepartmentRoles
          )
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

export const updateDepartmentProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(departmentSummarySchema)
  .mutation(async ({ input }) => {
    // 1. Check if department exists
    const department = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, input.id))
      .then((rows) => rows[0]);
    if (!department) {
      throw new Error("Department not found");
    }
    // 2. Update department
    const [updated] = await db
      .update(departmentsTable)
      .set({
        name: input.name,
        enPrefix: input.enPrefix,
        zhPrefix: input.zhPrefix,
      })
      .where(eq(departmentsTable.id, input.id))
      .returning();
    if (!updated) {
      throw new Error("Failed to update department");
    }
    // 3. Return updated department without createdAt/updatedAt
    const { createdAt, updatedAt, ...rest } = updated;
    return rest;
  });

export const deleteDepartmentProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(z.object({ departmentId: z.string().uuid() }))
  .mutation(async ({ input }) => {
    const { departmentId } = input;

    const department = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, departmentId))
      .then((rows) => rows[0]);
    if (!department) {
      throw new Error("Department not found");
    }
    // 2. Delete department (will cascade to employeeDepartmentsTable if FK is set)
    await db
      .delete(departmentsTable)
      .where(eq(departmentsTable.id, departmentId));
    return { success: true };
  });

export const updateUserDepartmentRelationProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      selection: selectionInputSchema,
      inheritsDepartmentRoles: z.boolean(),
      departmentId: z.string().uuid(),
    })
  )
  .mutation(async ({ input }) => {
    const { selection, inheritsDepartmentRoles, departmentId } = input;
    // 1. Verify department exists
    const department = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.id, departmentId))
      .limit(1);
    if (department.length === 0) {
      throw new Error("Department not found");
    }
    // 2. Resolve userIds
    let userIds: string[] = [];
    if ("selectedIds" in selection) {
      userIds = selection.selectedIds;
    } else {
      // Search mode: find users by search term, departmentId, and opposite inheritsDepartmentRoles
      const term = `%${selection.searchTerm}%`;
      // Join users, employees, employeeDepartments
      const users = await db
        .select({
          userId: usersTable.id,
          employeeId: usersTable.employeeId,
        })
        .from(usersTable)
        .innerJoin(
          employeeDepartmentsTable,
          eq(usersTable.employeeId, employeeDepartmentsTable.employeeId)
        )
        .innerJoin(employeesTable, eq(usersTable.employeeId, employeesTable.id))
        .where(
          and(
            eq(employeeDepartmentsTable.departmentId, departmentId),
            eq(
              employeeDepartmentsTable.inheritsDepartmentRoles,
              !inheritsDepartmentRoles
            ),
            or(
              ilike(employeesTable.chName, term),
              ilike(employeesTable.enName, term),
              ilike(employeesTable.email, term),
              ilike(employeesTable.idNumber, term),
              ilike(employeesTable.phone, term),
              ilike(employeesTable.email, term)
            ),
            notInArray(usersTable.id, selection.deSelectedIds)
          )
        );
      userIds = users.map((u) => u.userId);
    }
    if (!userIds.length) {
      return { success: true, updatedCount: 0, userIds: [] };
    }
    // 3. Find employees associated with the users
    const users = await db
      .select({ id: usersTable.id, employeeId: usersTable.employeeId })
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));

    // Get all valid employeeIds
    const employeeIds = users
      .map((user) => user.employeeId)
      .filter(Boolean) as string[];

    // 4. Find the entries in employeeDepartmentsTable that match departmentId and opposite inheritsDepartmentRoles
    const employeeDepartments = await db
      .select()
      .from(employeeDepartmentsTable)
      .where(
        and(
          inArray(employeeDepartmentsTable.employeeId, employeeIds),
          eq(employeeDepartmentsTable.departmentId, departmentId),
          eq(
            employeeDepartmentsTable.inheritsDepartmentRoles,
            !inheritsDepartmentRoles
          )
        )
      );
    // 5. Update the inheritsDepartmentRoles field for all found relations

    await db
      .update(employeeDepartmentsTable)
      .set({ inheritsDepartmentRoles })
      .where(
        inArray(
          employeeDepartmentsTable.id,
          employeeDepartments.map((v) => v.id)
        )
      );

    return {
      success: true,
      updatedCount: employeeDepartments.length,
      userIds,
    };
  });
