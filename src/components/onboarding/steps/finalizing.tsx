import { FinalSetupPreview } from "../preview/final-setup.tsx";
import { OnboardingStepShell } from "./shell.tsx";
import type { FinalizingStepProps } from "./types.ts";

const setupStatusLabels = {
	active: "Working",
	complete: "Done",
	pending: "Queued",
} satisfies Record<"active" | "complete" | "pending", string>;

export function FinalizingStep({ data }: FinalizingStepProps) {
	return (
		<OnboardingStepShell
			description="We are creating the workspace, channels, invite records, and first workspace structure."
			preview={
				<FinalSetupPreview
					channelNames={data.channelNames}
					organizationName={data.organizationName}
				/>
			}
			stepLabel="Final step"
			title="Setting up your workplace"
		>
			<div className="mt-8 grid gap-3" aria-live="polite">
				<SetupStatus label="Creating organization" state="complete" />
				<SetupStatus label="Creating channels" state="active" />
				<SetupStatus label="Preparing invites" state="pending" />
				<SetupStatus label="Opening workspace" state="pending" />
			</div>
		</OnboardingStepShell>
	);
}

function SetupStatus({
	label,
	state,
}: {
	label: string;
	state: "active" | "complete" | "pending";
}) {
	return (
		<div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
			<span className="font-medium">{label}</span>
			<span className="text-xs text-muted-foreground">
				{setupStatusLabels[state]}
			</span>
		</div>
	);
}
