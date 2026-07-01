import { useForm } from "@tanstack/react-form";

import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import { cn } from "#/lib/utils.ts";
import {
	type OrganizationType,
	organizationTypeOptions,
} from "#/types/index.ts";

import { Step1Preview } from "../preview/step1.tsx";
import { FormError, OnboardingStepShell } from "./shell.tsx";
import type { OnboardingStepProps } from "./types.ts";

export const workspaceStep = {
	description:
		"Tell us what to call your organization so TownSqr can shape the first workspace around it.",
	id: "workspace",
	title: "Set up your workspace",
} as const;

interface WorkspaceStepForm {
	organizationName: string;
	organizationType: OrganizationType;
}

export function WorkspaceStep({
	data,
	onContinue,
	stepNumber,
	totalSteps,
}: OnboardingStepProps) {
	const form = useForm({
		defaultValues: {
			organizationName: data.organizationName,
			organizationType: data.organizationType,
		} satisfies WorkspaceStepForm,
		onSubmit: ({ value }) => {
			onContinue({
				organizationName: value.organizationName.trim(),
				organizationType: value.organizationType,
			});
		},
	});

	return (
		<OnboardingStepShell
			description={workspaceStep.description}
			preview={<Step1Preview />}
			stepLabel={`Step ${stepNumber} of ${totalSteps}`}
			title={workspaceStep.title}
		>
			<form
				className="grid gap-5 space-y-5"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field
					name="organizationName"
					validators={{
						onSubmit: ({ value }) =>
							value.trim().length < 2
								? "Enter your organization name."
								: undefined,
					}}
				>
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor={field.name}>Organization name</Label>
							<Input
								autoComplete="organization"
								id={field.name}
								name={field.name}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								required
								value={field.state.value}
							/>
							{field.state.meta.errors[0] ? (
								<FormError message={String(field.state.meta.errors[0])} />
							) : null}
						</div>
					)}
				</form.Field>

				<form.Field name="organizationType">
					{(field) => (
						<div className="grid gap-3">
							<Label>Type of organization</Label>
							<div className="flex flex-wrap gap-2">
								{organizationTypeOptions.map((option) => (
									<Button
										aria-pressed={field.state.value === option.value}
										className={cn(
											field.state.value === option.value &&
												"border-foreground bg-muted text-foreground",
										)}
										key={option.value}
										onClick={() => field.handleChange(option.value)}
										type="button"
										variant="outline"
									>
										{option.label}
									</Button>
								))}
							</div>
						</div>
					)}
				</form.Field>

				<Button type="submit">Continue</Button>
			</form>
		</OnboardingStepShell>
	);
}
