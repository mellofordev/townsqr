import type { OrganizationSummary, OrganizationType } from "./organization.ts";

export type OnboardingStepId = "channels" | "invites" | "workspace";

export interface OnboardingData {
	channelNames: string[];
	inviteCode: string;
	inviteEmails: string[];
	organizationName: string;
	organizationType: OrganizationType;
}

export interface OnboardingStatus {
	isAuthenticated: boolean;
	organization: OrganizationSummary | null;
}

export interface CompleteOnboardingData {
	channelNames?: string[];
	inviteEmail?: string;
	inviteEmails?: string[];
	organizationName: string;
	organizationType: string;
	inviteCode: string;
}

export interface OnboardingStepMeta {
	description: string;
	id: OnboardingStepId;
	title: string;
}

export interface OnboardingStepProps {
	data: OnboardingData;
	onBack: () => void;
	onContinue: (data: Partial<OnboardingData>) => void;
	submissionError?: string | null;
	stepNumber: number;
	totalSteps: number;
}

export interface FinalizingStepProps {
	data: OnboardingData;
}
