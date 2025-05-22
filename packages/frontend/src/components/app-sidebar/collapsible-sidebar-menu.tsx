import { ChevronDown } from "lucide-react";

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
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/use-auth";
import { RoleName } from "@myapp/shared";

interface NavigationProps {
  show: boolean;
  label: string;
  items: Array<NavItem>;
  showSubItems?: boolean;
  exact?: boolean;
}

export function CollapsibleSidebarMenu({
  show,
  label,
  items,
  showSubItems,
  exact,
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

  // TODO: figure out a better way to handle this, i know user must exist but i need to tell TS
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
          <SidebarGroupLabel asChild className="text-base">
            <CollapsibleTrigger>
              {label}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(
                  (item) =>
                    showLink(item.roleNames) && (
                      <SidebarMenuItem key={item.title}>
                        {/* Main item with link if linkOptions exists */}
                        <SidebarMenuButton asChild={!!item.linkOptions}>
                          {item.linkOptions ? (
                            <Link
                              to={item.linkOptions.to}
                              className="[&.active]:font-bold"
                            >
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          ) : (
                            <>
                              <item.icon />
                              <span>{item.title}</span>
                            </>
                          )}
                        </SidebarMenuButton>

                        {/* Sub items if they exist */}
                        {!!item.subs && (
                          <SidebarMenuSub>
                            <SubCollapsible
                              item={item}
                              showSubItems={showSubItems}
                              exact={exact}
                            />
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    )
                )}
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
  exact,
}: {
  item: NavItem;
  showSubItems?: boolean;
  exact?: boolean;
}) {
  return (
    <Collapsible open={showSubItems}>
      <CollapsibleContent>
        {item.subs!.map((sub) => (
          <SidebarMenuSubItem key={sub.title}>
            <SidebarMenuSubButton asChild>
              <Link
                to={sub.linkOptions.to}
                className="[&.active]:font-bold"
                activeOptions={{ exact, includeSearch: false }}
              >
                <sub.icon />
                <span>{sub.title}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
