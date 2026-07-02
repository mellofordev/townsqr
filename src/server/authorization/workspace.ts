import { appError } from "#/server/errors.ts";

export function canManageWorkspace(role: string) {
	return role === "owner" || role === "admin";
}

export function assertCanManageWorkspace(role: string) {
	if (canManageWorkspace(role)) {
		return;
	}

	throw appError(
		"WORKSPACE_FORBIDDEN",
		403,
		"You need admin access to manage workspace settings.",
	);
}
