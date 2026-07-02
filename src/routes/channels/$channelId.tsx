import { createFileRoute } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { requireWorkspaceRoute } from "#/lib/route-guards.ts";

export const Route = createFileRoute("/channels/$channelId")({
	loader: requireWorkspaceRoute,
	component: ChannelPage,
	head: ({ params }) => ({
		meta: [{ title: `${formatChannelName(params.channelId)} | TownSqr` }],
	}),
});

function ChannelPage() {
	const { channelId } = Route.useParams();
	const channelName = formatChannelName(channelId);

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
			<header className="border-b pb-5">
				<p className="text-sm font-medium text-muted-foreground">Channel</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-normal">
					{channelName}
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
					Posts, announcements, membership, and moderation controls for this
					channel will be connected here.
				</p>
			</header>

			<Card className="rounded-2xl" size="sm">
				<CardHeader>
					<CardTitle>{channelName} activity</CardTitle>
					<CardDescription>
						This route is wired from the sidesheet channel navigation.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					<p>
						Use this page as the base for channel feed data, pinned posts,
						member permissions, and channel-level notification settings.
					</p>
					<div className="rounded-2xl border bg-muted/30 px-4 py-3 text-muted-foreground">
						No live channel posts have been connected yet.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function formatChannelName(channelId: string) {
	return channelId
		.split("-")
		.filter(Boolean)
		.map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
		.join(" ");
}
