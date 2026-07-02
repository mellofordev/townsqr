import { type AppErrorCode, appError } from "#/server/errors.ts";

export const organizationRoleOptions = ["owner", "admin", "member"] as const;

export type OrganizationRole = (typeof organizationRoleOptions)[number];

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readString(
	data: Record<string, unknown>,
	key: string,
	message: string,
	code: AppErrorCode = "ONBOARDING_INVALID",
) {
	const value = data[key];

	if (typeof value !== "string") {
		throw appError(code, 400, message);
	}

	return value;
}

export function readOptionalStringArray(
	data: Record<string, unknown>,
	key: string,
	code: AppErrorCode = "ONBOARDING_INVALID",
) {
	const value = data[key];

	if (value === undefined) {
		return undefined;
	}

	if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
		throw appError(code, 400, "Invalid form data.");
	}

	return value;
}

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

export function assertEmail(email: string) {
	const normalizedEmail = normalizeEmail(email);

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		throw appError("INVITE_INVALID_EMAIL", 400, "Enter a valid email address.");
	}

	return normalizedEmail;
}

export function assertOrganizationRole(role: string): OrganizationRole {
	if (organizationRoleOptions.includes(role as OrganizationRole)) {
		return role as OrganizationRole;
	}

	throw appError("INVITE_INVALID", 400, "Select a valid role.");
}

export function sanitizeInviteCode(code: string) {
	return code
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, "")
		.slice(0, 8);
}

export function normalizeChannelName(channelName: string) {
	return channelName.trim().replace(/\s+/g, " ");
}

export function getChannelSlug(channelName: string) {
	return normalizeChannelName(channelName)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);
}
