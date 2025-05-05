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

export interface NavItem<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  title: string;
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  icon: React.ComponentType;
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
      linkOptions: {
        to: "/basic-info/company-info",
      },
      icon: Home,
    },
    {
      title: "員工資料",
      linkOptions: {
        to: "/basic-info/employees",
      },
      icon: LucideUserRoundCog,
    },
    {
      title: "人事權限",
      linkOptions: {
        to: "/basic-info/erp-permissions/users",
      },
      icon: LucideUserLock,
    },
  ],
  productionRoutes: [
    {
      title: "Create",
      linkOptions: {
        to: "/production/create",
      },
      icon: Home,
    },
    {
      title: "Read",
      linkOptions: {
        to: "/production/read",
      },
      icon: Inbox,
    },
    {
      title: "Update",
      linkOptions: {
        to: "/production/update",
      },
      icon: RefreshCcw,
    },
    {
      title: "Delete",
      linkOptions: {
        to: "/production/delete",
      },
      icon: Delete,
    },
  ],
  customerRoutes: [
    {
      title: "Create",
      linkOptions: {
        to: "/personnel/create",
      },
      icon: Home,
    },
    {
      title: "Read",
      linkOptions: {
        to: "/personnel/read",
      },
      icon: Inbox,
    },
    {
      title: "Update",
      linkOptions: {
        to: "/personnel/update",
      },
      icon: RefreshCcw,
    },
    {
      title: "Delete",
      linkOptions: {
        to: "/personnel/delete",
      },
      icon: Delete,
    },
    {
      title: "App Users",
      linkOptions: {
        to: "/personnel/app-users",
      },
      icon: LucideUser,
    },
  ],
  storageRoutes: [
    {
      title: "Create",
      linkOptions: {
        to: "/storage/create",
      },
      icon: Home,
    },
    {
      title: "Read",
      linkOptions: {
        to: "/storage/read",
      },
      icon: Inbox,
    },
    {
      title: "Update",
      linkOptions: {
        to: "/storage/update",
      },
      icon: RefreshCcw,
    },
    {
      title: "Delete",
      linkOptions: {
        to: "/storage/delete",
      },
      icon: Delete,
    },
  ],
} satisfies Record<string, NavItem[]>;
