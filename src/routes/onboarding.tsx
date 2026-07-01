import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	AnimatePresence,
	motion,
	type TargetAndTransition,
	useReducedMotion,
} from "motion/react";
import * as React from "react";

import {
	FinalizingStep,
	type OnboardingData,
	type OnboardingStepId,
	onboardingSteps,
} from "#/components/onboarding/steps/index.ts";
import {
	completeOnboarding,
	onboardingStatusQueryKey,
	onboardingStatusQueryOptions,
	useOnboardingStatus,
} from "#/lib/onboarding.ts";

const DEFAULT_CHANNEL_NAMES = ["general", "announcements"];
const ONBOARDING_EASE_OUT: [number, number, number, number] = [
	0.23, 1, 0.32, 1,
];

type StepDirection = 1 | -1;

function getStepTransform(direction: StepDirection, distance: number) {
	return `translate3d(${direction * distance}px, 0, 0)`;
}

function createInviteCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const values = new Uint8Array(8);
	crypto.getRandomValues(values);

	return Array.from(values, (value) => alphabet[value % alphabet.length]).join(
		"",
	);
}

export const Route = createFileRoute("/onboarding")({
	loader: async ({ context }) => {
		const status = await context.queryClient.ensureQueryData(
			onboardingStatusQueryOptions(),
		);

		if (!status.isAuthenticated) {
			throw redirect({ to: "/login" });
		}

		if (status.organization) {
			throw redirect({ to: "/" });
		}
	},
	component: OnboardingPage,
	head: () => ({
		meta: [{ title: "Set up workspace | TownSqr" }],
	}),
});

function OnboardingPage() {
	useOnboardingStatus();

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [stepId, setStepId] = React.useState<OnboardingStepId>("workspace");
	const [data, setData] = React.useState<OnboardingData>({
		channelNames: DEFAULT_CHANNEL_NAMES,
		inviteCode: "",
		inviteEmails: [],
		organizationName: "",
		organizationType: "startup",
	});
	const [direction, setDirection] = React.useState<StepDirection>(1);
	const [isFinalizing, setIsFinalizing] = React.useState(false);
	const [submissionError, setSubmissionError] = React.useState<string | null>(
		null,
	);
	const shouldReduceMotion = useReducedMotion();
	const currentStepIndex = Math.max(
		0,
		onboardingSteps.findIndex((step) => step.id === stepId),
	);
	const currentStep = onboardingSteps[currentStepIndex];
	const ActiveStep = currentStep.component;
	const stepMotion = React.useMemo(
		() => ({
			animate: {
				opacity: 1,
				transform: getStepTransform(1, 0),
			},
			exit: (stepDirection: StepDirection) =>
				({
					opacity: 0,
					transform: shouldReduceMotion
						? getStepTransform(1, 0)
						: getStepTransform(stepDirection === 1 ? -1 : 1, 12),
				}) satisfies TargetAndTransition,
			initial: (stepDirection: StepDirection) =>
				({
					opacity: 0,
					transform: shouldReduceMotion
						? getStepTransform(1, 0)
						: getStepTransform(stepDirection, 16),
				}) satisfies TargetAndTransition,
		}),
		[shouldReduceMotion],
	);
	const stepTransition = {
		duration: shouldReduceMotion ? 0.16 : 0.22,
		ease: ONBOARDING_EASE_OUT,
	};

	React.useEffect(() => {
		setData((currentData) => ({
			...currentData,
			inviteCode: currentData.inviteCode || createInviteCode(),
		}));
	}, []);

	function goToStep(
		nextStepId: OnboardingStepId,
		stepDirection: StepDirection,
	) {
		setSubmissionError(null);
		setDirection(stepDirection);
		setStepId(nextStepId);
	}

	function handleBack() {
		const previousStep = onboardingSteps[currentStepIndex - 1];

		if (previousStep) {
			goToStep(previousStep.id, -1);
		}
	}

	async function finishOnboarding(nextData: OnboardingData) {
		setIsFinalizing(true);

		try {
			await completeOnboarding({
				data: {
					channelNames: nextData.channelNames,
					inviteCode: nextData.inviteCode,
					inviteEmails: nextData.inviteEmails,
					organizationName: nextData.organizationName,
					organizationType: nextData.organizationType,
				},
			});
			await queryClient.invalidateQueries({
				queryKey: onboardingStatusQueryKey,
			});
			await navigate({ to: "/" });
		} catch (caughtError) {
			setSubmissionError(
				caughtError instanceof Error
					? caughtError.message
					: "Could not finish setup.",
			);
			setIsFinalizing(false);
			setDirection(-1);
			setStepId("invites");
		}
	}

	function handleContinue(partialData: Partial<OnboardingData>) {
		const nextData = {
			...data,
			...partialData,
		};
		const nextStep = onboardingSteps[currentStepIndex + 1];

		setData(nextData);

		if (nextStep) {
			goToStep(nextStep.id, 1);
			return;
		}

		void finishOnboarding(nextData);
	}

	if (isFinalizing) {
		return <FinalizingStep data={data} />;
	}

	return (
		<AnimatePresence custom={direction} initial={false} mode="wait">
			<motion.div
				animate="animate"
				custom={direction}
				exit="exit"
				initial="initial"
				key={stepId}
				transition={stepTransition}
				variants={stepMotion}
			>
				<ActiveStep
					data={data}
					onBack={handleBack}
					onContinue={handleContinue}
					submissionError={submissionError}
					stepNumber={currentStepIndex + 1}
					totalSteps={onboardingSteps.length}
				/>
			</motion.div>
		</AnimatePresence>
	);
}
