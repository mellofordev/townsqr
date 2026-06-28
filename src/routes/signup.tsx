import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "#/components/auth/auth-form.tsx";

export const Route = createFileRoute("/signup")({
	component: SignUpPage,
	head: () => ({
		meta: [{ title: "Sign up | TownSqr" }],
	}),
});

function SignUpPage() {
	return <AuthForm mode="signup" />;
}
