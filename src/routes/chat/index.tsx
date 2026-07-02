import { createFileRoute } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { requireWorkspaceRoute } from "#/lib/route-guards.ts";

export const Route = createFileRoute("/chat/")({
	loader: requireWorkspaceRoute,
	component: ChatIndexPage,
	head: () => ({
		meta: [{ title: "Chat | TownSqr" }],
	}),
});

const conversations = [
	{
		name: "Product Launch Room",
		message: "Priya: The launch notes are ready for review.",
		time: "Now",
	},
	{
		name: "People Ops",
		message: "Maya: I shared the onboarding checklist.",
		time: "12 min",
	},
	{
		name: "Support Desk",
		message: "Ravi: The incident summary is posted.",
		time: "42 min",
	},
];

function ChatIndexPage() {
	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
			<header className="border-b pb-5">
				<p className="text-sm font-medium text-muted-foreground">Home</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-normal">Chat</h1>
				<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
					Direct messages, room conversations, and realtime workspace
					discussions.
				</p>
			</header>

			<Card className="rounded-2xl" size="sm">
				<CardHeader>
					<CardTitle>Recent Conversations</CardTitle>
					<CardDescription>
						Durable Object backed chat rooms will attach here.
					</CardDescription>
				</CardHeader>
				<CardContent className="divide-y px-0">
					{conversations.map((conversation) => (
						<div
							className="grid gap-1 px-4 py-3 text-sm"
							key={conversation.name}
						>
							<div className="flex items-center justify-between gap-4">
								<p className="font-medium">{conversation.name}</p>
								<span className="shrink-0 text-xs text-muted-foreground">
									{conversation.time}
								</span>
							</div>
							<p className="text-muted-foreground">{conversation.message}</p>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
