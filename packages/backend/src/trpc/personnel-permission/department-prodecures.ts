import {
  departmentsTable,
  departmentSummarySchema,
  roleDepartmentsTable,
  roleNameEnum,
  rolesTable, // Add this import
} from "@myapp/shared";
import { and, eq, exists, notExists } from "drizzle-orm";
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
