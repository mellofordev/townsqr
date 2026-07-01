import type { HeroIcon } from "./ui.ts";

export type AppbarNavItem = {
  id: string;
  label: string;
  to: "/" | "/notifications" | "/chat";
  icon: HeroIcon;
  badgeLabel?: string;
};

export type AppbarUserStatus = "online" | "away" | "offline";

export type AppbarUser = {
  name: string;
  imageUrl?: string;
  status?: AppbarUserStatus;
};

export type SidesheetNavItem = {
  id: string;
  label: string;
  to: "/" | "/knowledge" | "/resources";
  icon: HeroIcon;
  badge?: string | number;
};

export type SidesheetChannel = {
  id: string;
  name: string;
  unreadCount?: number;
};
