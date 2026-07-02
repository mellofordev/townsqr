import { appError } from "#/server/errors.ts";
import {
	assertEmail,
	isRecord,
	readOptionalStringArray,
	readString,
} from "#/server/validators/shared.ts";
import {
	type CompleteOnboardingData,
	organizationTypes,
} from "#/types/index.ts";

export function validateCompleteOnboarding(
	value: unknown,
): CompleteOnboardingData {
	if (!isRecord(value)) {
		throw appError("ONBOARDING_INVALID", 400, "Invalid onboarding data.");
	}

	const organizationType = readString(
		value,
		"organizationType",
		"Select an organization type.",
	);

	if (!organizationTypes.includes(organizationType as never)) {
		throw appError("ONBOARDING_INVALID", 400, "Select an organization type.");
	}

	const inviteEmail = value.inviteEmail;
	const inviteEmails = readOptionalStringArray(value, "inviteEmails");

	return {
		channelNames: readOptionalStringArray(value, "channelNames"),
		inviteCode: readString(value, "inviteCode", "Invite code is invalid."),
		inviteEmail:
			typeof inviteEmail === "string" && inviteEmail.trim()
				? assertEmail(inviteEmail)
				: undefined,
		inviteEmails: inviteEmails?.filter(Boolean).map(assertEmail),
		organizationName: readString(
			value,
			"organizationName",
			"Enter your organization name.",
		),
		organizationType,
	};
}
