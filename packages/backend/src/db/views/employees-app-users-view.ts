import { sql } from "drizzle-orm";
import { db } from "../index.js";
import { 
  appUserPermissions, 
  appUsersTable, 
  departmentsTable, 
  employeeDepartmentsTable, 
  employeesTable 
} from "../schema.js";

/**
 * Creates a view that combines:
 * 1. Employees with no app user
 * 2. App users without a specific permission
 * 
 * This view is used for the readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermissionProcedure
 */
export const createEmployeesAppUsersView = (permission: string) => {
  // Employees with NO app user
  const employeesWithNoAppUserQuery = db
    .select({
      id: sql`CONCAT('employee:', ${employeesTable.id})`.as('id'),
      sourceType: sql`'employee'`.as('source_type'),
      employeeId: employeesTable.id,
      appUserId: sql`NULL`.as('app_user_id'),
      idNumber: employeesTable.idNumber,
      chName: employeesTable.chName,
      phone: employeesTable.phone,
      email: employeesTable.email,
      departmentId: sql`${departmentsTable.id}`.as('department_id'),
      departmentName: sql`${departmentsTable.name}`.as('department_name'),
      jobTitle: employeeDepartmentsTable.jobTitle
    })
    .from(employeesTable)
    .innerJoin(
      employeeDepartmentsTable,
      sql`${employeesTable.id} = ${employeeDepartmentsTable.employeeId}`
    )
    .innerJoin(
      departmentsTable,
      sql`${employeeDepartmentsTable.departmentId} = ${departmentsTable.id}`
    )
    .leftJoin(
      appUsersTable,
      sql`${appUsersTable.employeeId} = ${employeesTable.id}`
    )
    .where(sql`${appUsersTable.id} IS NULL`);

  // App users WITHOUT the specified permission
  const appUsersWithoutPermissionQuery = db
    .select({
      id: sql`CONCAT('appUser:', ${appUsersTable.id})`.as('id'),
      sourceType: sql`'appUser'`.as('source_type'),
      employeeId: employeesTable.id,
      appUserId: appUsersTable.id,
      idNumber: employeesTable.idNumber,
      chName: employeesTable.chName,
      phone: employeesTable.phone,
      email: employeesTable.email,
      departmentId: sql`${departmentsTable.id}`.as('department_id'),
      departmentName: sql`${departmentsTable.name}`.as('department_name'),
      jobTitle: employeeDepartmentsTable.jobTitle
    })
    .from(appUsersTable)
    .innerJoin(
      employeesTable,
      sql`${appUsersTable.employeeId} = ${employeesTable.id}`
    )
    .innerJoin(
      employeeDepartmentsTable,
      sql`${employeesTable.id} = ${employeeDepartmentsTable.employeeId}`
    )
    .innerJoin(
      departmentsTable,
      sql`${employeeDepartmentsTable.departmentId} = ${departmentsTable.id}`
    )
    .leftJoin(
      appUserPermissions,
      sql`${appUsersTable.id} = ${appUserPermissions.appUserId} AND ${appUserPermissions.permission} = ${permission}`
    )
    .where(sql`${appUserPermissions.appUserId} IS NULL`);

  // Combine both queries with UNION ALL
  return sql`(${employeesWithNoAppUserQuery} UNION ALL ${appUsersWithoutPermissionQuery})`;
};
