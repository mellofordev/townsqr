import { useForm } from "@tanstack/react-form";

import { ChannelNameInput } from "#/components/onboarding/channel-input.tsx";

import { Button } from "#/components/ui/button.tsx";
import { Step2Preview } from "../preview/step2.tsx";
import { FormError, OnboardingStepShell } from "./shell.tsx";
import type { OnboardingStepProps } from "./types.ts";

const CHANNEL_SPLIT_PATTERN = /[\n,;]+/;

export const channelsStep = {
	description:
		"Choose the shared spaces people will see first. Start with broad channels and add private teams later.",
	id: "channels",
	title: "Create your first channels",
} as const;

interface ChannelsStepForm {
	channelNameInput: string;
	channelNames: string[];
}

function normalizeChannelName(channelName: string) {
	return channelName.trim().replace(/\s+/g, " ");
}

function getChannelNameEntries(value: string) {
	return value
		.split(CHANNEL_SPLIT_PATTERN)
		.map(normalizeChannelName)
		.filter(Boolean);
}

function mergeChannelNames(channelNames: string[], input: string) {
	return Array.from(
		new Map(
			[...channelNames, ...getChannelNameEntries(input)].map((channelName) => [
				channelName.toLowerCase(),
				channelName,
			]),
		).values(),
	);
}

function getChannelNamesError(channelNames: string[]) {
	if (channelNames.length === 0) {
		return "Add at least one channel.";
	}

	return channelNames.some(
		(channelName) => channelName.length < 2 || channelName.length > 40,
	)
		? "Keep channel names between 2 and 40 characters."
		: undefined;
}

export function ChannelsStep({
	data,
	onBack,
	onContinue,
	stepNumber,
	totalSteps,
}: OnboardingStepProps) {
	const form = useForm({
		defaultValues: {
			channelNameInput: "",
			channelNames: data.channelNames,
		} satisfies ChannelsStepForm,
		onSubmit: ({ value }) => {
			onContinue({
				channelNames: mergeChannelNames(
					value.channelNames,
					value.channelNameInput,
				),
			});
		},
		validators: {
			onSubmit: ({ value }) => {
				const error = getChannelNamesError(
					mergeChannelNames(value.channelNames, value.channelNameInput),
				);

				return error ? { fields: { channelNames: error } } : undefined;
			},
		},
	});

	function addChannelNames(value: string) {
		const nextChannelNames = mergeChannelNames(
			form.getFieldValue("channelNames"),
			value,
		);
		const error = getChannelNamesError(nextChannelNames);

		if (error) {
			form.setFieldMeta("channelNames", (meta) => ({
				...meta,
				errorMap: {
					...meta.errorMap,
					onSubmit: error,
				},
			}));
			return false;
		}

		form.setFieldValue("channelNames", nextChannelNames);
		form.setFieldValue("channelNameInput", "");
		return true;
	}

	return (
		<OnboardingStepShell
			description={channelsStep.description}
			preview={
				<form.Subscribe selector={(state) => state.values.channelNames}>
					{(channelNames) => (
						<Step2Preview
							channelNames={channelNames}
							organizationName={data.organizationName}
						/>
					)}
				</form.Subscribe>
			}
			stepLabel={`Step ${stepNumber} of ${totalSteps}`}
			title={channelsStep.title}
		>
			<form
				className="grid gap-5 space-y-6"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field name="channelNames">
					{(channelNamesField) => (
						<form.Field name="channelNameInput">
							{(inputField) => (
								<ChannelNameInput
									channelNames={channelNamesField.state.value}
									onAddChannelNames={addChannelNames}
									onChangeInput={(value) => inputField.handleChange(value)}
									onRemoveChannelName={(channelName) =>
										channelNamesField.handleChange(
											channelNamesField.state.value.filter(
												(currentChannelName) =>
													currentChannelName !== channelName,
											),
										)
									}
									value={inputField.state.value}
								/>
							)}
						</form.Field>
					)}
				</form.Field>

				<form.Field name="channelNames">
					{(field) =>
						field.state.meta.errors[0] ? (
							<FormError message={String(field.state.meta.errors[0])} />
						) : null
					}
				</form.Field>

				<div className="grid grid-cols-2 gap-2">
					<Button onClick={onBack} type="button" variant="outline">
						Back
					</Button>
					<Button type="submit">Continue</Button>
				</div>
			</form>
		</OnboardingStepShell>
	);
}
