import type { OrganizationSummary } from "./organization.ts";

export interface WorkspaceChannel {
	createdAt: string;
	id: string;
	name: string;
	slug: string;
}

export interface WorkspaceSummary {
	organization: OrganizationSummary;
	channels: WorkspaceChannel[];
	members: WorkspaceSummaryMember[];
	counts: {
		channels: number;
		members: number;
		pendingInvites: number;
	};
	member: {
		role: string;
	};
}

export interface WorkspaceSummaryMember {
	id: string;
	imageUrl: string | null;
	name: string;
}

export interface WorkspaceSettingsMember {
	id: string;
	joinedAt: string;
	role: string;
	user: {
		email: string;
		id: string;
		imageUrl: string | null;
		name: string;
	};
}

export interface WorkspaceSettingsInvite {
	channelIds: string[];
	createdAt: string;
	email: string;
	id: string;
	inviteCode: string;
	invitedByUserId: string;
	role: string;
	status: string;
}

export interface WorkspaceSettings {
	organization: OrganizationSummary;
	channels: WorkspaceChannel[];
	members: WorkspaceSettingsMember[];
	invites: WorkspaceSettingsInvite[];
	member: {
		role: string;
		userId: string;
	};
}
