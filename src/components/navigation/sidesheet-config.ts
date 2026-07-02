import {
	AtSymbolIcon,
	BellAlertIcon,
	BellIcon,
	BookOpenIcon,
	BuildingLibraryIcon,
	Cog6ToothIcon,
	HashtagIcon,
	InboxIcon,
	MegaphoneIcon,
	PlusIcon,
	UserGroupIcon,
	UserIcon,
} from "@heroicons/react/24/outline";

import type {
	SidesheetChannel,
	SidesheetSection,
	WorkspaceSummaryMember,
} from "#/types/index.ts";

type SidesheetMode = "home" | "notifications" | "chat" | "settings";
type SettingsSection = "organization" | "members" | "channels";

type SidesheetContentOptions = {
	channels: SidesheetChannel[];
	members: WorkspaceSummaryMember[];
	onCreateChannel?: () => void;
	pathname: string;
};

type SidesheetContent = {
	activeItem: string;
	footerLabel: string;
	footerValue: number;
	searchLabel: string;
	searchPlaceholder: string;
	sections: SidesheetSection[];
};

export function buildSidesheetContent({
	channels,
	members,
	onCreateChannel,
	pathname,
}: SidesheetContentOptions): SidesheetContent {
	const mode = getSidesheetMode(pathname);

	if (mode === "notifications") {
		return buildNotificationsSidesheet({ channels, pathname });
	}

	if (mode === "chat") {
		return buildChatSidesheet({ members, pathname });
	}

	if (mode === "settings") {
		return buildSettingsSidesheet({ channels, members, pathname });
	}

	return buildHomeSidesheet({ channels, members, onCreateChannel, pathname });
}

function buildHomeSidesheet({
	channels,
	members,
	onCreateChannel,
	pathname,
}: Pick<
	SidesheetContentOptions,
	"channels" | "members" | "onCreateChannel" | "pathname"
>) {
	const activeChannel = /^\/channels\/([^/]+)/.exec(pathname)?.[1];

	return {
		activeItem: activeChannel
			? `channel:${activeChannel}`
			: getActiveHomeItem(pathname),
		footerLabel: members.length === 1 ? "member" : "members",
		footerValue: members.length,
		searchLabel: "Search workspace",
		searchPlaceholder: "Search workspace",
		sections: [
			{
				id: "browse",
				label: "Browse",
				items: [
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
				],
			},
			{
				id: "channels",
				label: "Channels",
				scrollable: true,
				action: {
					label: "Create channel",
					icon: PlusIcon,
					onClick: onCreateChannel,
				},
				items: channels.map((channel) => ({
					id: `channel:${channel.id}`,
					label: channel.name,
					to: "/channels/$channelId",
					params: { channelId: channel.id },
					icon: HashtagIcon,
					badge: channel.unreadCount,
				})),
			},
		],
	} satisfies SidesheetContent;
}

function buildNotificationsSidesheet({
	channels,
	pathname,
}: Pick<SidesheetContentOptions, "channels" | "pathname">) {
	const activeChannel = /^\/notifications\/channels\/([^/]+)/.exec(
		pathname,
	)?.[1];
	const activeFilter = getActiveNotificationFilter(pathname);

	return {
		activeItem: activeChannel
			? `notification-channel:${activeChannel}`
			: `notification:${activeFilter}`,
		footerLabel: "notification views",
		footerValue: 4 + channels.length,
		searchLabel: "Search notifications",
		searchPlaceholder: "Search notifications",
		sections: [
			{
				id: "notification-filters",
				label: "Notifications",
				items: [
					{
						id: "notification:all",
						label: "All",
						to: "/notifications",
						icon: BellIcon,
					},
					{
						id: "notification:mentions",
						label: "Mentions",
						to: "/notifications/mentions",
						icon: AtSymbolIcon,
					},
					{
						id: "notification:announcements",
						label: "Announcements",
						to: "/notifications/announcements",
						icon: MegaphoneIcon,
					},
					{
						id: "notification:unread",
						label: "Unread",
						to: "/notifications/unread",
						icon: BellAlertIcon,
						badge: 3,
					},
				],
			},
			{
				id: "notification-channels",
				label: "Channels",
				scrollable: true,
				items: channels.map((channel) => ({
					id: `notification-channel:${channel.id}`,
					label: channel.name,
					to: "/notifications/channels/$channelId",
					params: { channelId: channel.id },
					icon: HashtagIcon,
					badge: channel.unreadCount,
				})),
			},
		],
	} satisfies SidesheetContent;
}

