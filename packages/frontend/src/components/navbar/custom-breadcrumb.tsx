import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { router } from "@/router";
import { Link, useMatches } from "@tanstack/react-router";

type RouteIDs = keyof typeof router.routesById;
type RoutePaths = Exclude<keyof typeof router.routesByPath, "">;

const routeMap: Partial<
  Record<RouteIDs, { label: string; href?: RoutePaths }[]>
> = {
  "/_dashboard/basic-info/company-info": [
    {
      label: "設定",
    },
    {
      label: "公司資料",
    },
  ],
  "/_dashboard/basic-info/employees/": [
    {
      label: "設定",
    },
    {
      label: "員工資料",
    },
  ],
  "/_dashboard/basic-info/erp-permissions/departments": [
    {
      label: "設定",
    },
    {
      label: "人事權限",
    },
    {
      label: "部門管理",
    },
  ],
  "/_dashboard/basic-info/erp-permissions/users": [
    {
      label: "設定",
    },
    {
      label: "人事權限",
    },
    {
      label: "ERP操作權限",
    },
  ],
  "/_dashboard/basic-info/erp-permissions/roles": [
    {
      label: "設定",
    },
    {
      label: "人事權限",
    },
    {
      label: "ERP功能權限",
    },
  ],
  "/_dashboard/basic-info/erp-permissions/department-members": [
    {
      label: "設定",
    },
    {
      label: "人事權限",
    },
    {
      label: "ERP人員權限",
    },
  ],
  "/_dashboard/basic-info/erp-permissions/app-machine-permissions": [
    {
      label: "設定",
    },
    {
      label: "人事權限",
    },
    {
      label: "App-機台操作權限",
    },
  ],
  "/_dashboard/customers/summary": [
    {
      label: "客戶管理",
    },
    {
      label: "客戶列表",
    },
  ],
  "/_dashboard/customers/$customerId/": [
    {
      label: "客戶管理",
    },
    {
      label: "客戶列表",
      href: "/customers/summary",
    },
    {
      label: "客戶細節",
    },
  ],
  "/_dashboard/customers/$customerId/projects/": [
    {
      label: "客戶管理",
    },
    {
      label: "客戶列表",
      href: "/customers/summary",
    },
    {
      label: "客戶專案列表",
    },
  ],
  "/_dashboard/customers/$customerId/projects/create": [
    {
      label: "客戶管理",
    },
    {
      label: "客戶列表",
      href: "/customers/summary",
    },
    {
      label: "新增客戶專案",
    },
  ],
  "/_dashboard/customers/create": [
    {
      label: "客戶管理",
    },
    {
      label: "新增客戶",
    },
  ],
};

export function CustomBreadCrumb() {
  const matches = useMatches();
  const closestMatch = matches.at(-1);
  console.log(closestMatch);

  if (!closestMatch) return <div />;

  const crumbs = routeMap[closestMatch.routeId];

  console.log(crumbs);

  if (!crumbs) return <div />;

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-2">
        {crumbs.map((crumb, idx) => {
          if (idx !== crumbs.length - 1) {
            return (
              <>
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink className="hover:text-surface-100" asChild>
                      <Link to={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbLink className="hover:text-muted-foreground">
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <img src="/slash.png" />
                </BreadcrumbSeparator>
              </>
            );
          }

          return (
            <BreadcrumbItem>
              <BreadcrumbPage className="text-surface-0">
                {crumb.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
