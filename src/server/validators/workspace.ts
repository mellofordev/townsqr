import { appError } from "#/server/errors.ts";
import {
	assertEmail,
	assertOrganizationRole,
	isRecord,
	readOptionalStringArray,
	readString,
} from "#/server/validators/shared.ts";

export interface CreateOrganizationInviteData {
	channelAccess: "all-current" | "selected-only";
	channelIds?: string[];
	email: string;
	role: string;
}

export interface CreateOrganizationChannelData {
	name: string;
}

export interface UpdateOrganizationChannelData {
	channelId: string;
	name: string;
}

export interface UpdateOrganizationMemberRoleData {
	memberId: string;
	role: string;
}

export function validateCreateOrganizationInvite(
	value: unknown,
): CreateOrganizationInviteData {
	if (!isRecord(value)) {
		throw appError("INVITE_INVALID", 400, "Invalid invitation data.");
	}

	const channelAccess = readString(
		value,
		"channelAccess",
		"Select valid channel access.",
		"INVITE_INVALID",
	);

	if (channelAccess !== "all-current" && channelAccess !== "selected-only") {
		throw appError("INVITE_INVALID", 400, "Select valid channel access.");
	}

	return {
		channelAccess,
		channelIds: readOptionalStringArray(value, "channelIds", "INVITE_INVALID"),
		email: assertEmail(
			readString(
				value,
				"email",
				"Enter a valid email address.",
				"INVITE_INVALID_EMAIL",
			),
		),
		role: assertOrganizationRole(
			readString(value, "role", "Select a valid role.", "INVITE_INVALID"),
		),
	};
}

export function validateCreateOrganizationChannel(
	value: unknown,
): CreateOrganizationChannelData {
	if (!isRecord(value)) {
		throw appError("CHANNEL_INVALID", 400, "Invalid channel data.");
	}

	return {
		name: readString(value, "name", "Enter a channel name.", "CHANNEL_INVALID"),
	};
}

export function validateUpdateOrganizationChannel(
	value: unknown,
): UpdateOrganizationChannelData {
	if (!isRecord(value)) {
		throw appError("CHANNEL_INVALID", 400, "Invalid channel data.");
	}

	return {
		channelId: readString(
			value,
			"channelId",
			"Select a valid channel.",
			"CHANNEL_INVALID",
		),
		name: readString(value, "name", "Enter a channel name.", "CHANNEL_INVALID"),
	};
}

export function validateUpdateOrganizationMemberRole(
	value: unknown,
): UpdateOrganizationMemberRoleData {
	if (!isRecord(value)) {
		throw appError("MEMBER_INVALID", 400, "Invalid member data.");
	}

	return {
		memberId: readString(
			value,
			"memberId",
			"Select a valid member.",
			"MEMBER_INVALID",
		),
		role: assertOrganizationRole(
			readString(value, "role", "Select a valid role.", "MEMBER_INVALID"),
		),
	};
}