function buildChatSidesheet({
	members,
	pathname,
}: Pick<SidesheetContentOptions, "members" | "pathname">) {
	const activeDm = /^\/chat\/dm\/([^/]+)/.exec(pathname)?.[1];

	return {
		activeItem: activeDm
			? `dm:${activeDm}`
			: pathname.startsWith("/chat/direct")
				? "chat:direct-messages"
				: "chat:all",
		footerLabel: members.length === 1 ? "member" : "members",
		footerValue: members.length,
		searchLabel: "Search members",
		searchPlaceholder: "Search members",
		sections: [
			{
				id: "chat-browse",
				label: "Chat",
				items: [
					{
						id: "chat:all",
						label: "All conversations",
						to: "/chat",
						icon: InboxIcon,
					},
					{
						id: "chat:direct-messages",
						label: "Direct messages",
						to: "/chat/direct",
						icon: UserIcon,
					},
				],
			},
			{
				id: "direct-messages",
				label: "Members",
				scrollable: true,
				items: members.map((member) => ({
					id: `dm:${member.id}`,
					label: member.name,
					to: "/chat/dm/$memberId",
					params: { memberId: member.id },
					initials: getInitials(member.name),
				})),
			},
		],
	} satisfies SidesheetContent;
}

function buildSettingsSidesheet({
	channels,
	members,
	pathname,
}: Pick<SidesheetContentOptions, "channels" | "members" | "pathname">) {
	const activeSection = getActiveSettingsSection(pathname);

	return {
		activeItem: `settings:${activeSection}`,
		footerLabel: "settings areas",
		footerValue: 3,
		searchLabel: "Search settings",
		searchPlaceholder: "Search settings",
		sections: [
			{
				id: "settings-manage",
				label: "Settings",
				items: [
					{
						id: "settings:organization",
						label: "Organization",
						to: "/settings/organization",
						icon: Cog6ToothIcon,
					},
					{
						id: "settings:members",
						label: "Members",
						to: "/settings/members",
						icon: UserGroupIcon,
						badge: members.length,
					},
					{
						id: "settings:channels",
						label: "Channels",
						to: "/settings/channels",
						icon: HashtagIcon,
						badge: channels.length,
					},
				],
			},
		],
	} satisfies SidesheetContent;
}

function getSidesheetMode(pathname: string): SidesheetMode {
	if (pathname.startsWith("/notifications")) {
		return "notifications";
	}

	if (pathname.startsWith("/chat")) {
		return "chat";
	}

	if (pathname.startsWith("/settings")) {
		return "settings";
	}

	return "home";
}

function getActiveHomeItem(pathname: string) {
	if (pathname.startsWith("/knowledge")) {
		return "knowledge-library";
	}

	if (pathname.startsWith("/resources")) {
		return "resources";
	}

	return "feed";
}

function getActiveNotificationFilter(pathname: string) {
	if (pathname.startsWith("/notifications/mentions")) {
		return "mentions";
	}

	if (pathname.startsWith("/notifications/announcements")) {
		return "announcements";
	}

	if (pathname.startsWith("/notifications/unread")) {
		return "unread";
	}

	return "all";
}

function getActiveSettingsSection(pathname: string): SettingsSection {
	if (pathname.startsWith("/settings/members")) {
		return "members";
	}

	if (pathname.startsWith("/settings/channels")) {
		return "channels";
	}
	return "organization";
}

function getInitials(name: string) {
	const [first = "T", second] = name.trim().split(/\s+/);

	return `${first[0] ?? "T"}${second?.[0] ?? ""}`.toUpperCase();
}
