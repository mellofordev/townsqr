import { createFileRoute } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

export const Route = createFileRoute("/resources")({
	component: ResourcesPage,
	head: () => ({
		meta: [{ title: "Resources | TownSqr" }],
	}),
});

const resources = [
	{
		name: "Workspace directory",
		description: "Find members, teams, and reporting groups.",
	},
	{
		name: "Events calendar",
		description: "Track company events, celebrations, and all-hands.",
	},
	{
		name: "Admin requests",
		description:
			"Submit access, moderation, and workspace operations requests.",
	},
];

function ResourcesPage() {
	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
			<header className="border-b pb-5">
				<p className="text-sm font-medium text-muted-foreground">Browse</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-normal">
					Resources
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
					Quick access to workspace tools, operations, and admin surfaces.
				</p>
			</header>

			<div className="grid gap-3 md:grid-cols-3">
				{resources.map((resource) => (
					<Card className="rounded-2xl" key={resource.name} size="sm">
						<CardHeader>
							<CardTitle>{resource.name}</CardTitle>
							<CardDescription>{resource.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-xs font-medium text-muted-foreground">
								Coming soon
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
