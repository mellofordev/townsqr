import { HashtagIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "#/components/ui/sheet.tsx";
import { requireWorkspaceSettingsRoute } from "#/lib/route-guards.ts";
import {
	createOrganizationChannel,
	useWorkspaceSettings,
	workspaceSettingsQueryKey,
	workspaceSummaryQueryKey,
} from "#/lib/workspace.ts";
import { SettingsHeader } from "./-settings-header.tsx";

export const Route = createFileRoute("/settings/channels")({
	loader: requireWorkspaceSettingsRoute,
	component: ChannelsSettingsPage,
	head: () => ({
		meta: [{ title: "Channels | TownSqr Settings" }],
	}),
});

const dateFormatter = new Intl.DateTimeFormat("en", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

interface CreateChannelForm {
	name: string;
}

const createChannelDefaultValues: CreateChannelForm = {
	name: "",
};

function ChannelsSettingsPage() {
	const { data: settings } = useWorkspaceSettings();
	const queryClient = useQueryClient();
	const [isCreateChannelOpen, setIsCreateChannelOpen] = React.useState(false);
	const [channelError, setChannelError] = React.useState<string | null>(null);
	const channelForm = useForm({
		defaultValues: createChannelDefaultValues,
		onSubmit: async ({ value }) => {
			setChannelError(null);

			try {
				await createOrganizationChannel({ data: { name: value.name } });
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: workspaceSettingsQueryKey,
					}),
					queryClient.invalidateQueries({ queryKey: workspaceSummaryQueryKey }),
				]);
				channelForm.reset();
				setIsCreateChannelOpen(false);
			} catch (caughtError) {
				setChannelError(
					caughtError instanceof Error
						? caughtError.message
						: "Could not create channel.",
				);
			}
		},
		validators: {
			onSubmit: ({ value }) => {
				const name = value.name.trim();

				if (name.length < 2 || name.length > 40) {
					return {
						fields: {
							name: "Keep channel names between 2 and 40 characters.",
						},
					};
				}

				return undefined;
			},
		},
	});

	if (!settings) {
		return null;
	}

	const canWriteSettings =
		settings.member.role === "owner" || settings.member.role === "admin";

	return (
		<div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col px-6 py-8 lg:px-8">
			<SettingsHeader
				description="See the channels people can be invited into."
				title="Channels"
			>
				{canWriteSettings ? (
					<Sheet
						open={isCreateChannelOpen}
						onOpenChange={setIsCreateChannelOpen}
					>
						<SheetTrigger asChild>
							<Button size="sm">
								<PlusIcon data-icon="inline-start" />
								Create channel
							</Button>
						</SheetTrigger>
						<SheetContent
							className="w-full data-[side=right]:border-l-0 sm:max-w-md"
							onEscapeKeyDown={(event) => event.preventDefault()}
							onInteractOutside={(event) => event.preventDefault()}
						>
							<SheetHeader>
								<SheetTitle>Create channel</SheetTitle>
								<SheetDescription>
									Add a channel for discussions, announcements, or teams.
								</SheetDescription>
							</SheetHeader>
							<form
								className="flex min-h-0 flex-1 flex-col"
								onSubmit={(event) => {
									event.preventDefault();
									event.stopPropagation();
									void channelForm.handleSubmit();
								}}
							>
								<div className="grid gap-5 overflow-y-auto px-6 py-5">
									{channelError ? (
										<div className="rounded-3xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
											{channelError}
										</div>
									) : null}

									<div className="grid gap-2">
										<Label htmlFor="channel-name">Name</Label>
										<channelForm.Field name="name">
											{(field) => (
												<>
													<Input
														id="channel-name"
														name={field.name}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														placeholder="engineering"
														required
														value={field.state.value}
													/>
													{field.state.meta.errors[0] ? (
														<p className="text-xs text-destructive">
															{String(field.state.meta.errors[0])}
														</p>
													) : null}
												</>
											)}
										</channelForm.Field>
									</div>
								</div>

								<SheetFooter>
									<channelForm.Subscribe
										selector={(state) => state.isSubmitting}
									>
										{(isSubmitting) => (
											<Button disabled={isSubmitting} type="submit">
												{isSubmitting ? "Creating..." : "Create channel"}
											</Button>
										)}
									</channelForm.Subscribe>
								</SheetFooter>
							</form>
						</SheetContent>
					</Sheet>
				) : null}
			</SettingsHeader>

			<section className="mt-10 grid gap-3">
				<h2 className="text-sm font-medium text-foreground">
					Workspace channels
				</h2>
				<Card size="sm">
					<CardHeader>
						<CardTitle className="text-sm">Channels</CardTitle>
						<CardDescription className="text-xs">
							These channels can be selected when inviting a new member.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3">
						{settings.channels.map((channel) => (
							<div
								className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
								key={channel.id}
							>
								<div className="flex min-w-0 items-center gap-3">
									<HashtagIcon className="size-4 flex-none text-muted-foreground" />
									<div className="min-w-0">
										<div className="truncate text-sm font-medium">
											{channel.name}
										</div>
										<div className="truncate text-xs text-muted-foreground">
											/{channel.slug}
										</div>
									</div>
								</div>
								<div className="hidden text-xs text-muted-foreground sm:block">
									Created {formatDate(channel.createdAt)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}

function formatDate(value: string) {
	return dateFormatter.format(new Date(value));
}
