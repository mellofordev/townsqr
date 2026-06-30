import { createFileRoute } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

export const Route = createFileRoute("/knowledge")({
	component: KnowledgePage,
	head: () => ({
		meta: [{ title: "Knowledge Library | TownSqr" }],
	}),
});

const documents = [
	"Employee handbook",
	"Security and access policy",
	"Customer escalation playbook",
	"Remote work guidelines",
];

function KnowledgePage() {
	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
			<header className="border-b pb-5">
				<p className="text-sm font-medium text-muted-foreground">Browse</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-normal">
					Knowledge Library
				</h1>
				<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
					Canonical workspace documents, policies, and reusable team knowledge.
				</p>
			</header>

			<Card className="rounded-2xl" size="sm">
				<CardHeader>
					<CardTitle>Featured Documents</CardTitle>
					<CardDescription>
						Structured knowledge collections will be organized here.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-2">
					{documents.map((document) => (
						<div
							className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm font-medium"
							key={document}
						>
							{document}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
