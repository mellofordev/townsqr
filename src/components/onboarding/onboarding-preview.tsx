import type * as React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { cn } from "#/lib/utils.ts";

interface OnboardingPreviewProps {
	step: number;
}

export function OnboardingPreview({ step }: OnboardingPreviewProps) {
	return (
		<section className="hidden min-h-screen overflow-hidden bg-muted/35 px-12 py-14 lg:block">
			<div
				className="mx-auto flex h-full max-w-2xl flex-col justify-center motion-safe:animate-[onboarding-step-in_260ms_ease-out]"
				key={step}
			>
				{step === 1 ? <WorkspacePreview /> : <InvitePreview />}
			</div>
		</section>
	);
}

function WorkspacePreview() {
	return (
		<>
			<h2 className="text-5xl font-semibold tracking-normal">
				Shape the first town square.
			</h2>
			<div className="relative mt-20 h-[460px]">
				<IllustrationCard className="top-0 left-8 rotate-[-2deg]">
					<CardHeader>
						<CardDescription>Workspace</CardDescription>
						<CardTitle>Acme Studio</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-2 text-sm text-muted-foreground">
							<p>General company feed</p>
							<p>Team rooms and announcements</p>
						</div>
					</CardContent>
				</IllustrationCard>

				<IllustrationCard className="top-16 right-4 rotate-[2deg]">
					<CardHeader>
						<CardDescription>Org type</CardDescription>
						<CardTitle>Startup</CardTitle>
					</CardHeader>
				</IllustrationCard>

				<IllustrationCard className="top-52 left-24 rotate-[1deg]">
					<CardHeader>
						<CardDescription>Channels</CardDescription>
						<CardTitle>Engineering, Design, Sales</CardTitle>
					</CardHeader>
				</IllustrationCard>

				<IllustrationCard className="right-16 bottom-14 rotate-[-1deg]">
					<CardHeader>
						<CardDescription>Announcement</CardDescription>
						<CardTitle>Monday company update</CardTitle>
					</CardHeader>
				</IllustrationCard>
			</div>
		</>
	);
}

function InvitePreview() {
	return (
		<>
			<h2 className="text-5xl font-semibold tracking-normal">
				Bring the first people in.
			</h2>
			<div className="relative mt-20 h-[460px]">
				<IllustrationCard className="top-0 left-6 w-72 rotate-[-1deg]">
					<CardHeader>
						<CardDescription>Invite code</CardDescription>
						<CardTitle className="font-mono text-2xl tracking-[0.18em]">
							TOWN2026
						</CardTitle>
					</CardHeader>
				</IllustrationCard>

				<IllustrationCard className="top-20 right-4 w-72 rotate-[2deg]">
					<CardHeader>
						<CardDescription>Email invite</CardDescription>
						<CardTitle>maya@acme.com</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Invite queued for workspace access.
						</p>
					</CardContent>
				</IllustrationCard>

				<IllustrationCard className="bottom-24 left-20 w-72 rotate-[1deg]">
					<CardHeader>
						<CardDescription>Members</CardDescription>
						<CardTitle>3 teammates pending</CardTitle>
					</CardHeader>
				</IllustrationCard>

				<IllustrationCard className="right-20 bottom-6 w-72 rotate-[-2deg]">
					<CardHeader>
						<CardDescription>Access</CardDescription>
						<CardTitle>Owner, member, guest</CardTitle>
					</CardHeader>
				</IllustrationCard>
			</div>
		</>
	);
}

function IllustrationCard({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Card
			className={cn(
				"absolute w-64 shadow-[0_18px_50px_rgba(0,0,0,0.08)]",
				className,
			)}
			size="sm"
		>
			{children}
		</Card>
	);
}
