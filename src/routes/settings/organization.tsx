import { createFileRoute } from "@tanstack/react-router";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { requireWorkspaceSettingsRoute } from "#/lib/route-guards.ts";
import { useWorkspaceSettings } from "#/lib/workspace.ts";
import { organizationTypeOptions } from "#/types/index.ts";
import { SettingsHeader } from "./-settings-header.tsx";

export const Route = createFileRoute("/settings/organization")({
	loader: requireWorkspaceSettingsRoute,
	component: OrganizationSettingsPage,
	head: () => ({
		meta: [{ title: "Organization Settings | TownSqr" }],
	}),
});

function OrganizationSettingsPage() {
	const { data: settings } = useWorkspaceSettings();

	if (!settings) {
		return null;
	}

	const organizationType =
		organizationTypeOptions.find(
			(option) => option.value === settings.organization.type,
		)?.label ?? settings.organization.type;
	const pendingInviteCount = settings.invites.filter(
		(invite) => invite.status === "pending",
	).length;
	const canWriteSettings =
		settings.member.role === "owner" || settings.member.role === "admin";

	return (
		<div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col px-6 py-8 lg:px-8">
			<SettingsHeader
				description="Manage workspace identity, access defaults, and invite details."
				title="Organization"
			/>

			<div className="mt-10 grid gap-10">
				<section className="grid gap-3">
					<h2 className="text-sm font-medium text-foreground">Workspace</h2>
					<Card size="sm">
						<CardHeader>
							<CardTitle className="text-sm">Organization details</CardTitle>
							<CardDescription className="text-xs">
								Core details used across TownSqr navigation and invitations.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-5">
							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
								<div className="min-w-0">
									<div className="text-sm font-medium text-foreground">
										Name
									</div>
									<div className="mt-1 text-xs text-muted-foreground">
										Shown in navigation, invites, and workspace headers.
									</div>
								</div>
								<div className="min-w-0 text-sm font-medium">
									{settings.organization.name}
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
								<div className="min-w-0">
									<div className="text-sm font-medium text-foreground">
										Organization type
									</div>
									<div className="mt-1 text-xs text-muted-foreground">
										Used to tailor onboarding and default workspace setup.
									</div>
								</div>
								<div className="min-w-0 text-sm font-medium">
									{organizationType}
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
								<div className="min-w-0">
									<div className="text-sm font-medium text-foreground">
										Invite code
									</div>
									<div className="mt-1 text-xs text-muted-foreground">
										Shared with people who are joining this organization.
									</div>
								</div>
								<div className="min-w-0 text-sm font-medium">
									{canWriteSettings ? (
										<code className="font-mono text-sm font-medium">
											{settings.organization.inviteCode}
										</code>
									) : (
										<span className="text-muted-foreground">Restricted</span>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				<section className="grid gap-3">
					<h2 className="text-sm font-medium text-foreground">Access</h2>
					<Card size="sm">
						<CardHeader>
							<CardTitle className="text-sm">Membership overview</CardTitle>
							<CardDescription className="text-xs">
								Current workspace access and invitation status.
							</CardDescription>
							<CardAction>
								<div className="text-sm font-medium">
									{settings.members.length} members
								</div>
							</CardAction>
						</CardHeader>
						<CardContent className="grid gap-5">
							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
								<div className="min-w-0">
									<div className="text-sm font-medium text-foreground">
										Members
									</div>
									<div className="mt-1 text-xs text-muted-foreground">
										People with active access to this workspace.
									</div>
								</div>
								<div className="min-w-0 text-sm font-medium">
									{settings.members.length}
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
								<div className="min-w-0">
									<div className="text-sm font-medium text-foreground">
										Pending invitations
									</div>
									<div className="mt-1 text-xs text-muted-foreground">
										People invited but not joined yet.
									</div>
								</div>
								<div className="min-w-0 text-sm font-medium">
									{pendingInviteCount}
								</div>
							</div>
						</CardContent>
					</Card>
				</section>
			</div>
		</div>
	);
}
