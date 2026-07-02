import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

import {
	organization,
	organizationInvite,
	organizationMember,
} from "#/db/schema.ts";
import { createRequestContext, requireSession } from "#/server/context.ts";
import { appError } from "#/server/errors.ts";
import { validateAcceptOrganizationInvite } from "#/server/validators/invites.ts";

function createId() {
	return crypto.randomUUID();
}

export const acceptOrganizationInvite = createServerFn({ method: "POST" })
	.validator(validateAcceptOrganizationInvite)
	.handler(async ({ data }) => {
		const ctx = await createRequestContext();
		const session = requireSession(ctx);
		const inviteCode = data.inviteCode;

		if (inviteCode.length < 6) {
			throw appError("INVITE_INVALID", 400, "Invite code is invalid.");
		}

		const db = ctx.db;
		const [workspace] = await db
			.select({
				id: organization.id,
				inviteCode: organization.inviteCode,
				name: organization.name,
			})
			.from(organization)
			.where(eq(organization.inviteCode, inviteCode))
			.limit(1);

		if (!workspace) {
			throw appError("INVITE_NOT_FOUND", 404, "Invite code was not found.");
		}

		const [existingMembership] = await db
			.select({ id: organizationMember.id })
			.from(organizationMember)
			.where(
				and(
					eq(organizationMember.organizationId, workspace.id),
					eq(organizationMember.userId, session.user.id),
				),
			)
			.limit(1);
		const [pendingInvite] = await db
			.select({ role: organizationInvite.role })
			.from(organizationInvite)
			.where(
				and(
					eq(organizationInvite.organizationId, workspace.id),
					eq(organizationInvite.email, session.user.email.toLowerCase()),
					eq(organizationInvite.inviteCode, workspace.inviteCode),
					eq(organizationInvite.status, "pending"),
				),
			)
			.limit(1);

		if (!existingMembership) {
			await db.insert(organizationMember).values({
				id: createId(),
				organizationId: workspace.id,
				role: pendingInvite?.role ?? "member",
				userId: session.user.id,
			});
		}

		await db
			.update(organizationInvite)
			.set({ status: "accepted" })
			.where(
				and(
					eq(organizationInvite.organizationId, workspace.id),
					eq(organizationInvite.email, session.user.email.toLowerCase()),
					eq(organizationInvite.inviteCode, workspace.inviteCode),
				),
			);

		return {
			organizationId: workspace.id,
			organizationName: workspace.name,
		};
	});
