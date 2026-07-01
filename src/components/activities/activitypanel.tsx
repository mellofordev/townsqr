import {
  CakeIcon,
  CalendarDaysIcon,
  HandThumbUpIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "#/components/ui/sidebar.tsx";
import { cn } from "#/lib/utils.ts";
import type {
  ActivitySummaryItem,
  HeroIcon,
  TrendingActivityItem,
} from "#/types/index.ts";

export type {
  ActivitySummaryItem,
  TrendingActivityItem,
} from "#/types/index.ts";

const defaultSummaryItems: ActivitySummaryItem[] = [
  {
    id: "event-invites",
    label: "Event Invites",
    count: 3,
    icon: CalendarDaysIcon,
  },
  {
    id: "work-anniversaries",
    label: "Work Anniversaries",
    count: 2,
    icon: CakeIcon,
  },
];

const defaultTrendingItems: TrendingActivityItem[] = [
  {
    id: "new-joiners",
    label: "Our New Joiners",
    count: "5.3k",
    reactions: ["celebrate", "love"],
  },
  {
    id: "sales-updates",
    label: "Sales Updates",
    count: "2.2k",
    reactions: ["like", "love"],
  },
  {
    id: "new-wfh-policy",
    label: "New WFH policy",
    count: "1.1k",
    reactions: ["celebrate", "like"],
  },
  {
    id: "market-expansions",
    label: "Market expansions",
    count: "746",
    reactions: ["love", "like"],
  },
  {
    id: "customer-feedback",
    label: "Customer Feedback",
    count: "553",
    reactions: ["like", "celebrate"],
  },
];

const reactionClassName: Record<
  TrendingActivityItem["reactions"][number],
  string
> = {
  celebrate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  like: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  love: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const reactionIcon = {
  celebrate: SparklesIcon,
  like: HandThumbUpIcon,
  love: HeartIcon,
} satisfies Record<TrendingActivityItem["reactions"][number], HeroIcon>;

type ActivityPanelProps = {
  className?: string;
  summaryItems?: ActivitySummaryItem[];
  trendingItems?: TrendingActivityItem[];
  unreadChats?: number;
};

export function ActivityPanel({
  className,
  summaryItems = defaultSummaryItems,
  trendingItems = defaultTrendingItems,
}: ActivityPanelProps) {
  return (
    <SidebarProvider
      className="h-svh min-h-0 w-auto flex-none overflow-hidden"
      style={
        {
          "--sidebar-width": "20rem",
          "--sidebar-width-icon": "20rem",
        } as React.CSSProperties
      }
    >
      <Sidebar
        className={cn(
          "h-svh min-h-0 border-l border-sidebar-border bg-white",
          className,
        )}
        collapsible="none"
        side="right"
      >
        <SidebarHeader className="gap-1 p-4">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h2 className="text-lg font-semibold tracking-normal">Activity</h2>
        </SidebarHeader>

        <SidebarContent className="overscroll-contain">
          <SidebarGroup>
            <SidebarGroupLabel>Events & Celebrations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {summaryItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton className="gap-3">
                        <Icon className="size-5 text-muted-foreground" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Trending Posts</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {trendingItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton className="gap-3">
                      <span className="-space-x-1 flex shrink-0 items-center">
                        {item.reactions.map((reaction) => {
                          const ReactionIcon = reactionIcon[reaction];

                          return (
                            <span
                              className={cn(
                                "flex size-5 items-center justify-center rounded-full border border-background",
                                reactionClassName[reaction],
                              )}
                              key={`${item.id}-${reaction}`}
                            >
                              <ReactionIcon className="size-3" />
                            </span>
                          );
                        })}
                      </span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
