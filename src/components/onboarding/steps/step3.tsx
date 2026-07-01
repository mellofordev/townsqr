import { useForm } from "@tanstack/react-form";

import { InviteEmailInput } from "#/components/onboarding/email-input.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Card } from "#/components/ui/card.tsx";

import { Step3Preview } from "../preview/step3.tsx";
import { FormError, OnboardingStepShell } from "./shell.tsx";
import type { OnboardingStepProps } from "./types.ts";

const EMAIL_SPLIT_PATTERN = /[\s,;]+/;
const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const invitesStep = {
	description:
		"Share this invite code or send a first invite by email. You can add more people later.",
	id: "invites",
	title: "Invite your team",
} as const;

interface InvitesStepForm {
	inviteEmailInput: string;
	inviteEmails: string[];
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

function getInviteEmailsError(inviteEmails: string[], input: string) {
	const pendingEntries = getEmailEntries(input);
	const invalidEmail = [...inviteEmails, ...pendingEntries].find(
		(entry) => !isEmailAddress(entry),
	);

	return invalidEmail ? `Check the email address: ${invalidEmail}` : undefined;
}

function mergeInviteEmails(inviteEmails: string[], input: string) {
	return Array.from(new Set([...inviteEmails, ...getEmailEntries(input)]));
}

export function InvitesStep({
	data,
	onBack,
	onContinue,
	submissionError,
	stepNumber,
	totalSteps,
}: OnboardingStepProps) {
	const form = useForm({
		defaultValues: {
			inviteEmailInput: "",
			inviteEmails: data.inviteEmails,
		} satisfies InvitesStepForm,
		onSubmit: ({ value }) => {
			onContinue({
				inviteEmails: mergeInviteEmails(
					value.inviteEmails,
					value.inviteEmailInput,
				),
			});
		},
		validators: {
			onSubmit: ({ value }) => {
				const error = getInviteEmailsError(
					value.inviteEmails,
					value.inviteEmailInput,
				);

				return error ? { fields: { inviteEmails: error } } : undefined;
			},
		},
	});

	function addInviteEmails(value: string) {
		const currentInviteEmails = form.getFieldValue("inviteEmails");
		const error = getInviteEmailsError(currentInviteEmails, value);

		if (error) {
			form.setFieldMeta("inviteEmails", (meta) => ({
				...meta,
				errorMap: {
					...meta.errorMap,
					onSubmit: error,
				},
			}));
			return false;
		}

		form.setFieldValue(
			"inviteEmails",
			mergeInviteEmails(currentInviteEmails, value),
		);
		form.setFieldValue("inviteEmailInput", "");
		return true;
	}

	return (
		<OnboardingStepShell
			description={invitesStep.description}
			preview={<Step3Preview inviteCode={data.inviteCode} />}
			stepLabel={`Step ${stepNumber} of ${totalSteps}`}
			title={invitesStep.title}
		>
			<form
				className="grid gap-5 space-y-6"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<Card className="text-center">
					<p className="text-xs tracking-wide text-muted-foreground">
						Invite code
					</p>
					<p className="font-mono text-xl font-semibold tracking-[0.18em]">
						{data.inviteCode || "--------"}
					</p>
				</Card>

				<form.Field name="inviteEmails">
					{(inviteEmailsField) => (
						<form.Field name="inviteEmailInput">
							{(inputField) => (
								<InviteEmailInput
									emails={inviteEmailsField.state.value}
									onAddEmails={addInviteEmails}
									onChangeInput={(value) => inputField.handleChange(value)}
									onRemoveEmail={(email) =>
										inviteEmailsField.handleChange(
											inviteEmailsField.state.value.filter(
												(currentEmail) => currentEmail !== email,
											),
										)
									}
									value={inputField.state.value}
								/>
							)}
						</form.Field>
					)}
				</form.Field>

				<form.Field name="inviteEmails">
					{(field) =>
						field.state.meta.errors[0] ? (
							<FormError message={String(field.state.meta.errors[0])} />
						) : null
					}
				</form.Field>
				{submissionError ? <FormError message={submissionError} /> : null}

				<div className="grid grid-cols-2 gap-2">
					<Button onClick={onBack} type="button" variant="outline">
						Back
					</Button>
					<Button disabled={!data.inviteCode} type="submit">
						Finish
					</Button>
				</div>
			</form>
		</OnboardingStepShell>
	);
}
