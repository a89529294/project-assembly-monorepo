import { db } from "../../db/index.js";
import {
  appUsersTable,
  departmentsTable,
  employeeDepartmentsTable,
  employeesTable,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

export function appUsersWithEmployeeAndDepartmentsQuery() {
  return db
    .select({
      appUser: appUsersTable,
      employee: employeesTable,
      department: departmentsTable,
      jobTitle: employeeDepartmentsTable.jobTitle,
    })
    .from(appUsersTable)
    .innerJoin(employeesTable, eq(appUsersTable.employeeId, employeesTable.id))
    .innerJoin(
      employeeDepartmentsTable,
      eq(appUsersTable.employeeId, employeeDepartmentsTable.employeeId)
    )
    .innerJoin(
      departmentsTable,
      eq(employeeDepartmentsTable.departmentId, departmentsTable.id)
    )
    .$dynamic();
}
