import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import { authClient } from "#/lib/auth-client.ts";
import { authSessionQueryKey } from "#/lib/auth-session.ts";
import { acceptOrganizationInvite } from "#/lib/invites.ts";
import { onboardingStatusQueryKey } from "#/lib/onboarding.ts";

interface AuthFormProps {
	inviteCode?: string;
	mode: "login" | "signup";
}

function GoogleIcon(props: React.ComponentProps<"svg">) {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			viewBox="0 0 256 262"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
				fill="#4285f4"
			/>
			<path
				d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
				fill="#34a853"
			/>
			<path
				d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
				fill="#fbbc05"
			/>
			<path
				d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
				fill="#eb4335"
			/>
		</svg>
	);
}

function getFallbackName(email: string) {
	return email.split("@")[0] || "TownSqr member";
}

export function AuthForm({ inviteCode, mode }: AuthFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [showSignupPassword, setShowSignupPassword] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [isPending, setIsPending] = React.useState(false);
	const [isGooglePending, setIsGooglePending] = React.useState(false);
	const isSignup = mode === "signup";
	const shouldShowPassword = !isSignup || showSignupPassword;
	const signupRedirectPath =
		isSignup && inviteCode
			? `/join?inviteCode=${encodeURIComponent(inviteCode)}`
			: "/onboarding";
	const signupErrorPath =
		isSignup && inviteCode
			? `/signup?inviteCode=${encodeURIComponent(inviteCode)}`
			: "/signup";

	async function handleGoogleSignIn() {
		setError(null);
		setIsGooglePending(true);

		try {
			const result = await authClient.signIn.social({
				provider: "google",
				callbackURL: isSignup ? signupRedirectPath : "/",
				errorCallbackURL: isSignup ? signupErrorPath : "/login",
				requestSignUp: isSignup,
			});

			if (result.error) {
				setError(result.error.message || "Could not continue with Google.");
				setIsGooglePending(false);
			}
		} catch {
			setError("Could not continue with Google.");
			setIsGooglePending(false);
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") || "");
		const password = String(formData.get("password") || "");

		if (isSignup && !showSignupPassword) {
			setShowSignupPassword(true);
			window.requestAnimationFrame(() => {
				document.getElementById("password")?.focus();
			});
			return;
		}

		setIsPending(true);

		try {
			const result = isSignup
				? await authClient.signUp.email({
						name: getFallbackName(email),
						email,
						password,
					})
				: await authClient.signIn.email({
						email,
						password,
					});

			if (result.error) {
				setError(result.error.message || "Could not continue. Try again.");
				return;
			}

			await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });

			if (isSignup && inviteCode) {
				await acceptOrganizationInvite({ data: { inviteCode } });
				await queryClient.invalidateQueries({
					queryKey: onboardingStatusQueryKey,
				});
			}

			await navigate({ to: isSignup && !inviteCode ? "/onboarding" : "/" });
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Could not continue. Try again.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
			<section className="flex w-full max-w-[360px] flex-col">
				<div className="mb-5">
					<h1 className="text-xl font-semibold tracking-normal">
						{isSignup ? "Create your account" : "Welcome back"}
					</h1>
					{isSignup ? (
						<p className="mt-2 max-w-xs text-base font-medium leading-snug text-muted-foreground">
							{inviteCode
								? "Create your account to join the invited workspace."
								: "Get started with a focused place for work conversations."}
						</p>
					) : null}
				</div>

				<div className="grid gap-2.5">
					<Button
						disabled={isGooglePending || isPending}
						onClick={handleGoogleSignIn}
						type="button"
						variant="outline"
					>
						<GoogleIcon />
						{isGooglePending ? "Opening Google..." : "Continue with Google"}
					</Button>
				</div>

				<div className="my-7 flex items-center gap-3">
					<div className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent to-border" />
					<span className="text-xs font-medium text-muted-foreground">or</span>
					<div className="h-px flex-1 rounded-full bg-gradient-to-l from-transparent to-border" />
				</div>

				<form className="grid gap-4" onSubmit={handleSubmit}>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							autoComplete="email"
							id="email"
							name="email"
							onChange={() => {
								if (isSignup) {
									setShowSignupPassword(false);
								}
							}}
							required
							type="email"
						/>
					</div>

					{shouldShowPassword ? (
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								autoComplete={isSignup ? "new-password" : "current-password"}
								id="password"
								minLength={8}
								name="password"
								required
								type="password"
							/>
						</div>
					) : null}

					{error ? (
						<p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					) : null}

					<Button disabled={isPending}>
						{isPending ? "Working..." : "Continue"}
					</Button>
				</form>

				<div className="mt-6 grid gap-1 text-xs leading-6 text-muted-foreground">
					{isSignup ? (
						<p>
							By signing up, you agree to our{" "}
							<a className="font-medium text-foreground underline" href="/">
								Terms & Privacy
							</a>
							.
						</p>
					) : null}
					<p>
						{isSignup
							? "Already have an account?"
							: "Don't have an account yet?"}{" "}
						<Link
							className="font-medium text-foreground underline"
							to={isSignup ? "/login" : "/signup"}
						>
							{isSignup ? "Log in" : "Sign up"}
						</Link>
					</p>
					{isSignup ? null : (
						<p>
							Forgot password?{" "}
							<a
								className="font-medium text-foreground underline"
								href="/login"
							>
								Reset
							</a>
						</p>
					)}
				</div>
			</section>
		</main>
	);
}
