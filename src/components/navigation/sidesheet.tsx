import {
  BookOpenIcon,
  BuildingLibraryIcon,
  HashtagIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "#/components/ui/sidebar.tsx";
import { cn } from "#/lib/utils.ts";
import type { SidesheetChannel, SidesheetNavItem } from "#/types/index.ts";

export type { SidesheetChannel, SidesheetNavItem } from "#/types/index.ts";

const defaultNavItems: SidesheetNavItem[] = [
  {
    id: "feed",
    label: "Feed",
    to: "/",
    icon: InboxIcon,
  },
  {
    id: "knowledge-library",
    label: "Knowledge Library",
    to: "/knowledge",
    icon: BuildingLibraryIcon,
  },
  {
    id: "resources",
    label: "Resources",
    to: "/resources",
    icon: BookOpenIcon,
  },
];

type SidesheetProps = {
  activeChannel?: string;
  activeItem?: string;
  channels: SidesheetChannel[];
  className?: string;
  memberCount?: number;
  navItems?: SidesheetNavItem[];
  onCreateChannel?: () => void;
  workspaceName?: string;
};

export function Sidesheet({
  activeChannel,
  activeItem = "feed",
  channels,
  className,
  memberCount = 24,
  navItems = defaultNavItems,
  onCreateChannel,
  workspaceName = "TownSqr HQ",
}: SidesheetProps) {
  return (
    <SidebarProvider
      className="h-svh min-h-0 w-auto flex-none overflow-hidden"
      style={
        {
          "--sidebar-width": "18.5rem",
          "--sidebar-width-icon": "18.5rem",
        } as React.CSSProperties
      }
    >
      <Sidebar
        aria-label={`${workspaceName} navigation`}
        className={cn(
          "h-svh min-h-0 border-r border-sidebar-border bg-white",
          className,
        )}
        collapsible="none"
      >
        <SidebarHeader className="gap-3 p-3 mt-0.5">
          <div className="relative">
            <MagnifyingGlassIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <SidebarInput
              aria-label="Search workspace"
              className="pl-9"
              placeholder="Search workspace"
              type="search"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <SidebarGroup className="shrink-0">
            <SidebarGroupLabel>Browse</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeItem;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="gap-3"
                      >
                        <Link
                          aria-current={isActive ? "page" : undefined}
                          to={item.to}
                        >
                          <Icon />
                          <span
                            className={cn(
                              "text-sm font-normal text-muted-foreground",
                              isActive && "text-foreground",
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="min-h-0 flex-1 pb-0">
            <SidebarGroupLabel>Channels</SidebarGroupLabel>
            <SidebarGroupAction
              aria-label="Create channel"
              onClick={onCreateChannel}
              type="button"
            >
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent className="relative min-h-0 flex-1">
              <div className="no-scrollbar h-full overflow-y-auto overscroll-contain pt-1 pb-5">
                <SidebarMenu>
                  {channels.map((channel) => {
                    const isActive = channel.id === activeChannel;

                    return (
                      <SidebarMenuItem key={channel.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link
                            aria-current={isActive ? "page" : undefined}
                            params={{ channelId: channel.id }}
                            to="/channels/$channelId"
                          >
                            <HashtagIcon className="size-3.5" />
                            <span
                              className={cn(
                                "text-sm font-normal text-muted-foreground",
                                isActive && "text-foreground",
                              )}
                            >
                              {channel.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                        {channel.unreadCount ? (
                          <SidebarMenuBadge>
                            {formatUnreadCount(channel.unreadCount)}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="rounded-2xl border border-sidebar-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{memberCount}</span>{" "}
            {memberCount === 1 ? "member" : "members"}
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

function formatUnreadCount(count: number) {
  if (count > 99) {
    return "99+";
  }

  return count;
}
