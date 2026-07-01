import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, eq } from "drizzle-orm";

import { getDb } from "#/db/index.ts";
import {
	organization,
	organizationChannel,
	organizationInvite,
	organizationMember,
} from "#/db/schema.ts";
import type { WorkspaceSummary } from "#/types/index.ts";

export const workspaceSummaryQueryKey = ["workspace", "summary"] as const;

async function getServerSession() {
	const [{ getRequest }, { auth }] = await Promise.all([
		import("@tanstack/react-start/server"),
		import("#/lib/auth.ts"),
	]);

	return auth.api.getSession({
		headers: getRequest().headers,
	});
}

export const getWorkspaceSummary = createServerFn({ method: "GET" }).handler(
	async (): Promise<WorkspaceSummary | null> => {
		const session = await getServerSession();

		if (!session) {
			return null;
		}

		const db = getDb();
		const [workspace] = await db
			.select({
				id: organization.id,
				inviteCode: organization.inviteCode,
				memberRole: organizationMember.role,
				name: organization.name,
				type: organization.type,
			})
			.from(organizationMember)
			.innerJoin(
				organization,
				eq(organizationMember.organizationId, organization.id),
			)
			.where(eq(organizationMember.userId, session.user.id))
			.limit(1);

		if (!workspace) {
			return null;
		}

		const [channels, memberCountRows, inviteCountRows] = await Promise.all([
			db
				.select({
					createdAt: organizationChannel.createdAt,
					id: organizationChannel.id,
					name: organizationChannel.name,
					slug: organizationChannel.slug,
				})
				.from(organizationChannel)
				.where(eq(organizationChannel.organizationId, workspace.id))
				.orderBy(
					asc(organizationChannel.createdAt),
					asc(organizationChannel.name),
				),
			db
				.select({ value: count() })
				.from(organizationMember)
				.where(eq(organizationMember.organizationId, workspace.id)),
			db
				.select({ value: count() })
				.from(organizationInvite)
				.where(
					and(
						eq(organizationInvite.organizationId, workspace.id),
						eq(organizationInvite.status, "pending"),
					),
				),
		]);

		return {
			organization: {
				id: workspace.id,
				inviteCode: workspace.inviteCode,
				name: workspace.name,
				type: workspace.type,
			},
			channels: channels.map((channel) => ({
				...channel,
				createdAt: channel.createdAt.toISOString(),
			})),
			counts: {
				channels: channels.length,
				members: Number(memberCountRows[0]?.value ?? 0),
				pendingInvites: Number(inviteCountRows[0]?.value ?? 0),
			},
			member: {
				role: workspace.memberRole,
			},
		};
	},
);

export function workspaceSummaryQueryOptions() {
	return queryOptions({
		queryKey: workspaceSummaryQueryKey,
		queryFn: () => getWorkspaceSummary(),
		staleTime: 15 * 1000,
	});
}

export function useWorkspaceSummary() {
	return useSuspenseQuery(workspaceSummaryQueryOptions());
}
