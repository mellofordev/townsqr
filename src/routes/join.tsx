import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import { authSessionQueryOptions } from "#/lib/auth-session.ts";
import { acceptOrganizationInvite } from "#/lib/invites.ts";
import { onboardingStatusQueryKey } from "#/lib/onboarding.ts";

export const Route = createFileRoute("/join")({
	validateSearch: (search: Record<string, unknown>) => ({
		inviteCode:
			typeof search.inviteCode === "string" ? search.inviteCode : undefined,
	}),
	loader: async ({ context, location }) => {
		const session = await context.queryClient.ensureQueryData(
			authSessionQueryOptions(),
		);
		const search = location.search as { inviteCode?: unknown };
		const inviteCode =
			typeof search.inviteCode === "string" ? search.inviteCode : undefined;

		if (!inviteCode) {
			throw redirect({ to: "/onboarding" });
		}

		if (!session) {
			throw redirect({
				search: { inviteCode },
				to: "/signup",
			});
		}
	},
	component: JoinOrganizationPage,
	head: () => ({
		meta: [{ title: "Join workspace | TownSqr" }],
	}),
});

function JoinOrganizationPage() {
	const { inviteCode } = Route.useSearch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		let isMounted = true;

		async function joinOrganization() {
			if (!inviteCode) {
				return;
			}

			try {
				await acceptOrganizationInvite({ data: { inviteCode } });
				await queryClient.invalidateQueries({
					queryKey: onboardingStatusQueryKey,
				});
				await navigate({ to: "/" });
			} catch (caughtError) {
				if (!isMounted) {
					return;
				}

				setError(
					caughtError instanceof Error
						? caughtError.message
						: "Could not join this workspace.",
				);
			}
		}

		void joinOrganization();

		return () => {
			isMounted = false;
		};
	}, [inviteCode, navigate, queryClient]);

	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
			<section className="w-full max-w-sm rounded-lg border bg-card p-5 shadow-xs">
				<h1 className="text-xl font-semibold tracking-normal">
					Joining workspace
				</h1>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					We are adding your account to the invited organization.
				</p>

				{error ? (
					<div className="mt-5 grid gap-4">
						<p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
						<Button asChild variant="outline">
							<Link to="/onboarding">Set up a workspace</Link>
						</Button>
					</div>
				) : null}
			</section>
		</main>
	);
}
