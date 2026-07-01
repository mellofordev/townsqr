import type * as React from "react";

import { WorkspaceStep, workspaceStep } from "./step1.tsx";
import { ChannelsStep, channelsStep } from "./step2.tsx";
import { InvitesStep, invitesStep } from "./step3.tsx";
import type { OnboardingStepId, OnboardingStepProps } from "#/types/index.ts";

export { FinalizingStep } from "./finalizing.tsx";
export type {
	FinalizingStepProps,
	OnboardingData,
	OnboardingStepId,
	OnboardingStepMeta,
	OnboardingStepProps,
} from "./types.ts";

export const onboardingSteps = [
	{
		...workspaceStep,
		component: WorkspaceStep,
	},
	{
		...channelsStep,
		component: ChannelsStep,
	},
	{
		...invitesStep,
		component: InvitesStep,
	},
] satisfies Array<
	{
		component: (props: OnboardingStepProps) => React.ReactNode;
	} & {
		description: string;
		id: OnboardingStepId;
		title: string;
	}
>;
