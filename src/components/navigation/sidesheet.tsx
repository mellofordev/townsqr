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
  SidebarSeparator,
} from "#/components/ui/sidebar.tsx";
import { cn } from "#/lib/utils.ts";

export type SidesheetNavItem = {
  id: string;
  label: string;
  to: "/" | "/knowledge" | "/resources";
  icon: HeroIcon;
  badge?: string | number;
};

type HeroIcon = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
    title?: string;
    titleId?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

export type SidesheetChannel = {
  id: string;
  name: string;
  unreadCount?: number;
  tone?: "default" | "news" | "team" | "support" | "admin";
};

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

const defaultChannels: SidesheetChannel[] = [
  {
    id: "company-news",
    name: "Company News",
    unreadCount: 8,
    tone: "news",
  },
  {
    id: "announcements",
    name: "Announcements",
    unreadCount: 2,
    tone: "admin",
  },
  {
    id: "people-ops",
    name: "People Ops",
    tone: "team",
  },
  {
    id: "engineering",
    name: "Engineering",
    unreadCount: 4,
    tone: "team",
  },
  {
    id: "support-desk",
    name: "Support Desk",
    tone: "support",
  },
];

const channelToneClassName: Record<
  NonNullable<SidesheetChannel["tone"]>,
  string
> = {
  default: "bg-muted-foreground/20 text-muted-foreground",
  news: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  team: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  support: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  admin: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

type SidesheetProps = {
  activeChannel?: string;
  activeItem?: string;
  channels?: SidesheetChannel[];
  className?: string;
  navItems?: SidesheetNavItem[];
  onCreateChannel?: () => void;
  workspaceName?: string;
};

export function Sidesheet({
  activeChannel = "company-news",
  activeItem = "feed",
  channels = defaultChannels,
  className,
  navItems = defaultNavItems,
  onCreateChannel,
  workspaceName = "TownSqr HQ",
}: SidesheetProps) {
  return (
    <SidebarProvider
      className="min-h-svh w-auto flex-none"
      style={
        {
          "--sidebar-width": "18.5rem",
          "--sidebar-width-icon": "18.5rem",
        } as React.CSSProperties
      }
    >
      <Sidebar
        aria-label={`${workspaceName} navigation`}
        className={cn("border-r border-sidebar-border bg-white", className)}
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

        <SidebarContent>
          <SidebarGroup>
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

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Channels</SidebarGroupLabel>
            <SidebarGroupAction
              aria-label="Create channel"
              onClick={onCreateChannel}
              type="button"
            >
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent>
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
                          <span
                            className={cn(
                              "flex size-6 items-center justify-center rounded-lg",
                              channelToneClassName[channel.tone ?? "default"],
                            )}
                          >
                            <HashtagIcon className="size-3.5" />
                          </span>
                          <span>{channel.name}</span>
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
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="rounded-2xl border border-sidebar-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">24</span> members
            online
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
