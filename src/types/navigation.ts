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
	to:
		| "/"
		| "/knowledge"
		| "/resources"
		| "/notifications"
		| "/notifications/announcements"
		| "/notifications/channels/$channelId"
		| "/notifications/mentions"
		| "/notifications/unread"
		| "/chat"
		| "/chat/direct"
		| "/chat/dm/$memberId"
		| "/settings"
		| "/settings/channels"
		| "/settings/members"
		| "/settings/organization"
		| "/channels/$channelId";
	icon?: HeroIcon;
	badge?: string | number;
	initials?: string;
	params?: Record<string, string>;
};

export type SidesheetChannel = {
	id: string;
	name: string;
	unreadCount?: number;
};

export type SidesheetSection = {
	id: string;
	label: string;
	items: SidesheetNavItem[];
	scrollable?: boolean;
	action?: {
		label: string;
		icon: HeroIcon;
		onClick?: () => void;
	};
};
