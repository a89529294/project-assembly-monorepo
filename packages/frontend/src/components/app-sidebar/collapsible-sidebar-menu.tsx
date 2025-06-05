import { ChevronDown } from "lucide-react";

import { useAuth } from "@/auth/use-auth";
import { NavItem } from "@/components/app-sidebar/paths";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { RoleName } from "@myapp/shared";
import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface NavigationProps {
  show: boolean;
  iconSrc: string;
  label: string;
  items: Array<NavItem>;
  showSubItems?: boolean;
  active: boolean;
}

export function CollapsibleSidebarMenu({
  show,
  iconSrc,
  label,
  items,
  showSubItems,
  active,
}: NavigationProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { location } = useRouterState({ select: (s) => s });

  // collapse or expand menu depending on current location
  useEffect(() => {
    const x = !!items.find((item) =>
      location.pathname.startsWith(item.basePath)
    );

    if (x) setOpen(true);
    else setOpen(false);
  }, [location, items]);

  if (!user) return null;

  const showLink = (roleNames: RoleName[]) =>
    user.roles
      .map((v) => v.name)
      .find((userRoleName) => roleNames.includes(userRoleName)) !== undefined;

  return (
    show && (
      <Collapsible
        open={open}
        onOpenChange={(s) => {
          setOpen(s);
        }}
        className="group/collapsible"
      >
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "h-auto py-3 pl-5 pr-3 bg-primary-300 rounded-none",
              active && "bg-secondary-800"
            )}
          >
            <CollapsibleTrigger className="flex justify-between w-full items-center">
              <div className={cn("flex gap-2 items-center  ")}>
                <div className="size-8 rounded-full bg-primary-300 grid place-items-center">
                  <img className="size-6" src={iconSrc} />
                </div>
                <div
                  className={cn(
                    "text-button-sm-active text-secondary-900",
                    active && "text-primary-300"
                  )}
                >
                  {label}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "text-secondary-900 transition-transform group-data-[state=open]/collapsible:rotate-180",
                  active && "text-primary-300"
                )}
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {items.map((item) => {
                  return (
                    showLink(item.roleNames) && (
                      <SidebarMenuItem key={item.title}>
                        {/* Main item with link if linkOptions exists */}
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "flex py-3.5 pl-7 h-auto rounded-none text-button-sm [&.active]:text-button-sm-active font-inter gap-4",
                            location.pathname.startsWith(item.basePath)
                              ? "bg-secondary-800 hover:bg-secondary-800!"
                              : "bg-secondary-700 hover:bg-secondary-700!"
                          )}
                        >
                          {item.linkOptions ? (
                            <Link
                              to={item.linkOptions.to}
                              className={cn(
                                "text-button-sm [&.active]:text-button-sm-active"
                              )}
                            >
                              <item.icon
                                stroke={
                                  location.pathname.startsWith(item.basePath)
                                    ? "var(--color-primary-300)"
                                    : "white"
                                }
                              />

                              <span
                                className={
                                  location.pathname.startsWith(item.basePath)
                                    ? "text-primary-300 hover:text-primary-300"
                                    : "text-surface-0 hover:text-surface-0"
                                }
                              >
                                {item.title}
                              </span>
                            </Link>
                          ) : (
                            <div>
                              <item.icon
                                stroke={
                                  location.pathname.startsWith(item.basePath)
                                    ? "var(--color-primary-300)"
                                    : "white"
                                }
                              />

                              <span
                                className={
                                  location.pathname.startsWith(item.basePath)
                                    ? "text-primary-300 hover:text-primary-300"
                                    : "text-surface-0 hover:text-surface-0"
                                }
                              >
                                {item.title}
                              </span>
                            </div>
                          )}
                        </SidebarMenuButton>

                        {/* Sub items if they exist */}
                        {!!item.subs && (
                          <SidebarMenuSub className="mx-0 border-surface-0 p-0 border-none translate-0">
                            <SubCollapsible
                              item={item}
                              showSubItems={showSubItems}
                            />
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    )
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    )
  );
}

function SubCollapsible({
  item,
  showSubItems = true,
}: {
  item: NavItem;
  showSubItems?: boolean;
}) {
  const matches = useMatches();
  const closestMatch = matches.at(-1);
  console.log(closestMatch?.routeId);

  const x =
    "/" +
    closestMatch?.routeId
      .split("/")
      .filter((v) => v !== "" && v !== "_dashboard")
      .join("/");

  return (
    <Collapsible open={showSubItems}>
      <CollapsibleContent>
        {item.subs!.map((sub) => {
          return (
            <SidebarMenuSubItem key={sub.title}>
              <SidebarMenuSubButton asChild>
                <Link
                  to={sub.linkOptions.to}
                  className={cn(
                    " pl-[35.5px] bg-secondary-700 rounded-none translate-x-0 h-auto active:text-primary-300! [&:active>div]:border-primary-300",
                    x === sub.linkOptions.to
                      ? "bg-secondary-800 hover:bg-secondary-800! text-primary-300!"
                      : "bg-secondary-700 hover:bg-secondary-700! text-surface-0 hover:text-surface-0"
                  )}
                  activeOptions={{ exact: sub.exact, includeSearch: false }}
                >
                  <div
                    className={cn(
                      "border-l pl-[23.5px] py-3.5  h-full",
                      x === sub.linkOptions.to && "border-primary-300"
                    )}
                  >
                    {sub.title}
                  </div>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
