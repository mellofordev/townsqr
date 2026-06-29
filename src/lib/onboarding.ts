import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { getDb } from "#/db/index.ts";
import {
	organization,
	organizationInvite,
	organizationMember,
} from "#/db/schema.ts";

const organizationTypes = [
	"startup",
	"small-business",
	"enterprise",
	"nonprofit",
	"community",
] as const;

export type OrganizationType = (typeof organizationTypes)[number];

export const organizationTypeOptions = [
	{ value: "startup", label: "Startup" },
	{ value: "small-business", label: "Small business" },
	{ value: "enterprise", label: "Enterprise" },
	{ value: "nonprofit", label: "Nonprofit" },
	{ value: "community", label: "Community" },
] satisfies Array<{ value: OrganizationType; label: string }>;

export interface OnboardingStatus {
	isAuthenticated: boolean;
	organization: {
		id: string;
		name: string;
		type: string;
		inviteCode: string;
	} | null;
}

interface CompleteOnboardingData {
	inviteEmail?: string;
	inviteEmails?: string[];
	organizationName: string;
	organizationType: string;
	inviteCode: string;
}

export const onboardingStatusQueryKey = ["onboarding", "status"] as const;

async function getServerSession() {
	const [{ getRequest }, { auth }] = await Promise.all([
		import("@tanstack/react-start/server"),
		import("#/lib/auth.ts"),
	]);

	return auth.api.getSession({
		headers: getRequest().headers,
	});
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

function normalizeInviteEmail(email: string) {
	return email.trim().toLowerCase();
}

function getInviteEmails(data: CompleteOnboardingData) {
	return Array.from(
		new Set([
			...(data.inviteEmails ?? []).map(normalizeInviteEmail),
			...(data.inviteEmail ? [normalizeInviteEmail(data.inviteEmail)] : []),
		]),
	).filter(Boolean);
}

function assertOrganizationType(value: string): OrganizationType {
	if (organizationTypes.includes(value as OrganizationType)) {
		return value as OrganizationType;
	}

	throw new Error("Select an organization type.");
}

export const getOnboardingStatus = createServerFn({ method: "GET" }).handler(
	async (): Promise<OnboardingStatus> => {
		const session = await getServerSession();

		if (!session) {
			return {
				isAuthenticated: false,
				organization: null,
			};
		}

		const [workspace] = await getDb()
			.select({
				id: organization.id,
				name: organization.name,
				type: organization.type,
				inviteCode: organization.inviteCode,
			})
			.from(organizationMember)
			.innerJoin(
				organization,
				eq(organizationMember.organizationId, organization.id),
			)
			.where(eq(organizationMember.userId, session.user.id))
			.limit(1);

		return {
			isAuthenticated: true,
			organization: workspace ?? null,
		};
	},
);

export const completeOnboarding = createServerFn({ method: "POST" })
	.validator((data: CompleteOnboardingData) => data)
	.handler(async ({ data }) => {
		const session = await getServerSession();

		if (!session) {
			throw new Error("You need to be signed in to finish setup.");
		}

		const organizationName = data.organizationName.trim();
		const organizationType = assertOrganizationType(data.organizationType);
		const inviteCode = sanitizeInviteCode(data.inviteCode);
		const inviteEmails = getInviteEmails(data);

		if (organizationName.length < 2) {
			throw new Error("Enter your organization name.");
		}

		if (inviteCode.length < 6) {
			throw new Error("Invite code is invalid.");
		}

		const db = getDb();
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
			throw new Error("Could not create organization.");
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
