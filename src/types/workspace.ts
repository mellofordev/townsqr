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
	counts: {
		channels: number;
		members: number;
		pendingInvites: number;
	};
	member: {
		role: string;
	};
}
