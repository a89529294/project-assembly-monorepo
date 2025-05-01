// Centralized permissions source and sync logic
import { db } from "./index.js";
import { permissionsTable } from "./schema.js";
import { roleIds } from "./roles.js";

const PERMISSIONS = {
  PRODUCTION_CREATE: {
    name: "production:create",
    roleId: roleIds.productionManagementRoleId,
  },
  PRODUCTION_READ: {
    name: "production:read",
    roleId: roleIds.productionManagementRoleId,
  },
  PRODUCTION_UPDATE: {
    name: "production:update",
    roleId: roleIds.productionManagementRoleId,
  },
  PRODUCTION_DELETE: {
    name: "production:delete",
    roleId: roleIds.productionManagementRoleId,
  },

  // Customer Permission Management permissions
  CUSTOMER_CREATE: {
    name: "customer:create",
    roleId: roleIds.customerManagementRoleId,
  },
  CUSTOMER_READ: {
    name: "customer:read",
    roleId: roleIds.customerManagementRoleId,
  },
  CUSTOMER_UPDATE: {
    name: "customer:update",
    roleId: roleIds.customerManagementRoleId,
  },
  CUSTOMER_DELETE: {
    name: "customer:delete",
    roleId: roleIds.customerManagementRoleId,
  },

  // Basic Info Management permissions
  EMPLOYEE_CREATE: {
    name: "employee:create",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  EMPLOYEE_READ: {
    name: "employee:read",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  EMPLOYEE_UPDATE: {
    name: "employee:update",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  EMPLOYEE_DELETE: {
    name: "employee:delete",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  DEPARTMENT_CREATE: {
    name: "department:create",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  DEPARTMENT_READ: {
    name: "department:read",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  DEPARTMENT_UPDATE: {
    name: "department:update",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  DEPARTMENT_DELETE: {
    name: "department:delete",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  COMPANY_INFO_READ: {
    name: "company-info:read",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  COMPANY_INFO_UPDATE: {
    name: "company-info:update",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  COMPANY_INFO_CREATE: {
    name: "company-info:create",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  COMPANY_INFO_LOGO_CREATE: {
    name: "company-info-logo:create",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  APPUSER_CREATE: {
    name: "appUser:create",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  APPUSER_READ: {
    name: "appUser:read",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  APPUSER_UPDATE: {
    name: "appUser:update",
    roleId: roleIds.basicInfoManagementRoleId,
  },
  APPUSER_DELETE: {
    name: "appUser:delete",
    roleId: roleIds.basicInfoManagementRoleId,
  },

  // Storage Management permissions
  STORAGE_CREATE: {
    name: "storage:create",
    roleId: roleIds.storageManagementRoleId,
  },
  STORAGE_READ: {
    name: "storage:read",
    roleId: roleIds.storageManagementRoleId,
  },
  STORAGE_UPDATE: {
    name: "storage:update",
    roleId: roleIds.storageManagementRoleId,
  },
  STORAGE_DELETE: {
    name: "storage:delete",
    roleId: roleIds.storageManagementRoleId,
  },
} as const;

// Ergonomic object for referencing permission names in code
export const PERMISSION_NAMES = Object.fromEntries(
  Object.entries(PERMISSIONS).map(([k, v]) => [k, v.name])
) as { [K in keyof typeof PERMISSIONS]: (typeof PERMISSIONS)[K]["name"] };

export type Permission =
  (typeof PERMISSION_NAMES)[keyof typeof PERMISSION_NAMES];

export async function syncPermissionsToDB() {
  // Always use the code-defined permissions as the source of truth:
  // 1. Delete all existing permissions
  await db.delete(permissionsTable);

  // 2. Insert all permissions from the code object
  for (const perm of Object.values(PERMISSIONS)) {
    await db.insert(permissionsTable).values({
      name: perm.name,
      roleId: perm.roleId,
    });
  }
}
