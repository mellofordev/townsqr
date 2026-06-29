import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	AnimatePresence,
	motion,
	type TargetAndTransition,
	useReducedMotion,
} from "motion/react";
import * as React from "react";

import { InviteEmailInput } from "#/components/onboarding/email-input.tsx";
import { OnboardingPreview } from "#/components/onboarding/preview/index.ts";
import { Button } from "#/components/ui/button.tsx";
import { Card } from "#/components/ui/card.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";

import {
	completeOnboarding,
	type OrganizationType,
	onboardingStatusQueryKey,
	onboardingStatusQueryOptions,
	organizationTypeOptions,
	useOnboardingStatus,
} from "#/lib/onboarding.ts";
import { cn } from "#/lib/utils.ts";

const ONBOARDING_EASE_OUT: [number, number, number, number] = [
	0.23, 1, 0.32, 1,
];
const EMAIL_SPLIT_PATTERN = /[\s,;]+/;
const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StepDirection = 1 | -1;

function getStepTransform(direction: StepDirection, distance: number) {
	return `translate3d(${direction * distance}px, 0, 0)`;
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

function createInviteCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const values = new Uint8Array(8);
	crypto.getRandomValues(values);

	return Array.from(values, (value) => alphabet[value % alphabet.length]).join(
		"",
	);
}

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function getEmailEntries(value: string) {
	return value.split(EMAIL_SPLIT_PATTERN).map(normalizeEmail).filter(Boolean);
}

function isEmailAddress(value: string) {
	return SIMPLE_EMAIL_PATTERN.test(value);
}

function OnboardingPage() {
	useOnboardingStatus();

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [step, setStep] = React.useState(1);
	const [organizationName, setOrganizationName] = React.useState("");
	const [organizationType, setOrganizationType] =
		React.useState<OrganizationType>("startup");
	const [inviteCode, setInviteCode] = React.useState("");
	const [inviteEmails, setInviteEmails] = React.useState<string[]>([]);
	const [inviteEmailInput, setInviteEmailInput] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [isPending, setIsPending] = React.useState(false);
	const [direction, setDirection] = React.useState<StepDirection>(1);
	const shouldReduceMotion = useReducedMotion();
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
		setInviteCode(createInviteCode());
	}, []);

	function handleContinue() {
		setError(null);

		if (organizationName.trim().length < 2) {
			setError("Enter your organization name.");
			return;
		}

		setDirection(1);
		setStep(2);
	}

	function handleBack() {
		setError(null);
		setDirection(-1);
		setStep(1);
	}

	function addInviteEmails(value: string) {
		const entries = getEmailEntries(value);

		if (entries.length === 0) {
			return true;
		}

		const invalidEmail = entries.find((entry) => !isEmailAddress(entry));

		if (invalidEmail) {
			setError(`Check the email address: ${invalidEmail}`);
			return false;
		}

		setInviteEmails((currentEmails) => {
			const nextEmails = new Set(currentEmails);

			for (const entry of entries) {
				nextEmails.add(entry);
			}

			return Array.from(nextEmails);
		});
		setInviteEmailInput("");
		setError(null);

		return true;
	}

	function removeInviteEmail(email: string) {
		setInviteEmails((currentEmails) =>
			currentEmails.filter((currentEmail) => currentEmail !== email),
		);
	}

	function getInviteEmailsForSubmit() {
		const pendingEmail = normalizeEmail(inviteEmailInput);

		if (!pendingEmail) {
			return inviteEmails;
		}

		const pendingEntries = getEmailEntries(pendingEmail);
		const invalidEmail = pendingEntries.find((entry) => !isEmailAddress(entry));

		if (invalidEmail) {
			throw new Error(`Check the email address: ${invalidEmail}`);
		}

		return Array.from(new Set([...inviteEmails, ...pendingEntries]));
	}

	async function handleFinish(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		try {
			const inviteEmailsForSubmit = getInviteEmailsForSubmit();
			setInviteEmails(inviteEmailsForSubmit);
			setInviteEmailInput("");
			setIsPending(true);

			await completeOnboarding({
				data: {
					organizationName,
					organizationType,
					inviteCode,
					inviteEmails: inviteEmailsForSubmit,
				},
			});
			await queryClient.invalidateQueries({
				queryKey: onboardingStatusQueryKey,
			});
			await navigate({ to: "/" });
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Could not finish setup.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<main className="grid min-h-screen bg-background text-foreground lg:h-svh lg:min-h-0 lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(520px,1fr)]">
			<section className="flex min-h-screen items-center justify-center border-border px-6 py-10 lg:h-svh lg:min-h-0 lg:border-r">
				<div className="w-full max-w-md">
					<AnimatePresence custom={direction} initial={false} mode="wait">
						<motion.div
							animate="animate"
							custom={direction}
							exit="exit"
							initial="initial"
							key={step}
							transition={stepTransition}
							variants={stepMotion}
						>
							<div className="mb-8">
								<p className="mb-3 text-sm font-medium text-muted-foreground">
									Step {step} of 2
								</p>
								<h1 className="text-3xl font-semibold tracking-normal">
									{step === 1 ? "Set up your workspace" : "Invite your team"}
								</h1>
								<p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
									{step === 1
										? "Tell us what to call your organization so TownSqr can shape the first workspace around it."
										: "Share this invite code or send a first invite by email. You can add more people later."}
								</p>
							</div>

							{step === 1 ? (
								<form
									className="grid gap-5 space-y-5"
									onSubmit={(event) => event.preventDefault()}
								>
									<div className="grid gap-2">
										<Label htmlFor="organization-name">Organization name</Label>
										<Input
											autoComplete="organization"
											id="organization-name"
											name="organizationName"
											onChange={(event) =>
												setOrganizationName(event.target.value)
											}
											required
											value={organizationName}
										/>
									</div>

									<div className="grid gap-3">
										<Label>Type of organization</Label>
										<div className="flex flex-wrap gap-2">
											{organizationTypeOptions.map((option) => (
												<Button
													aria-pressed={organizationType === option.value}
													className={cn(
														organizationType === option.value &&
															"border-foreground bg-muted text-foreground",
													)}
													key={option.value}
													onClick={() => setOrganizationType(option.value)}
													type="button"
													variant="outline"
												>
													{option.label}
												</Button>
											))}
										</div>
									</div>

									{error ? <FormError message={error} /> : null}

									<Button onClick={handleContinue} type="button">
										Continue
									</Button>
								</form>
							) : (
								<form className="grid gap-5 space-y-6" onSubmit={handleFinish}>
									<Card className="text-center">
										<p className="text-xs tracking-wide text-muted-foreground">
											Invite code
										</p>
										<p className="font-mono text-xl font-semibold tracking-[0.18em]">
											{inviteCode || "--------"}
										</p>
									</Card>

									<InviteEmailInput
										emails={inviteEmails}
										onAddEmails={addInviteEmails}
										onChangeInput={setInviteEmailInput}
										onRemoveEmail={removeInviteEmail}
										value={inviteEmailInput}
									/>

									{error ? <FormError message={error} /> : null}

									<div className="grid grid-cols-2 gap-2">
										<Button
											disabled={isPending}
											onClick={handleBack}
											type="button"
											variant="outline"
										>
											Back
										</Button>
										<Button disabled={isPending || !inviteCode}>
											{isPending ? "Finishing..." : "Finish"}
										</Button>
									</div>
								</form>
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</section>

			<OnboardingPreview step={step} />
		</main>
	);
}

function FormError({ message }: { message: string }) {
	return (
		<p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
			{message}
		</p>
	);
}
