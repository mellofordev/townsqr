import { createFileRoute } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { requireWorkspaceRoute } from "#/lib/route-guards.ts";

export const Route = createFileRoute("/notifications/")({
	loader: requireWorkspaceRoute,
	component: NotificationsIndexPage,
	head: () => ({
		meta: [{ title: "Notifications | TownSqr" }],
	}),
});

const notifications = [
	{
		title: "Maya mentioned you in Company News",
		description: "Can you add the customer rollout timeline here?",
		time: "8 min ago",
	},
	{
		title: "People Ops published a new announcement",
		description: "Benefits enrollment dates are now available.",
		time: "34 min ago",
	},
	{
		title: "Engineering has 4 unread channel updates",
		description: "Sprint planning notes and release blockers were posted.",
		time: "1 hr ago",
	},
];

function NotificationsIndexPage() {
	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
			<header className="border-b pb-5">
				<p className="text-sm font-medium text-muted-foreground">Home</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-normal">
					Notifications
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
					Recent mentions, announcements, channel activity, and workspace
					reminders.
				</p>
			</header>

			<Card className="rounded-2xl" size="sm">
				<CardHeader>
					<CardTitle>Unread</CardTitle>
					<CardDescription>Items that need your attention.</CardDescription>
				</CardHeader>
				<CardContent className="divide-y px-0">
					{notifications.map((notification) => (
						<div
							className="grid gap-1 px-4 py-3 text-sm"
							key={notification.title}
						>
							<div className="flex items-center justify-between gap-4">
								<p className="font-medium">{notification.title}</p>
								<span className="shrink-0 text-xs text-muted-foreground">
									{notification.time}
								</span>
							</div>
							<p className="text-muted-foreground">
								{notification.description}
							</p>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
