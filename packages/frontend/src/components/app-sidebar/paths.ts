import {
  Delete,
  Home,
  Inbox,
  LucideBadgePlus,
  LucideFileLock2,
  LucideFilePlus,
  LucideHandshake,
  LucideLandmark,
  LucideList,
  LucideMonitorPlay,
  LucidePackageOpen,
  LucideRocket,
  LucideRows4,
  LucideTable2,
  LucideUserLock,
  LucideUserRoundCog,
  RefreshCcw,
} from "lucide-react";

import { RoleName } from "@myapp/shared";
import { RegisteredRouter, ValidateLinkOptions } from "@tanstack/react-router";

export interface NavItem<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  title: string;
  icon: React.ComponentType;
  basePath: string;
  roleNames: RoleName[];
  linkOptions?: ValidateLinkOptions<TRouter, TOptions>;
  subs?: Array<SubNavItem<TRouter, TOptions>>;
}

// Sub-item type (linkOptions required)
export interface SubNavItem<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  title: string;
  icon: React.ComponentType;
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  exact?: boolean;
}

// TODO clean up show sub route implementation

export const genPaths = ({
  customerId,
  projectsRouteExact,
}: {
  customerId?: string;
  projectsRouteExact: boolean;
}) =>
  ({
    basicInfoRoutes: [
      {
        title: "公司資料",
        basePath: "/basic-info/company-info",
        linkOptions: {
          to: "/basic-info/company-info",
        },
        icon: Home,
        roleNames: ["BasicInfoManagement", "AdminManagement"],
      },
      {
        title: "員工資料",
        basePath: "/basic-info/employees",
        linkOptions: {
          to: "/basic-info/employees",
        },
        icon: LucideUserRoundCog,
        roleNames: ["BasicInfoManagement", "AdminManagement"],
      },
      {
        title: "人事權限",
        basePath: "/basic-info/erp-permissions",
        roleNames: ["PersonnelPermissionManagement", "AdminManagement"],
        subs: [
          {
            title: "部門管理",
            linkOptions: {
              to: "/basic-info/erp-permissions/departments",
            },
            icon: LucideLandmark,
          },
          {
            title: "ERP操作權限",
            linkOptions: {
              to: "/basic-info/erp-permissions/users",
            },
            icon: LucideHandshake,
          },
          {
            title: "ERP功能權限",
            linkOptions: {
              to: "/basic-info/erp-permissions/roles",
            },
            icon: LucideRocket,
          },
          {
            title: "ERP人員權限",
            linkOptions: {
              to: "/basic-info/erp-permissions/department-members",
            },
            icon: LucideFileLock2,
          },
          {
            title: "App-機台操作權限",
            linkOptions: {
              to: "/basic-info/erp-permissions/app-machine-permissions",
            },
            icon: LucideMonitorPlay,
          },
        ],
        icon: LucideUserLock,
      },
    ],
    customerRoutes: [
      {
        title: "客戶列表",
        basePath: "/customers",
        linkOptions: {
          to: "/customers/summary",
        },
        icon: LucideRows4,
        roleNames: ["BasicInfoManagement", "AdminManagement"],
        subs: [
          {
            title: "客戶細節",
            linkOptions: {
              to: "/customers/$customerId",
              params: { customerId },
            },
            icon: LucideTable2,
            exact: true,
          } as unknown as SubNavItem,
          {
            title: "客戶專案列表",
            linkOptions: {
              to: "/customers/$customerId/projects",
              params: { customerId },
            },
            icon: LucidePackageOpen,
            exact: projectsRouteExact,
          } as unknown as SubNavItem,
          {
            title: "新增客戶專案",
            linkOptions: {
              to: "/customers/$customerId/projects/create",
              params: { customerId },
            },
            icon: LucideFilePlus,
            exact: true,
          } as unknown as SubNavItem,
        ],
      },
      {
        title: "新增客戶",
        basePath: "/customers/create",
        linkOptions: {
          to: "/customers/create",
        },
        icon: LucideBadgePlus,
        roleNames: ["BasicInfoManagement", "AdminManagement"],
      },
    ],
    productionRoutes: [
      {
        title: "專案列表",
        basePath: "/production",
        linkOptions: {
          to: "/production",
        },
        icon: LucideList,
        roleNames: ["ProductionManagement", "AdminManagement"],
      },
    ],
    storageRoutes: [
      {
        title: "Create",
        basePath: "/storage/create",
        linkOptions: {
          to: "/storage/create",
        },
        icon: Home,
        roleNames: ["ProductionManagement", "AdminManagement"],
      },
      {
        title: "Read",
        basePath: "/storage/read",
        linkOptions: {
          to: "/storage/read",
        },
        icon: Inbox,
        roleNames: ["ProductionManagement", "AdminManagement"],
      },
      {
        title: "Update",
        basePath: "/storage/update",
        linkOptions: {
          to: "/storage/update",
        },
        icon: RefreshCcw,
        roleNames: ["ProductionManagement", "AdminManagement"],
      },
      {
        title: "Delete",
        basePath: "/storage/delete",
        linkOptions: {
          to: "/storage/delete",
        },
        icon: Delete,
        roleNames: ["ProductionManagement", "AdminManagement"],
      },
    ],
  }) satisfies Record<string, NavItem[]>;
