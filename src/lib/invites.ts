import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

import { getDb } from "#/db/index.ts";
import {
	organization,
	organizationInvite,
	organizationMember,
} from "#/db/schema.ts";

interface AcceptOrganizationInviteData {
	inviteCode: string;
}

function createId() {
	return crypto.randomUUID();
}

function sanitizeInviteCode(code: string) {
	return code
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, "")
		.slice(0, 8);
}

async function getServerSession() {
	const [{ getRequest }, { auth }] = await Promise.all([
		import("@tanstack/react-start/server"),
		import("#/lib/auth.ts"),
	]);

	return auth.api.getSession({
		headers: getRequest().headers,
	});
}

export const acceptOrganizationInvite = createServerFn({ method: "POST" })
	.validator((data: AcceptOrganizationInviteData) => data)
	.handler(async ({ data }) => {
		const session = await getServerSession();

		if (!session) {
			throw new Error(
				"Sign in or create an account to join this organization.",
			);
		}

		const inviteCode = sanitizeInviteCode(data.inviteCode);

		if (inviteCode.length < 6) {
			throw new Error("Invite code is invalid.");
		}

		const db = getDb();
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
			throw new Error("Invite code was not found.");
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

		if (!existingMembership) {
			await db.insert(organizationMember).values({
				id: createId(),
				organizationId: workspace.id,
				role: "member",
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
