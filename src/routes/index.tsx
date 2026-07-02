import { createFileRoute } from "@tanstack/react-router";

import { requireWorkspaceRoute } from "#/lib/route-guards.ts";

export const Route = createFileRoute("/")({
	loader: requireWorkspaceRoute,
	component: FeedPage,
	head: () => ({
		meta: [{ title: "Feed | TownSqr" }],
	}),
});

function FeedPage() {
	return (
		<div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 px-6 py-6">
			feed
		</div>
	);
}
