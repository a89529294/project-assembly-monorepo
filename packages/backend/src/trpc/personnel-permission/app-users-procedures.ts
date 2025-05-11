import { and, eq, inArray, isNull, or, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import {
  AppUserFromDb,
  appUserPermissionEnum,
  appUserPermissions,
  appUsersOrEmployeesSummaryQueryInputSchema,
  appUsersTable,
  DepartmentFromDb,
  EmployeeFromDb,
  EmployeeOrAppUserWithDepartments,
  employeesTable,
  paginatedAppUsersOrEmployeesSummarySchema,
} from "../../db/schema.js";
import { protectedProcedure } from "../../trpc/core.js";
import {
  appUsersWithEmployeeAndDepartmentsQuery,
  employeesWithDepartmentsQuery,
} from "./helpers.js";
import { orderDirectionFn } from "../helpers.js";

const genPartialEmployee = (v: EmployeeFromDb) => {
  const { createdAt, updatedAt, ...rest } = v;
  return rest;
};

function groupEmployeesOrAppUsersWithDepartments(
  rows: Array<{
    appUser?: AppUserFromDb;
    employee: EmployeeFromDb;
    department: DepartmentFromDb;
    jobTitle: string | null;
  }>
): EmployeeOrAppUserWithDepartments[] {
  const userMap = new Map<string, EmployeeOrAppUserWithDepartments>();
  for (const row of rows) {
    const key =
      row.appUser != null
        ? (`appUser:${row.appUser.id}` as const)
        : (`employee:${row.employee.id}` as const);
    if (!userMap.has(key)) {
      userMap.set(key, {
        id: key,
        employee: genPartialEmployee(row.employee),
        departments: [
          {
            ...row.department,
            jobTitle: row.jobTitle ?? "",
          },
        ],
      });
    } else {
      userMap.get(key)!.departments.push({
        ...row.department,
        jobTitle: row.jobTitle ?? "",
      });
    }
  }
  return Array.from(userMap.values());
}

export const readAppUsersByPermissionProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z
      .object({
        permission: appUserPermissionEnum,
      })
      .optional()
  )
  .query(async ({ input }) => {
    const baseQuery = appUsersWithEmployeeAndDepartmentsQuery();
    let rows: {
      appUser: AppUserFromDb;
      employee: EmployeeFromDb;
      department: DepartmentFromDb;
      jobTitle: string | null;
    }[] = [];
    if (input?.permission) {
      // filter by permission
      rows = await baseQuery
        .innerJoin(
          appUserPermissions,
          eq(appUsersTable.id, appUserPermissions.appUserId)
        )
        .where(eq(appUserPermissions.permission, input.permission));
    } else {
      rows = await baseQuery;
    }
    return groupEmployeesOrAppUsersWithDepartments(rows);
  });

export const deleteAppUsersPermissionProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      appUserIds: z.array(z.string()),
      permission: appUserPermissionEnum,
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { appUserIds, permission } = input;
    if (!appUserIds.length) return { count: 0 };

    const result = await db
      .delete(appUserPermissions)
      .where(
        and(
          inArray(appUserPermissions.appUserId, appUserIds),
          eq(appUserPermissions.permission, permission)
        )
      );

    return { count: result?.rowCount ?? 0 };
  });

import { queryEmployeesAppUsersView } from "../../db/views/employees-app-users-queries.js";

export const readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermissionProcedure =
  protectedProcedure(["PersonnelPermissionManagement"])
    .input(
      z.object({
        criteria: appUsersOrEmployeesSummaryQueryInputSchema,
        permission: appUserPermissionEnum,
      })
    )
    // .output(paginatedAppUsersOrEmployeesSummarySchema)
    .query(async ({ input }) => {
      const { criteria, permission } = input;
      const { page, pageSize, searchTerm, orderBy, orderDirection } = criteria;

      // Use the new view-based approach with built-in pagination and filtering
      const result = await queryEmployeesAppUsersView({
        permission,
        page,
        pageSize,
        searchTerm,
        orderBy,
        orderDirection: orderDirection.toLowerCase() as "asc" | "desc",
      });

      // Format the response to match the expected output schema
      return {
        data: result.data,
        page,
        pageSize,
        total: result.pagination.total,
        totalPages: result.pagination.pageCount,
      };
    });
