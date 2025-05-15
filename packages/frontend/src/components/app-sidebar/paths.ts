import {
  Delete,
  Home,
  Inbox,
  LucideBadgePlus,
  LucideFileLock2,
  LucideHandshake,
  LucideLandmark,
  LucideMonitorPlay,
  LucideRocket,
  LucideRows4,
  LucideUserLock,
  LucideUserRoundCog,
  RefreshCcw,
} from "lucide-react";

import { RoleName } from "@myapp/shared";
import { RegisteredRouter, ValidateLinkOptions } from "@tanstack/react-router";

export interface NavItemBase {
  title: string;
  icon: React.ComponentType;
  basePath: string;
  roleNames: RoleName[];
}

// Case 1: Has linkOptions but NO subs
export interface NavItemWithLink<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> extends NavItemBase {
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  subs?: never;
}

// Case 2: Has subs but NO linkOptions
export interface NavItemWithSubs<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> extends NavItemBase {
  linkOptions?: never; // Ensures linkOptions cannot be provided
  subs: Array<SubNavItem<TRouter, TOptions>>;
}

// Final NavItem type (either WithLink or WithSubs)
export type NavItem<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> = NavItemWithLink<TRouter, TOptions> | NavItemWithSubs<TRouter, TOptions>;

// Sub-item type (linkOptions required)
export interface SubNavItem<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  title: string;
  icon: React.ComponentType;
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
}

export interface NavigationProps {
  show: boolean;
  label: string;
  items: Array<NavItem>;
}

export const paths = {
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
          title: "App/機台操作權限",
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
      basePath: "/customers/summary",
      linkOptions: {
        to: "/customers/summary",
      },
      icon: LucideRows4,
      roleNames: ["BasicInfoManagement", "AdminManagement"],
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
      title: "Create",
      basePath: "/production/create",
      linkOptions: {
        to: "/production/create",
      },
      icon: Home,
      roleNames: ["ProductionManagement", "AdminManagement"],
    },
    {
      title: "Read",
      basePath: "/production/read",
      linkOptions: {
        to: "/production/read",
      },
      icon: Inbox,
      roleNames: ["ProductionManagement", "AdminManagement"],
    },
    {
      title: "Update",
      basePath: "/production/update",
      linkOptions: {
        to: "/production/update",
      },
      icon: RefreshCcw,
      roleNames: ["ProductionManagement", "AdminManagement"],
    },
    {
      title: "Delete",
      basePath: "/production/delete",
      linkOptions: {
        to: "/production/delete",
      },
      icon: Delete,
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
} satisfies Record<string, NavItem[]>;
