import { Home, Inbox, RefreshCcw, Delete, User } from "lucide-react";

import { CollapsibleSidebarMenu } from "@/components/app-sidebar/collapsible-sidebar-menu";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

import { isAllowed } from "@/lib/utils";
import { TrpcTypes } from "../../../../backend/src/trpc/router";

const productionRoutes = [
  {
    title: "Create",
    url: "/production/create",
    icon: Home,
  },
  {
    title: "Read",
    url: "/production/read",
    icon: Inbox,
  },
  {
    title: "Update",
    url: "/production/update",
    icon: RefreshCcw,
  },
  {
    title: "Delete",
    url: "/production/delete",
    icon: Delete,
  },
];
const personnelRoutes = [
  {
    title: "Create",
    url: "/personnel/create",
    icon: Home,
  },
  {
    title: "Read",
    url: "/personnel/read",
    icon: Inbox,
  },
  {
    title: "Update",
    url: "/personnel/update",
    icon: RefreshCcw,
  },
  {
    title: "Delete",
    url: "/personnel/delete",
    icon: Delete,
  },
  {
    title: "App Users",
    url: "/personnel/app-users",
    icon: User,
  },
];
const basicInfoRoutes = [
  {
    title: "Create",
    url: "/basic-info/create",
    icon: Home,
  },
  {
    title: "Read",
    url: "/basic-info/read",
    icon: Inbox,
  },
  {
    title: "Update",
    url: "/basic-info/update",
    icon: RefreshCcw,
  },
  {
    title: "Delete",
    url: "/basic-info/delete",
    icon: Delete,
  },
];
const storageRoutes = [
  {
    title: "Create",
    url: "/storage/create",
    icon: Home,
  },
  {
    title: "Read",
    url: "/storage/read",
    icon: Inbox,
  },
  {
    title: "Update",
    url: "/storage/update",
    icon: RefreshCcw,
  },
  {
    title: "Delete",
    url: "/storage/delete",
    icon: Delete,
  },
];

export function AppSidebar({ user }: { user: TrpcTypes["User"] }) {
  return (
    <Sidebar>
      <SidebarContent>
        <CollapsibleSidebarMenu
          show={isAllowed(
            ["ProductionManagement", "AdminManagement"],
            user.roles
          )}
          label={"生產管理"}
          items={productionRoutes}
        />
        <CollapsibleSidebarMenu
          show={isAllowed(
            ["PersonnelPermissionManagement", "AdminManagement"],
            user.roles
          )}
          label={"人事權限"}
          items={personnelRoutes}
        />
        <CollapsibleSidebarMenu
          show={isAllowed(
            ["BasicInfoManagement", "AdminManagement"],
            user.roles
          )}
          label={"基本資料"}
          items={basicInfoRoutes}
        />
        <CollapsibleSidebarMenu
          show={isAllowed(["StorageManagement", "AdminManagement"], user.roles)}
          label={"倉庫管理"}
          items={storageRoutes}
        />
      </SidebarContent>
    </Sidebar>
  );
}
