// Centralized role IDs for use in permissions and seeding
import { randomUUID } from "crypto";

export const roleIds = {
  adminRoleId: randomUUID(),
  productionManagementRoleId: randomUUID(),
  customerManagementRoleId: randomUUID(),
  basicInfoManagementRoleId: randomUUID(),
  storageManagementRoleId: randomUUID(),
};
