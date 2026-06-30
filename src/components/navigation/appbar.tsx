import {
  BellIcon,
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "#/components/ui/sidebar.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip.tsx";
import { cn } from "#/lib/utils.ts";

export type AppbarNavItem = {
  id: string;
  label: string;
  to: "/" | "/notifications" | "/chat";
  icon: HeroIcon;
  badgeLabel?: string;
};

type HeroIcon = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

export type AppbarUser = {
  name: string;
  imageUrl?: string;
  status?: "online" | "away" | "offline";
};

const defaultAppbarItems: AppbarNavItem[] = [
  {
    id: "home",
    label: "Home",
    to: "/",
    icon: HomeIcon,
  },
  {
    id: "notifications",
    label: "Notifications",
    to: "/notifications",
    icon: BellIcon,
  },
  {
    id: "chat",
    label: "Chat",
    to: "/chat",
    icon: ChatBubbleLeftRightIcon,
  },
];

const statusClassName: Record<NonNullable<AppbarUser["status"]>, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground",
};

type AppbarProps = {
  activeItem?: string;
  className?: string;
  items?: AppbarNavItem[];
  user?: AppbarUser;
};

export function Appbar({
  activeItem = "home",
  className,
  items = defaultAppbarItems,
  user = { name: "TownSqr Member", status: "online" },
}: AppbarProps) {
  const userInitials = getInitials(user.name);
  const status = user.status ?? "offline";

  return (
    <TooltipProvider>
      <SidebarProvider
        className="min-h-svh w-auto flex-none"
        style={
          {
            "--sidebar-width": "4.75rem",
            "--sidebar-width-icon": "4.75rem",
          } as React.CSSProperties
        }
      >
        <Sidebar
          className={cn("border-r border-sidebar-border bg-white", className)}
          collapsible="none"
        >
          <SidebarHeader className="items-center px-2 py-3">
            <Button aria-label="TownSqr" asChild size="icon" variant="ghost">
              <Link to="/">
                <BuildingOffice2Icon className="size-5" />
              </Link>
            </Button>
          </SidebarHeader>

          <SidebarContent className="items-center px-2">
            <SidebarGroup className="p-0">
              <SidebarGroupContent>
                <SidebarMenu className="items-center gap-3">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === activeItem;

                    return (
                      <SidebarMenuItem key={item.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              aria-current={isActive ? "page" : undefined}
                              aria-label={item.label}
                              asChild
                              size="icon"
                              variant="ghost"
                            >
                              <Link to={item.to}>
                                <Icon
                                  className={cn(
                                    "size-5 text-muted-foreground",
                                    isActive && "text-foreground",
                                  )}
                                />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                            {item.badgeLabel ? (
                              <span className="text-background/70">
                                {item.badgeLabel}
                              </span>
                            ) : null}
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="items-center px-2 py-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={user.name}
                  className="relative size-11 rounded-2xl p-0"
                  size="icon"
                  variant="ghost"
                >
                  {user.imageUrl ? (
                    <img
                      alt=""
                      className="size-9 rounded-full object-cover"
                      src={user.imageUrl}
                    />
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                      {userInitials}
                    </span>
                  )}
                  <span
                    className={cn(
                      "right-1 bottom-1 absolute size-2.5 rounded-full border-2 border-sidebar",
                      statusClassName[status],
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{user.name}</TooltipContent>
            </Tooltip>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function getInitials(name: string) {
  const [first = "T", second] = name.trim().split(/\s+/);

  return `${first[0] ?? "T"}${second?.[0] ?? ""}`.toUpperCase();
}
