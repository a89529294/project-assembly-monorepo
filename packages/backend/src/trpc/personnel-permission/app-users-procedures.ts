import { and, eq, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import {
  AppUserFromDb,
  appUserPermissionEnum,
  appUserPermissions,
  appUsersOrEmployeesSummaryQueryInputSchema,
  appUsersTable,
  AppUserWithDepartments,
  DepartmentFromDb,
  EmployeeFromDb,
  employeeOrAppUserWithDepartmentSummaryView,
  paginatedAppUsersOrEmployeesWithSpecificDepartmentSummarySchema,
} from "../../db/schema.js";
import { protectedProcedure } from "../../trpc/core.js";
import { orderDirectionFn } from "../helpers.js";
import { appUsersWithEmployeeAndDepartmentsQuery } from "./helpers.js";

function groupEmployeesOrAppUsersWithDepartments(
  rows: Array<{
    appUser?: AppUserFromDb;
    employee: EmployeeFromDb;
    department: DepartmentFromDb;
    jobTitle: string | null;
  }>
): AppUserWithDepartments[] {
  const userMap = new Map<string, AppUserWithDepartments>();
  for (const row of rows) {
    const key =
      row.appUser != null
        ? (`appUser:${row.appUser.id}` as const)
        : (`employee:${row.employee.id}` as const);
    if (!userMap.has(key)) {
      userMap.set(key, {
        id: key,
        employee: row.employee,
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
  .mutation(async ({ input }) => {
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

export const readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermissionProcedure =
  protectedProcedure(["PersonnelPermissionManagement"])
    .input(
      z.object({
        criteria: appUsersOrEmployeesSummaryQueryInputSchema,
        permission: appUserPermissionEnum,
      })
    )
    .output(paginatedAppUsersOrEmployeesWithSpecificDepartmentSummarySchema)
    .query(async ({ input }) => {
      const { criteria, permission } = input;
      const { page, pageSize, departmentId } = criteria;

      const results = await db
        .select({
          id: employeeOrAppUserWithDepartmentSummaryView.id,
          id_number: employeeOrAppUserWithDepartmentSummaryView.id_number,
          name: employeeOrAppUserWithDepartmentSummaryView.name,
          permissions: employeeOrAppUserWithDepartmentSummaryView.permissions,
          is_app_user: employeeOrAppUserWithDepartmentSummaryView.is_app_user,
          department_id:
            employeeOrAppUserWithDepartmentSummaryView.department_id,
          department_name:
            employeeOrAppUserWithDepartmentSummaryView.department_name,
          department_job_title:
            employeeOrAppUserWithDepartmentSummaryView.department_job_title,
          total_count: sql`count(*) over()`,
        })
        .from(employeeOrAppUserWithDepartmentSummaryView)
        .where(
          and(
            eq(
              employeeOrAppUserWithDepartmentSummaryView.department_id,
              departmentId
            ),
            or(
              sql`${employeeOrAppUserWithDepartmentSummaryView.permissions} = '{}'::text[]`,
              sql`${permission} != ALL(${employeeOrAppUserWithDepartmentSummaryView.permissions})`
            )
          )
        )
        .orderBy(
          orderDirectionFn("DESC")(
            employeeOrAppUserWithDepartmentSummaryView.id_number
          )
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const total = results.length > 0 ? Number(results[0].total_count) : 0;

      const totalPages = Math.ceil(total / pageSize);

      return {
        page,
        pageSize,
        total,
        totalPages,
        data: results.map((v) => ({
          id: v.id,
          idNumber: v.id_number,
          name: v.name,
          permissions: v.permissions,
          isAppUser: v.is_app_user,
          department: {
            id: v.department_id,
            name: v.department_name,
            jobTitle: v.department_job_title,
          },
        })),
      };
    });
