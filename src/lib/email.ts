import { env } from "cloudflare:workers";
import { Resend } from "resend";

type EmailAddress =
	| string
	| {
			email: string;
			name: string;
	  };

interface EmailWorkerEnv extends Record<string, unknown> {
	EMAIL_FROM?: string;
	EMAIL_REPLY_TO?: string;
	RESEND_API_KEY?: string;
	TOWNSQR_EMAIL_ENABLED?: string;
	TOWNSQR_EMAIL_FROM?: string;
	TOWNSQR_EMAIL_REPLY_TO?: string;
}

export interface SendEmailInput {
	bcc?: EmailAddress | EmailAddress[];
	cc?: EmailAddress | EmailAddress[];
	from?: EmailAddress;
	headers?: Record<string, string>;
	html?: string;
	replyTo?: EmailAddress;
	subject: string;
	text?: string;
	to: EmailAddress | EmailAddress[];
	type?: string;
}

export type EmailDeliveryResult =
	| {
			providerResult: unknown;
			status: "sent";
	  }
	| {
			reason:
				| "disabled"
				| "missing-api-key"
				| "missing-content"
				| "missing-from";
			status: "skipped";
	  };

export interface OrganizationInviteEmailInput {
	inviteCode: string;
	inviteUrl?: string;
	invitedByName: string;
	organizationName: string;
	to: string;
}

function getStringEnvValue(value: unknown) {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getEmailEnv() {
	return env as EmailWorkerEnv;
}

function isEmailDisabled(emailEnv: EmailWorkerEnv) {
	const enabled = getStringEnvValue(emailEnv.TOWNSQR_EMAIL_ENABLED);

	return enabled === "0" || enabled?.toLowerCase() === "false";
}

let resendClient: Resend | undefined;
let resendClientApiKey: string | undefined;

function getDefaultFromAddress(emailEnv: EmailWorkerEnv) {
	return (
		getStringEnvValue(emailEnv.TOWNSQR_EMAIL_FROM) ??
		getStringEnvValue(emailEnv.EMAIL_FROM) ??
		"TownSqr <invite@boywithacap.com>"
	);
}

function getDefaultReplyToAddress(emailEnv: EmailWorkerEnv) {
	return (
		getStringEnvValue(emailEnv.TOWNSQR_EMAIL_REPLY_TO) ??
		getStringEnvValue(emailEnv.EMAIL_REPLY_TO)
	);
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function formatEmailAddress(address: EmailAddress) {
	return typeof address === "string"
		? address
		: `${address.name} <${address.email}>`;
}

function formatEmailAddresses(addresses: EmailAddress | EmailAddress[]) {
	return Array.isArray(addresses)
		? addresses.map(formatEmailAddress)
		: formatEmailAddress(addresses);
}

function getResendClient(apiKey: string) {
	if (!resendClient || resendClientApiKey !== apiKey) {
		resendClient = new Resend(apiKey);
		resendClientApiKey = apiKey;
	}

	return resendClient;
}

export async function sendEmail(
	input: SendEmailInput,
): Promise<EmailDeliveryResult> {
	const emailEnv = getEmailEnv();

	if (isEmailDisabled(emailEnv)) {
		return { reason: "disabled", status: "skipped" };
	}

	const apiKey = getStringEnvValue(emailEnv.RESEND_API_KEY);

	if (!apiKey) {
		return { reason: "missing-api-key", status: "skipped" };
	}

	const from = input.from ?? getDefaultFromAddress(emailEnv);

	if (!from) {
		return { reason: "missing-from", status: "skipped" };
	}

	const text = input.text;

	if (!input.html && !text) {
		return { reason: "missing-content", status: "skipped" };
	}

	const defaultReplyTo = getDefaultReplyToAddress(emailEnv);
	const resend = getResendClient(apiKey);
	const baseMessage = {
		bcc: input.bcc ? formatEmailAddresses(input.bcc) : undefined,
		cc: input.cc ? formatEmailAddresses(input.cc) : undefined,
		from: formatEmailAddress(from),
		headers: {
			...(input.type ? { "X-TownSqr-Email-Type": input.type } : {}),
			...input.headers,
		},
		replyTo: input.replyTo
			? formatEmailAddress(input.replyTo)
			: defaultReplyTo
				? formatEmailAddress(defaultReplyTo)
				: undefined,
		subject: input.subject,
		tags: input.type
			? [{ name: "townsqr_email_type", value: input.type }]
			: undefined,
		to: formatEmailAddresses(input.to),
	};
	const providerResult = input.html
		? await resend.emails.send({
				...baseMessage,
				html: input.html,
			})
		: await resend.emails.send({
				...baseMessage,
				text: text ?? "",
			});

	return { providerResult, status: "sent" };
}

export async function sendOrganizationInviteEmail(
	input: OrganizationInviteEmailInput,
) {
	const subject = `${input.invitedByName} invited you to ${input.organizationName} on TownSqr`;
	const inviteUrlLine = input.inviteUrl
		? `Join here: ${input.inviteUrl}`
		: "Open TownSqr and enter the invite code during signup.";
	const text = [
		`${input.invitedByName} invited you to join ${input.organizationName} on TownSqr.`,
		"",
		`Invite code: ${input.inviteCode}`,
		inviteUrlLine,
		"",
		"TownSqr is your organization's workspace for posts, announcements, members, and team conversations.",
	].join("\n");
	const escapedOrganizationName = escapeHtml(input.organizationName);
	const escapedInvitedByName = escapeHtml(input.invitedByName);
	const escapedInviteCode = escapeHtml(input.inviteCode);
	const inviteUrlHtml = input.inviteUrl
		? `<p><a href="${escapeHtml(input.inviteUrl)}">Join ${escapedOrganizationName}</a></p>`
		: "<p>Open TownSqr and enter the invite code during signup.</p>";
	const html = [
		`<p>${escapedInvitedByName} invited you to join ${escapedOrganizationName} on TownSqr.</p>`,
		`<p><strong>Invite code:</strong> ${escapedInviteCode}</p>`,
		inviteUrlHtml,
		"<p>TownSqr is your organization's workspace for posts, announcements, members, and team conversations.</p>",
	].join("");

	return sendEmail({
		html,
		subject,
		text,
		to: input.to,
		type: "organization_invite",
	});
}
