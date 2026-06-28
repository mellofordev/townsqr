import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "#/components/auth/auth-form.tsx";

export const Route = createFileRoute("/login")({
	component: LoginPage,
	head: () => ({
		meta: [{ title: "Log in | TownSqr" }],
	}),
});

function LoginPage() {
	return <AuthForm mode="login" />;
}
