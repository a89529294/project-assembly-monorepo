import { ChevronDown } from "lucide-react";

import { NavigationProps } from "@/components/app-sidebar/paths";
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
} from "@/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function CollapsibleSidebarMenu({
  show,
  label,
  items,
}: NavigationProps) {
  const [open, setOpen] = useState(false);
  const { location } = useRouterState({ select: (s) => s });

  // collapse or expand menu depending on current location
  useEffect(() => {
    const x = !!items.find((item) =>
      location.pathname.startsWith(item.linkOptions.to)
    );

    if (x) setOpen(true);
    else setOpen(false);
  }, [location]);

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
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger>
              {label}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.linkOptions.to}
                        className="[&.active]:font-bold"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    )
  );
}
