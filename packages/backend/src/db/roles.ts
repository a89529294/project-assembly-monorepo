// Centralized role IDs for use in permissions and seeding
import { randomUUID } from "crypto";

export const roleIds = {
  adminRoleId: randomUUID(),
  basicInfoManagementRoleId: randomUUID(),
  personnelPermissionManagementRoleId: randomUUID(),
  storageManagementRoleId: randomUUID(),
  productionManagementRoleId: randomUUID(),
};
