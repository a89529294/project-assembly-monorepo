import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  employeeDepartmentsTable,
  employeesTable,
  // permissionsTable,
  roleDepartmentsTable,
  rolesTable,
  userRolesTable,
  usersTable,
} from "../db/schema.js";
import type { Role } from "../db/types.js";

/**
 * Get user roles based on user ID
 * @param userId - The user ID
 * @returns An array of role objects with id and name
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
  // Get the user first to check for employeeId
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (user.length === 0)
    throw new Error(`User with id ${userId} does not exist`);

  const userObj = user[0];

  // Case 1: No employeeId, get roles from userRolesTable using join
  if (!userObj.employeeId) {
    const userRoles = await db
      .select({ id: rolesTable.id, name: rolesTable.name })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, userId));
    return userRoles;
  }

  // Case 2: Has employeeId, get employee, then departments, then roles
  const employeeId = userObj.employeeId;
  const employee = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, employeeId))
    .limit(1);

  if (employee.length === 0)
    throw new Error(`Employee with id ${employeeId} does not exist`);

  // Get departments for the employee
  const employeeDepartments = await db
    .select({ departmentId: employeeDepartmentsTable.departmentId })
    .from(employeeDepartmentsTable)
    .where(and(eq(employeeDepartmentsTable.employeeId, employeeId), eq(employeeDepartmentsTable.valid, true)));

  if (employeeDepartments.length === 0) return [];

  const deptIds = employeeDepartments.map((d) => d.departmentId);

  // Get roles for these departments via roleDepartmentsTable
  const roles = await db
    .select({ id: rolesTable.id, name: rolesTable.name })
    .from(roleDepartmentsTable)
    .innerJoin(rolesTable, eq(roleDepartmentsTable.roleId, rolesTable.id))
    .where(inArray(roleDepartmentsTable.departmentId, deptIds));

  return roles;
}

export async function isAdmin(userId: string) {
  // Check for existence of 'AdminManagement' role
  const adminRole = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.name, "AdminManagement"))
    .limit(1);

  if (adminRole.length === 0) return false;

  const adminRoleId = adminRole[0].id;

  // Check if user has the 'AdminManagement' role
  const userHasAdminRole = await db
    .select()
    .from(userRolesTable)
    .where(
      and(
        eq(userRolesTable.userId, userId),
        eq(userRolesTable.roleId, adminRoleId)
      )
    )
    .limit(1);

  return userHasAdminRole.length === 1;
}

// TODO: may not be needed anymore
/**
 * Checks if a user has a specific permission
 * @param userId - The user ID
 * @param permissionName - The permission to check for
 * @returns A boolean indicating whether the user has the permission
 */
// export async function hasPermission(
//   roles: Role[],
//   permissionName: string
// ): Promise<boolean> {
//   // if (await isAdmin(userId)) return true;

//   // Get all role IDs from the user's departments
//   const roleIds = roles.map((role) => role.id);

//   // Check if any of these roles have the requested permission
//   const permissionCheck = await db
//     .select()
//     .from(permissionsTable)
//     .where(
//       and(
//         inArray(permissionsTable.roleId, roleIds),
//         eq(permissionsTable.name, permissionName)
//       )
//     )
//     .limit(1);

//   return permissionCheck.length > 0;
// }

export function generatePassword(length = 20) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
