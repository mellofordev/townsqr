import { appError } from "#/server/errors.ts";
import {
	isRecord,
	readString,
	sanitizeInviteCode,
} from "#/server/validators/shared.ts";

export interface AcceptOrganizationInviteData {
	inviteCode: string;
}

export function validateAcceptOrganizationInvite(
	value: unknown,
): AcceptOrganizationInviteData {
	if (!isRecord(value)) {
		throw appError("INVITE_INVALID", 400, "Invalid invite data.");
	}

	return {
		inviteCode: sanitizeInviteCode(
			readString(
				value,
				"inviteCode",
				"Invite code is invalid.",
				"INVITE_INVALID",
			),
		),
	};
}
