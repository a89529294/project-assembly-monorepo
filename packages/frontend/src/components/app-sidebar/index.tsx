import {
  Delete,
  Home,
  Inbox,
  LucideUser,
  LucideUserRoundCog,
  RefreshCcw,
} from "lucide-react";

import { CollapsibleSidebarMenu } from "@/components/app-sidebar/collapsible-sidebar-menu";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

import { isAllowed } from "@/lib/utils";
import { roleNameEnum } from "../../../../backend/src/db/schema";
import { User } from "../../../../backend/src/trpc/router";

const basicInfoRoutes = [
  {
    title: "公司資料",
    url: "/basic-info/company-info",
    icon: Home,
  },
  {
    title: "員工資料",
    url: "/basic-info/employees",
    icon: LucideUserRoundCog,
  },
];
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
const customerRoutes = [
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
    icon: LucideUser,
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

export function AppSidebar({ user }: { user: User }) {
  return (
    <Sidebar>
      <SidebarContent>
        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[1]],
            user.roles
          )}
          label={"設定"}
          items={basicInfoRoutes}
        />

        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[2]],
            user.roles
          )}
          label={"客戶管理"}
          items={customerRoutes}
        />

        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[3]],
            user.roles
          )}
          label={"倉庫管理"}
          items={storageRoutes}
        />
        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[4]],
            user.roles
          )}
          label={"生產管理"}
          items={productionRoutes}
        />
      </SidebarContent>
    </Sidebar>
  );
}
