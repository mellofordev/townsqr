export const organizationTypes = [
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

export interface OrganizationSummary {
	id: string;
	inviteCode: string;
	name: string;
	type: string;
}
