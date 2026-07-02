import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, eq, inArray } from "drizzle-orm";

import {
	organizationChannel,
	organizationInvite,
	organizationInviteChannel,
	organizationMember,
	user,
} from "#/db/schema.ts";
import {
	assertCanManageWorkspace,
	canManageWorkspace,
} from "#/server/authorization/workspace.ts";
import {
	createRequestContext,
	getWorkspaceContext,
	requireSession,
	requireWorkspace,
} from "#/server/context.ts";
import { appError } from "#/server/errors.ts";
import {
	assertOrganizationRole,
	getChannelSlug,
	normalizeChannelName,
} from "#/server/validators/shared.ts";
import {
	validateCreateOrganizationChannel,
	validateCreateOrganizationInvite,
	validateUpdateOrganizationMemberRole,
} from "#/server/validators/workspace.ts";
import type { WorkspaceSettings, WorkspaceSummary } from "#/types/index.ts";

export const workspaceSummaryQueryKey = ["workspace", "summary"] as const;
export const workspaceSettingsQueryKey = ["workspace", "settings"] as const;

function createId() {
	return crypto.randomUUID();
}

async function getCurrentWorkspace() {
	const ctx = await createRequestContext();
	const session = requireSession(ctx);
	const workspace = await requireWorkspace(ctx);

	return { db: ctx.db, session, workspace };
}

