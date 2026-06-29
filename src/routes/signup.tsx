import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthForm } from "#/components/auth/auth-form.tsx";
import { authSessionQueryOptions } from "#/lib/auth-session.ts";

export const Route = createFileRoute("/signup")({
	validateSearch: (search: Record<string, unknown>) => ({
		inviteCode:
			typeof search.inviteCode === "string" ? search.inviteCode : undefined,
	}),
	loader: async ({ context, location }) => {
		const search = location.search as { inviteCode?: unknown };
		const inviteCode =
			typeof search.inviteCode === "string" ? search.inviteCode : undefined;

		if (!inviteCode) {
			return;
		}

		const session = await context.queryClient.ensureQueryData(
			authSessionQueryOptions(),
		);

		if (session) {
			throw redirect({
				search: { inviteCode },
				to: "/join",
			});
		}
	},
	component: SignUpPage,
	head: () => ({
		meta: [{ title: "Sign up | TownSqr" }],
	}),
});

function SignUpPage() {
	const { inviteCode } = Route.useSearch();

	return <AuthForm inviteCode={inviteCode} mode="signup" />;
}
