import { CollapsibleSidebarMenu } from "@/components/app-sidebar/collapsible-sidebar-menu";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

import { isAllowed } from "@/lib/utils";
import { roleNameEnum } from "../../../../backend/src/db/schema";
import { User } from "../../../../backend/src/trpc/router";
import { paths } from "@/components/app-sidebar/paths";

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
          items={paths.basicInfoRoutes}
        />

        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[2]],
            user.roles
          )}
          label={"客戶管理"}
          items={paths.customerRoutes}
        />

        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[3]],
            user.roles
          )}
          label={"倉庫管理"}
          items={paths.storageRoutes}
        />
        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[4]],
            user.roles
          )}
          label={"生產管理"}
          items={paths.productionRoutes}
        />
      </SidebarContent>
    </Sidebar>
  );
}
