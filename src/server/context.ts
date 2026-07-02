import { eq } from "drizzle-orm";

import { getDb } from "#/db/index.ts";
import { organization, organizationMember } from "#/db/schema.ts";
import type { auth } from "#/lib/auth.ts";
import { type AppEnv, getEnv } from "#/server/env.ts";
import { appError } from "#/server/errors.ts";

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
export type Database = ReturnType<typeof getDb>;

export interface WorkspaceContext {
	id: string;
	inviteCode: string;
	memberRole: string;
	name: string;
	type: string;
}

export interface RequestContext {
	db: Database;
	env: AppEnv;
	request: Request;
	session: AuthSession;
}

export async function createRequestContext(): Promise<RequestContext> {
	const [{ getRequest }, { auth }] = await Promise.all([
		import("@tanstack/react-start/server"),
		import("#/lib/auth.ts"),
	]);

	const request = getRequest();
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	return {
		db: getDb(),
		env: getEnv(),
		request,
		session,
	};
}

export function requireSession(ctx: RequestContext) {
	if (!ctx.session) {
		throw appError("AUTH_REQUIRED", 401, "You need to be signed in.");
	}

	return ctx.session;
}

export async function getWorkspaceContext(ctx: RequestContext) {
	const session = requireSession(ctx);
	const [workspace] = await ctx.db
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

	return workspace ?? null;
}

export async function requireWorkspace(ctx: RequestContext) {
	const workspace = await getWorkspaceContext(ctx);

	if (!workspace) {
		throw appError(
			"WORKSPACE_NOT_FOUND",
			404,
			"Create or join a workspace first.",
		);
	}

	return workspace;
}
