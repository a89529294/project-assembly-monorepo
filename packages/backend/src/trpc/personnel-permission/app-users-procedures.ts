import { and, eq, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import {
  AppUserFromDb,
  appUserPermissionEnum,
  appUserPermissionsTable,
  appUsersOrEmployeesSummaryQueryInputSchema,
  appUsersTable,
  AppUserWithDepartments,
  DepartmentFromDb,
  EmployeeFromDb,
  employeeOrAppUserWithDepartmentSummaryView,
  employeeOrAppUserWithoutDepartmentsView,
  employeesTable,
  paginatedAppUsersOrEmployeesWithOptionalDepartmentSummarySchema,
} from "../../db/schema.js";
import { protectedProcedure } from "../../trpc/core.js";
import { orderDirectionFn } from "../helpers.js";
import { appUsersWithEmployeeAndDepartmentsQuery } from "./helpers.js";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { hashPassword } from "../../db/password.js";

function groupEmployeesOrAppUsersWithDepartments(
  rows: Array<{
    appUser: AppUserFromDb;
    employee: EmployeeFromDb;
    department: DepartmentFromDb;
    jobTitle: string | null;
  }>
): AppUserWithDepartments[] {
  const userMap = new Map<string, AppUserWithDepartments>();
  for (const row of rows) {
    const key = row.appUser.id;

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
          appUserPermissionsTable,
          eq(appUsersTable.id, appUserPermissionsTable.appUserId)
        )
        .where(eq(appUserPermissionsTable.permission, input.permission));
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
      .delete(appUserPermissionsTable)
      .where(
        and(
          inArray(appUserPermissionsTable.appUserId, appUserIds),
          eq(appUserPermissionsTable.permission, permission)
        )
      );

    return { count: result?.rowCount ?? 0 };
  });

export const readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermissionProcedure =
  protectedProcedure(["PersonnelPermissionManagement"])
    .input(
      z.object({
        criteria: appUsersOrEmployeesSummaryQueryInputSchema,
        permissionToExclude: appUserPermissionEnum,
      })
    )
    .output(paginatedAppUsersOrEmployeesWithOptionalDepartmentSummarySchema)
    .query(async ({ input }) => {
      const { criteria, permissionToExclude } = input;
      const { page, pageSize, departmentId } = criteria;

      if (departmentId === "no-department") {
        const result = await db
          .select({
            id: employeeOrAppUserWithoutDepartmentsView.id,
            id_number: employeeOrAppUserWithoutDepartmentsView.id_number,
            name: employeeOrAppUserWithoutDepartmentsView.name,
            permissions: employeeOrAppUserWithoutDepartmentsView.permissions,
            is_app_user: employeeOrAppUserWithoutDepartmentsView.is_app_user,
            total_count: sql`count(*) over()`,
          })
          .from(employeeOrAppUserWithoutDepartmentsView)
          .where(
            or(
              sql`${employeeOrAppUserWithoutDepartmentsView.permissions} = ARRAY[]::text[]`,
              sql`${permissionToExclude} != ALL(${employeeOrAppUserWithoutDepartmentsView.permissions})`
            )
          )
          .orderBy(
            orderDirectionFn("DESC")(
              employeeOrAppUserWithoutDepartmentsView.id_number
            )
          )
          .limit(pageSize)
          .offset((page - 1) * pageSize);

        const total = result.length > 0 ? Number(result[0].total_count) : 0;

        const totalPages = Math.ceil(total / pageSize);

        return {
          page,
          pageSize,
          total,
          totalPages,
          data: result.map((v) => ({
            id: v.id,
            idNumber: v.id_number,
            name: v.name,
            permissions: v.permissions,
            isAppUser: v.is_app_user,
          })),
        };
      } else {
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
                sql`${employeeOrAppUserWithDepartmentSummaryView.permissions} = ARRAY[]::text[]`,
                sql`${permissionToExclude} != ALL(${employeeOrAppUserWithDepartmentSummaryView.permissions})`
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
      }
    });

