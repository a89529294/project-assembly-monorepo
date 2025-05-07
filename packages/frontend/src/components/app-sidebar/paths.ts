import {
  Delete,
  Home,
  Inbox,
  LucideUser,
  LucideUserLock,
  LucideUserRoundCog,
  RefreshCcw,
} from "lucide-react";

import { RegisteredRouter, ValidateLinkOptions } from "@tanstack/react-router";

export interface NavItemBase {
  title: string;
  icon: React.ComponentType;
  basePath: string;
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
    },
    {
      title: "員工資料",
      basePath: "/basic-info/employees",
      linkOptions: {
        to: "/basic-info/employees",
      },
      icon: LucideUserRoundCog,
    },
    {
      title: "人事權限",
      basePath: "/basic-info/erp-permissions",
      subs: [
        {
          title: "ERP操作權限",
          linkOptions: {
            to: "/basic-info/erp-permissions/users",
          },
          icon: LucideUserRoundCog,
        },
        {
          title: "ERP功能權限",
          linkOptions: {
            to: "/basic-info/erp-permissions/roles",
          },
          icon: LucideUserLock,
        },
      ],
      icon: LucideUserLock,
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
    },
    {
      title: "Read",
      basePath: "/production/read",
      linkOptions: {
        to: "/production/read",
      },
      icon: Inbox,
    },
    {
      title: "Update",
      basePath: "/production/update",
      linkOptions: {
        to: "/production/update",
      },
      icon: RefreshCcw,
    },
    {
      title: "Delete",
      basePath: "/production/delete",
      linkOptions: {
        to: "/production/delete",
      },
      icon: Delete,
    },
  ],
  customerRoutes: [
    {
      title: "Create",
      basePath: "/customer/create",
      linkOptions: {
        to: "/personnel/create",
      },
      icon: Home,
    },
    {
      title: "Read",
      basePath: "/customer/read",
      linkOptions: {
        to: "/personnel/read",
      },
      icon: Inbox,
    },
    {
      title: "Update",
      basePath: "/customer/update",
      linkOptions: {
        to: "/personnel/update",
      },
      icon: RefreshCcw,
    },
    {
      title: "Delete",
      basePath: "/customer/delete",
      linkOptions: {
        to: "/personnel/delete",
      },
      icon: Delete,
    },
    {
      title: "App Users",
      basePath: "/customer/app-users",
      linkOptions: {
        to: "/personnel/app-users",
      },
      icon: LucideUser,
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
    },
    {
      title: "Read",
      basePath: "/storage/read",
      linkOptions: {
        to: "/storage/read",
      },
      icon: Inbox,
    },
    {
      title: "Update",
      basePath: "/storage/update",
      linkOptions: {
        to: "/storage/update",
      },
      icon: RefreshCcw,
    },
    {
      title: "Delete",
      basePath: "/storage/delete",
      linkOptions: {
        to: "/storage/delete",
      },
      icon: Delete,
    },
  ],
} satisfies Record<string, NavItem[]>;
