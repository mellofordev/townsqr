import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import {
	organization,
	organizationChannel,
	organizationInvite,
	organizationMember,
} from "#/db/schema.ts";
import {
	createRequestContext,
	getWorkspaceContext,
	requireSession,
} from "#/server/context.ts";
import { appError } from "#/server/errors.ts";
import { validateCompleteOnboarding } from "#/server/validators/onboarding.ts";
import {
	getChannelSlug,
	normalizeChannelName,
	normalizeEmail,
	sanitizeInviteCode,
} from "#/server/validators/shared.ts";
import {
	type CompleteOnboardingData,
	type OnboardingStatus,
	type OrganizationType,
	organizationTypes,
} from "#/types/index.ts";

export const onboardingStatusQueryKey = ["onboarding", "status"] as const;

function createId() {
	return crypto.randomUUID();
}

function normalizeInviteEmail(email: string) {
	return normalizeEmail(email);
}

function getInviteEmails(data: CompleteOnboardingData) {
	return Array.from(
		new Set([
			...(data.inviteEmails ?? []).map(normalizeInviteEmail),
			...(data.inviteEmail ? [normalizeInviteEmail(data.inviteEmail)] : []),
		]),
	).filter(Boolean);
}

function getChannelNames(data: CompleteOnboardingData) {
	const channelNames = data.channelNames?.length
		? data.channelNames
		: ["general", "announcements"];

	return Array.from(
		new Map(
			channelNames
				.map(normalizeChannelName)
				.filter(Boolean)
				.map((channelName) => [channelName.toLowerCase(), channelName]),
		).values(),
	);
}

function assertOrganizationType(value: string): OrganizationType {
	if (organizationTypes.includes(value as OrganizationType)) {
		return value as OrganizationType;
	}

	throw appError("ONBOARDING_INVALID", 400, "Select an organization type.");
}

export const getOnboardingStatus = createServerFn({ method: "GET" }).handler(
	async (): Promise<OnboardingStatus> => {
		const ctx = await createRequestContext();

		if (!ctx.session) {
			return {
				isAuthenticated: false,
				organization: null,
			};
		}

		const workspace = await getWorkspaceContext(ctx);

		return {
			isAuthenticated: true,
			organization: workspace ?? null,
		};
	},
);

export const completeOnboarding = createServerFn({ method: "POST" })
	.validator(validateCompleteOnboarding)
	.handler(async ({ data }) => {
		const ctx = await createRequestContext();
		const session = requireSession(ctx);

		const organizationName = data.organizationName.trim();
		const organizationType = assertOrganizationType(data.organizationType);
		const inviteCode = sanitizeInviteCode(data.inviteCode);
		const channelNames = getChannelNames(data);
		const inviteEmails = getInviteEmails(data);

		if (organizationName.length < 2) {
			throw appError(
				"ONBOARDING_INVALID",
				400,
				"Enter your organization name.",
			);
		}

		if (inviteCode.length < 6) {
			throw appError("INVITE_INVALID", 400, "Invite code is invalid.");
		}

		if (channelNames.length === 0) {
			throw appError("CHANNEL_INVALID", 400, "Add at least one channel.");
		}

		const invalidChannelName = channelNames.find(
			(channelName) => channelName.length < 2 || channelName.length > 40,
		);

		if (invalidChannelName) {
			throw appError(
				"CHANNEL_INVALID",
				400,
				"Keep channel names between 2 and 40 characters.",
			);
		}

		const channelRecords = Array.from(
			new Map(
				channelNames.map((channelName) => {
					const slug = getChannelSlug(channelName);

					return [
						slug,
						{
							name: channelName,
							slug,
						},
					];
				}),
			).values(),
		);
		const invalidChannelSlug = channelRecords.find(({ slug }) => !slug);

		if (invalidChannelSlug) {
			throw appError(
				"CHANNEL_INVALID",
				400,
				"Use letters or numbers in channel names.",
			);
		}

		const db = ctx.db;
		const [existingWorkspace] = await db
			.select({
				id: organization.id,
				inviteCode: organization.inviteCode,
			})
			.from(organizationMember)
			.innerJoin(
				organization,
				eq(organizationMember.organizationId, organization.id),
			)
			.where(eq(organizationMember.userId, session.user.id))
			.limit(1);

		const workspace =
			existingWorkspace ??
			(
				await db
					.insert(organization)
					.values({
						id: createId(),
						name: organizationName,
						type: organizationType,
						inviteCode,
						createdByUserId: session.user.id,
					})
					.returning({
						id: organization.id,
						inviteCode: organization.inviteCode,
					})
			)[0];

		if (!workspace) {
			throw appError(
				"ONBOARDING_INVALID",
				500,
				"Could not create organization.",
			);
		}

		if (existingWorkspace) {
			await db
				.update(organization)
				.set({
					name: organizationName,
					type: organizationType,
					updatedAt: new Date(),
				})
				.where(eq(organization.id, existingWorkspace.id));
		} else {
			await db.insert(organizationMember).values({
				id: createId(),
				organizationId: workspace.id,
				userId: session.user.id,
				role: "owner",
			});
		}

		await db
			.insert(organizationChannel)
			.values(
				channelRecords.map((channelRecord) => ({
					id: createId(),
					organizationId: workspace.id,
					createdByUserId: session.user.id,
					...channelRecord,
				})),
			)
			.onConflictDoNothing();

		if (inviteEmails.length > 0) {
			await db.insert(organizationInvite).values(
				inviteEmails.map((inviteEmail) => ({
					id: createId(),
					organizationId: workspace.id,
					email: inviteEmail,
					inviteCode: workspace.inviteCode,
					invitedByUserId: session.user.id,
				})),
			);

			const [{ getRequest }, { sendOrganizationInviteEmail }] =
				await Promise.all([
					import("@tanstack/react-start/server"),
					import("#/lib/email.ts"),
				]);
			const inviteUrl = new URL("/signup", getRequest().url);
			inviteUrl.searchParams.set("inviteCode", workspace.inviteCode);

			await Promise.all(
				inviteEmails.map(async (inviteEmail) => {
					try {
						const delivery = await sendOrganizationInviteEmail({
							inviteCode: workspace.inviteCode,
							inviteUrl: inviteUrl.toString(),
							invitedByName: session.user.name,
							organizationName,
							to: inviteEmail,
						});

						if (delivery.status === "skipped") {
							console.info("Organization invite email skipped.", {
								reason: delivery.reason,
								to: inviteEmail,
							});
						}
					} catch (error) {
						console.error("Could not send organization invite email.", {
							error,
							to: inviteEmail,
						});
					}
				}),
			);
		}

		return {
			organizationId: workspace.id,
		};
	});

export function onboardingStatusQueryOptions() {
	return queryOptions({
		queryKey: onboardingStatusQueryKey,
		queryFn: () => getOnboardingStatus(),
		staleTime: 15 * 1000,
	});
}

export function useOnboardingStatus() {
	return useSuspenseQuery(onboardingStatusQueryOptions());
}