export const grantPermissionMutationProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      permission: appUserPermissionEnum,
      departmentId: z.string(),
      selectionMode: z.enum(["include", "exclude"]),
      selectedIds: z.array(z.string()).optional(),
      deselectedIds: z.array(z.string()).optional(),
    })
  )
  .output(
    z.object({
      affectedCount: z.number(),
      success: z.boolean(),
      message: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const {
      permission,
      departmentId,
      selectionMode,
      selectedIds,
      deselectedIds,
    } = input;

    // Validate selection parameters based on mode
    if (
      selectionMode === "include" &&
      (!selectedIds || selectedIds.length === 0)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected IDs are required when using include mode",
      });
    }

    if (
      selectionMode === "exclude" &&
      (!deselectedIds || deselectedIds.length === 0)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Deselected IDs are required when using exclude mode",
      });
    }

    try {
      let employeeOrUserToUpdate: string[] = [];

      // For "include" mode, use selected IDs directly
      if (selectionMode === "include") {
        employeeOrUserToUpdate = selectedIds!;
      }
      // For "exclude" mode, fetch eligible IDs and filter out deselected ones
      else {
        let eligibleIds: string[] = [];

        if (departmentId === "no-department") {
          // Query for employees or app users without a department
          const results = await db
            .select({
              id: employeeOrAppUserWithoutDepartmentsView.id,
            })
            .from(employeeOrAppUserWithoutDepartmentsView)
            .where(
              sql`${permission} != ALL(${employeeOrAppUserWithoutDepartmentsView.permissions})`
            );

          eligibleIds = results.map((record) => record.id);
        } else {
          // Query for employees or app users in the specified department
          const results = await db
            .select({
              id: employeeOrAppUserWithDepartmentSummaryView.id,
            })
            .from(employeeOrAppUserWithDepartmentSummaryView)
            .where(
              and(
                eq(
                  employeeOrAppUserWithDepartmentSummaryView.department_id,
                  departmentId
                ),
                sql`${permission} != ALL(${employeeOrAppUserWithDepartmentSummaryView.permissions})`
              )
            );

          eligibleIds = results.map((record) => record.id);
        }

        // Filter out deselected IDs
        const deselectedIdSet = new Set(deselectedIds!);
        employeeOrUserToUpdate = eligibleIds.filter(
          (id) => !deselectedIdSet.has(id)
        );
      }

      // Skip if there's nothing to update
      if (employeeOrUserToUpdate.length === 0) {
        return {
          affectedCount: 0,
          success: true,
          message: "No records needed updating",
        };
      }

      // Grant permissions
      const affectedCount = await db.transaction(async (tx) => {
        let count = 0;
        for (const id of employeeOrUserToUpdate) {
          let appUserId: string;

          // Check if ID is an employee
          const employee = await tx
            .select({
              id: employeesTable.id,
              idNumber: employeesTable.idNumber,
            })
            .from(employeesTable)
            .where(eq(employeesTable.id, id))
            .limit(1);

          if (employee.length > 0) {
            // ID is an employee, find or create an app user
            const existingAppUser = await tx
              .select({
                id: appUsersTable.id,
              })
              .from(appUsersTable)
              .where(eq(appUsersTable.employeeId, id))
              .limit(1);

            if (existingAppUser.length > 0) {
              appUserId = existingAppUser[0].id;
            } else {
              const existingEmployee = employee[0];
              const newAppUserId = randomUUID();
              await tx.insert(appUsersTable).values({
                id: newAppUserId,
                employeeId: existingEmployee.id,
                account: existingEmployee.idNumber,
                passwordHash: await hashPassword(
                  `${existingEmployee.idNumber}${19700101}`
                ),
              });
              appUserId = newAppUserId;
            }
          } else {
            // Not an employee, check if it's an app user
            const appUser = await tx
              .select({
                id: appUsersTable.id,
              })
              .from(appUsersTable)
              .where(eq(appUsersTable.id, id))
              .limit(1);

            if (appUser.length === 0) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `ID ${id} is neither an employee nor an app user`,
              });
            }
            appUserId = appUser[0].id;
          }

          // Check if permission already exists
          const existingPermission = await tx
            .select({
              id: appUserPermissionsTable.id,
            })
            .from(appUserPermissionsTable)
            .where(
              and(
                eq(appUserPermissionsTable.appUserId, appUserId),
                eq(appUserPermissionsTable.permission, permission)
              )
            )
            .limit(1);

          // Add permission if it doesn't exist
          if (existingPermission.length === 0) {
            await tx.insert(appUserPermissionsTable).values({
              appUserId: appUserId,
              permission: permission,
            });
            count++;
          }
        }
        return count;
      });

      return {
        affectedCount,
        success: true,
        message: `Successfully granted ${permission} permission for ${affectedCount} users`,
      };
    } catch (error) {
      console.error("Error granting permissions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to grant permissions",
        cause: error,
      });
    }
  });
