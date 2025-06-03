import { CollapsibleSidebarMenu } from "@/components/app-sidebar/collapsible-sidebar-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { genPaths } from "@/components/app-sidebar/paths";
import { isAllowed } from "@/lib/utils";
import { Route as CustomerDetailsRoute } from "@/routes/_dashboard/customers/$customerId/index";
// import { Route as CustomerProjectsRoute } from "@/routes/_dashboard/customers/$customerId/projects/";
// import { Route as CustomerProjectsCreateRoute } from "@/routes/_dashboard/customers/$customerId/projects/create";
import { Route as ProjectDetailsRoute } from "@/routes/_dashboard/customers/$customerId/projects/$projectId";
import { useMatch } from "@tanstack/react-router";
import { roleNameEnum } from "../../../../backend/src/db/schema";
import { User } from "../../../../backend/src/trpc/router";
import { Burger } from "@/components/burger";

export function AppSidebar({ user }: { user: User }) {
  const match1 = useMatch({
    from: CustomerDetailsRoute.id,
    // strict: true,
    shouldThrow: false,
  });
  // const match2 = useMatch({
  //   from: CustomerProjectsRoute.id,
  //   shouldThrow: false,
  // });
  // const match3 = useMatch({
  //   from: CustomerProjectsCreateRoute.id,
  //   shouldThrow: false,
  // });
  const match4 = useMatch({
    from: ProjectDetailsRoute.id,
    shouldThrow: false,
  });

  const customerId = match1?.params.customerId;
  // const showCustomerSubRoutes = !!(match1 || match2 || match3 || match4);

  const matchBasicInfo = !!useMatch({
    from: "/_dashboard/basic-info",
    shouldThrow: false,
  });

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="h-20 bg-secondary-900 pl-6 pr-5 flex-row justify-between items-center relative">
        <Burger />
        <div className="flex items-center gap-1 text-surface-0 font-bold">
          <img src="/logo.png" />
          俐煒機械
        </div>

        <div className="absolute right-0 h-6 top-1/2 -translate-y-1/2 border-r border-surface-0" />
      </SidebarHeader>
      <SidebarContent className="">
        <CollapsibleSidebarMenu
          show={isAllowed(
            [
              roleNameEnum.enumValues[0],
              roleNameEnum.enumValues[1],
              roleNameEnum.enumValues[2],
            ],
            user.roles
          )}
          label={"設定"}
          iconSrc="/sidebar/settings.png"
          items={
            genPaths({ customerId, projectsRouteExact: !match4 })
              .basicInfoRoutes
          }
          active={matchBasicInfo}
        />

        {/* <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[1]],
            user.roles
          )}
          label={"客戶管理"}
          items={
            genPaths({ customerId, projectsRouteExact: !match4 }).customerRoutes
          }
          showSubItems={showCustomerSubRoutes}
        />

        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[3]],
            user.roles
          )}
          label={"倉庫管理"}
          items={
            genPaths({ customerId, projectsRouteExact: !match4 }).storageRoutes
          }
        />
        <CollapsibleSidebarMenu
          show={isAllowed(
            [roleNameEnum.enumValues[0], roleNameEnum.enumValues[4]],
            user.roles
          )}
          label={"生產管理"}
          items={
            genPaths({ customerId, projectsRouteExact: !match4 })
              .productionRoutes
          }
        /> */}
      </SidebarContent>
    </Sidebar>
  );
}