export const getWorkspaceSummary = createServerFn({ method: "GET" }).handler(
	async (): Promise<WorkspaceSummary | null> => {
		const ctx = await createRequestContext();

		if (!ctx.session) {
			return null;
		}

		const workspace = await getWorkspaceContext(ctx);

		if (!workspace) {
			return null;
		}

		const canManage = canManageWorkspace(workspace.memberRole);
		const [channels, members, memberCountRows, inviteCountRows] =
			await Promise.all([
				ctx.db
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
				ctx.db
					.select({
						id: user.id,
						imageUrl: user.image,
						name: user.name,
					})
					.from(organizationMember)
					.innerJoin(user, eq(organizationMember.userId, user.id))
					.where(eq(organizationMember.organizationId, workspace.id))
					.orderBy(asc(user.name)),
				ctx.db
					.select({ value: count() })
					.from(organizationMember)
					.where(eq(organizationMember.organizationId, workspace.id)),
				ctx.db
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
				inviteCode: canManage ? workspace.inviteCode : "",
				name: workspace.name,
				type: workspace.type,
			},
			channels: channels.map((channel) => ({
				...channel,
				createdAt: channel.createdAt.toISOString(),
			})),
			members,
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

export const getWorkspaceSettings = createServerFn({ method: "GET" }).handler(
	async (): Promise<WorkspaceSettings | null> => {
		const ctx = await createRequestContext();

		if (!ctx.session) {
			return null;
		}

		const workspace = await getWorkspaceContext(ctx);

		if (!workspace) {
			return null;
		}

		const canManage = canManageWorkspace(workspace.memberRole);
		const [channels, members, invites] = await Promise.all([
			ctx.db
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
			ctx.db
				.select({
					id: organizationMember.id,
					joinedAt: organizationMember.createdAt,
					role: organizationMember.role,
					userEmail: user.email,
					userId: user.id,
					userImage: user.image,
					userName: user.name,
				})
				.from(organizationMember)
				.innerJoin(user, eq(organizationMember.userId, user.id))
				.where(eq(organizationMember.organizationId, workspace.id))
				.orderBy(asc(organizationMember.createdAt), asc(user.name)),
			ctx.db
				.select({
					createdAt: organizationInvite.createdAt,
					email: organizationInvite.email,
					id: organizationInvite.id,
					inviteCode: organizationInvite.inviteCode,
					invitedByUserId: organizationInvite.invitedByUserId,
					role: organizationInvite.role,
					status: organizationInvite.status,
				})
				.from(organizationInvite)
				.where(eq(organizationInvite.organizationId, workspace.id))
				.orderBy(asc(organizationInvite.createdAt)),
		]);
		const inviteIds = invites.map((invite) => invite.id);
		const inviteChannels = inviteIds.length
			? await ctx.db
					.select({
						channelId: organizationInviteChannel.channelId,
						inviteId: organizationInviteChannel.inviteId,
					})
					.from(organizationInviteChannel)
					.where(inArray(organizationInviteChannel.inviteId, inviteIds))
			: [];
		const channelIdsByInviteId = new Map<string, string[]>();

		for (const inviteChannel of inviteChannels) {
			const channelIds = channelIdsByInviteId.get(inviteChannel.inviteId) ?? [];

			channelIds.push(inviteChannel.channelId);
			channelIdsByInviteId.set(inviteChannel.inviteId, channelIds);
		}

		return {
			organization: {
				id: workspace.id,
				inviteCode: canManage ? workspace.inviteCode : "",
				name: workspace.name,
				type: workspace.type,
			},
			channels: channels.map((channel) => ({
				...channel,
				createdAt: channel.createdAt.toISOString(),
			})),
			members: members.map((member) => ({
				id: member.id,
				joinedAt: member.joinedAt.toISOString(),
				role: member.role,
				user: {
					email: member.userEmail,
					id: member.userId,
					imageUrl: member.userImage,
					name: member.userName,
				},
			})),
			invites: invites.map((invite) => ({
				...invite,
				channelIds: channelIdsByInviteId.get(invite.id) ?? [],
				createdAt: invite.createdAt.toISOString(),
				inviteCode: canManage ? invite.inviteCode : "",
			})),
			member: {
				role: workspace.memberRole,
				userId: ctx.session.user.id,
			},
		};
	},
);

export const createOrganizationInvite = createServerFn({ method: "POST" })
	.validator(validateCreateOrganizationInvite)
	.handler(async ({ data }) => {
		const { db, session, workspace } = await getCurrentWorkspace();

		assertCanManageWorkspace(workspace.memberRole);

		const email = data.email;
		const role = data.role;
		const channelAccess = data.channelAccess;
		const selectedChannelIds = Array.from(new Set(data.channelIds ?? []));

		if (channelAccess === "selected-only" && selectedChannelIds.length === 0) {
			throw appError("INVITE_INVALID", 400, "Select at least one channel.");
		}

		const channels =
			channelAccess === "selected-only"
				? await db
						.select({ id: organizationChannel.id })
						.from(organizationChannel)
						.where(
							and(
								eq(organizationChannel.organizationId, workspace.id),
								inArray(organizationChannel.id, selectedChannelIds),
							),
						)
				: [];

		if (
			channelAccess === "selected-only" &&
			channels.length !== selectedChannelIds.length
		) {
			throw appError(
				"CHANNEL_NOT_FOUND",
				404,
				"One or more selected channels no longer exist.",
			);
		}

		const [existingInvite] = await db
			.select({ id: organizationInvite.id })
			.from(organizationInvite)
			.where(
				and(
					eq(organizationInvite.organizationId, workspace.id),
					eq(organizationInvite.email, email),
					eq(organizationInvite.status, "pending"),
				),
			)
			.limit(1);
		const [invite] = existingInvite
			? await db
					.update(organizationInvite)
					.set({
						inviteCode: workspace.inviteCode,
						role,
					})
					.where(eq(organizationInvite.id, existingInvite.id))
					.returning({ id: organizationInvite.id })
			: await db
					.insert(organizationInvite)
					.values({
						id: createId(),
						organizationId: workspace.id,
						email,
						inviteCode: workspace.inviteCode,
						invitedByUserId: session.user.id,
						role,
					})
					.returning({ id: organizationInvite.id });

		if (!invite) {
			throw appError("INVITE_INVALID", 500, "Could not create invitation.");
		}

		await db
			.delete(organizationInviteChannel)
			.where(eq(organizationInviteChannel.inviteId, invite.id));

		if (channelAccess === "selected-only") {
			await db.insert(organizationInviteChannel).values(
				selectedChannelIds.map((channelId) => ({
					id: createId(),
					inviteId: invite.id,
					channelId,
				})),
			);
		}

		const [{ getRequest }, { sendOrganizationInviteEmail }] = await Promise.all(
			[import("@tanstack/react-start/server"), import("#/lib/email.ts")],
		);
		const inviteUrl = new URL("/signup", getRequest().url);

		inviteUrl.searchParams.set("inviteCode", workspace.inviteCode);

		try {
			const delivery = await sendOrganizationInviteEmail({
				inviteCode: workspace.inviteCode,
				inviteUrl: inviteUrl.toString(),
				invitedByName: session.user.name,
				organizationName: workspace.name,
				to: email,
			});

			if (delivery.status === "skipped") {
				console.info("Organization invite email skipped.", {
					reason: delivery.reason,
					to: email,
				});
			}
		} catch (error) {
			console.error("Could not send organization invite email.", {
				error,
				to: email,
			});
		}

		return { id: invite.id };
	});

export const createOrganizationChannel = createServerFn({ method: "POST" })
	.validator(validateCreateOrganizationChannel)
	.handler(async ({ data }) => {
		const { db, session, workspace } = await getCurrentWorkspace();

		assertCanManageWorkspace(workspace.memberRole);

		const name = normalizeChannelName(data.name);
		const slug = getChannelSlug(name);

		if (name.length < 2 || name.length > 40) {
			throw appError(
				"CHANNEL_INVALID",
				400,
				"Keep channel names between 2 and 40 characters.",
			);
		}

		if (!slug) {
			throw appError(
				"CHANNEL_INVALID",
				400,
				"Use letters or numbers in channel names.",
			);
		}

		const [existingChannel] = await db
			.select({ id: organizationChannel.id })
			.from(organizationChannel)
			.where(
				and(
					eq(organizationChannel.organizationId, workspace.id),
					eq(organizationChannel.slug, slug),
				),
			)
			.limit(1);

		if (existingChannel) {
			throw appError(
				"CHANNEL_ALREADY_EXISTS",
				409,
				"A channel with this name already exists.",
			);
		}

		const [channel] = await db
			.insert(organizationChannel)
			.values({
				id: createId(),
				organizationId: workspace.id,
				name,
				slug,
				createdByUserId: session.user.id,
			})
			.returning({ id: organizationChannel.id });

		return { id: channel?.id };
	});

export const updateOrganizationMemberRole = createServerFn({ method: "POST" })
	.validator(validateUpdateOrganizationMemberRole)
	.handler(async ({ data }) => {
		const { db, session, workspace } = await getCurrentWorkspace();

		assertCanManageWorkspace(workspace.memberRole);

		const role = assertOrganizationRole(data.role);
		const [targetMember] = await db
			.select({
				id: organizationMember.id,
				role: organizationMember.role,
				userId: organizationMember.userId,
			})
			.from(organizationMember)
			.where(
				and(
					eq(organizationMember.id, data.memberId),
					eq(organizationMember.organizationId, workspace.id),
				),
			)
			.limit(1);

		if (!targetMember) {
			throw appError("MEMBER_NOT_FOUND", 404, "Member was not found.");
		}

		if (targetMember.userId === session.user.id) {
			throw appError("MEMBER_INVALID", 400, "You cannot change your own role.");
		}

		if (
			workspace.memberRole !== "owner" &&
			(targetMember.role === "owner" || role === "owner")
		) {
			throw appError(
				"WORKSPACE_FORBIDDEN",
				403,
				"Only owners can change owner roles.",
			);
		}

		if (targetMember.role === "owner" && role !== "owner") {
			const [ownerCountRow] = await db
				.select({ value: count() })
				.from(organizationMember)
				.where(
					and(
						eq(organizationMember.organizationId, workspace.id),
						eq(organizationMember.role, "owner"),
					),
				);

			if (Number(ownerCountRow?.value ?? 0) <= 1) {
				throw appError(
					"MEMBER_INVALID",
					400,
					"A workspace must have at least one owner.",
				);
			}
		}

		await db
			.update(organizationMember)
			.set({ role })
			.where(eq(organizationMember.id, targetMember.id));

		return { id: targetMember.id };
	});

export function workspaceSummaryQueryOptions() {
	return queryOptions({
		queryKey: workspaceSummaryQueryKey,
		queryFn: () => getWorkspaceSummary(),
		staleTime: 15 * 1000,
	});
}

export function workspaceSettingsQueryOptions() {
	return queryOptions({
		queryKey: workspaceSettingsQueryKey,
		queryFn: () => getWorkspaceSettings(),
		staleTime: 15 * 1000,
	});
}

export function useWorkspaceSummary() {
	return useSuspenseQuery(workspaceSummaryQueryOptions());
}

export function useWorkspaceSettings() {
	return useSuspenseQuery(workspaceSettingsQueryOptions());
}
