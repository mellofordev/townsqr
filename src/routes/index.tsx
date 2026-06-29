import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { authClient } from "#/lib/auth-client.ts";
import {
	authSessionQueryOptions,
	useAuthSession,
	useAuthSessionCache,
} from "#/lib/auth-session.ts";
import { onboardingStatusQueryOptions } from "#/lib/onboarding.ts";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(
			authSessionQueryOptions(),
		);

		if (session) {
			const onboarding = await context.queryClient.ensureQueryData(
				onboardingStatusQueryOptions(),
			);

			if (!onboarding.organization) {
				throw redirect({ to: "/onboarding" });
			}
		}
	},
	component: Home,
	pendingComponent: HomePending,
	head: () => ({
		meta: [{ title: "TownSqr" }],
	}),
});

function Home() {
	const navigate = useNavigate();
	const { data: session, isFetching } = useAuthSession();
	const { setSession, invalidateSession } = useAuthSessionCache();
	const [isSigningOut, setIsSigningOut] = React.useState(false);

	async function handleLogout() {
		setIsSigningOut(true);

		try {
			await authClient.signOut();
			setSession(null);
			await invalidateSession();
			await navigate({ to: "/login" });
		} finally {
			setIsSigningOut(false);
		}
	}

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-8">
				<header className="flex items-center justify-between border-b pb-4">
					<Link className="text-sm font-semibold" to="/">
						TownSqr
					</Link>
					<nav className="flex items-center gap-2">
						{session ? (
							<Button
								className="rounded-md"
								disabled={isSigningOut}
								onClick={handleLogout}
								size="sm"
								variant="outline"
							>
								{isSigningOut ? "Logging out..." : "Log out"}
							</Button>
						) : (
							<>
								<Button
									asChild
									className="rounded-md"
									size="sm"
									variant="ghost"
								>
									<Link to="/login">Log in</Link>
								</Button>
								<Button asChild className="rounded-md" size="sm">
									<Link search={{ inviteCode: undefined }} to="/signup">
										Sign up
									</Link>
								</Button>
							</>
						)}
					</nav>
				</header>

				<section className="max-w-2xl">
					<p className="mb-3 text-sm font-medium text-muted-foreground">
						Workplace OS
					</p>
					<h1 className="text-3xl font-semibold tracking-normal">
						A focused home for company conversations.
					</h1>
					<p className="mt-4 max-w-xl text-base text-muted-foreground">
						TownSqr is taking shape as a simple alternative to Meta Workplace:
						posts, announcements, teams, and realtime chat in one company space.
					</p>
				</section>

				<section className="rounded-lg border bg-card p-5 text-sm shadow-xs">
					{session ? (
						<div className="grid gap-1">
							<p className="font-medium">
								Signed in{isFetching ? " · syncing" : ""}
							</p>
							<p className="text-muted-foreground">
								{session.user.name} · {session.user.email}
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="font-medium">No active session</p>
								<p className="text-muted-foreground">
									Create an account or log in to start the workspace flow.
								</p>
							</div>
							<Button asChild className="rounded-md">
								<Link search={{ inviteCode: undefined }} to="/signup">
									Create account
								</Link>
							</Button>
						</div>
					)}
				</section>
			</div>
		</main>
	);
}

function HomePending() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-8">
				<header className="flex items-center justify-between border-b pb-4">
					<Skeleton className="h-5 w-20 rounded-md" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-16 rounded-md" />
						<Skeleton className="h-8 w-20 rounded-md" />
					</div>
				</header>

				<section className="max-w-2xl">
					<Skeleton className="mb-3 h-4 w-24 rounded-md" />
					<Skeleton className="h-9 w-full max-w-xl rounded-md" />
					<Skeleton className="mt-4 h-5 w-full max-w-lg rounded-md" />
					<Skeleton className="mt-2 h-5 w-4/5 max-w-lg rounded-md" />
				</section>

				<section className="rounded-lg border bg-card p-5 shadow-xs">
					<Skeleton className="h-5 w-32 rounded-md" />
					<Skeleton className="mt-2 h-4 w-72 max-w-full rounded-md" />
				</section>
			</div>
		</main>
	);
}
