import { pgEnum } from "drizzle-orm/pg-core";

export const PROJECT_ASSEMBLY_CHANGE_STATUS = [
  "CREATED",
  "UPDATED",
  "DELETED",
  "",
] as const;

export const projectAssemblyChangeStatusEnum = pgEnum(
  "project_assembly_change_status",
  PROJECT_ASSEMBLY_CHANGE_STATUS
);

export const PROJECT_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const projectStatusEnum = pgEnum("project_status", PROJECT_STATUSES);

export const projectStatusToLabel = (
  status: (typeof PROJECT_STATUSES)[number]
) =>
  ({
    pending: "待處理",
    in_progress: "進行中",
    completed: "已完成",
    cancelled: "已取消",
  })[status];

export const BOM_PROCESS_STATUS = [
  "waiting",
  "processing",
  "done",
  "failed",
] as const;

export const bomProcessStatusEnum = pgEnum(
  "bom_process_status",
  BOM_PROCESS_STATUS
);

export type BomProcessStatus = (typeof BOM_PROCESS_STATUS)[number];

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const APP_PERMISSIONS = [
  "man-production", // production management
  "ctr-gdstd", // GD-STD operations
  "monitor-weight", // real-time monitoring
] as const;

export const appPermissionEnum = pgEnum("app_permission", APP_PERMISSIONS);

// Define enum for management types
export const roleNameEnum = pgEnum("role_name", [
  "AdminManagement",
  "BasicInfoManagement", // 基本資料
  "PersonnelPermissionManagement", // 人事權限
  "StorageManagement", // 倉管管理
  "ProductionManagement", // 生產管理
]);

export type RoleName = (typeof roleNameEnum.enumValues)[number];
