import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card.tsx";
import { authSessionQueryOptions, useAuthSession } from "#/lib/auth-session.ts";
import { onboardingStatusQueryOptions } from "#/lib/onboarding.ts";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      authSessionQueryOptions(),
    );

    if (!session) {
      throw redirect({ to: "/login" });
    }

    const onboarding = await context.queryClient.ensureQueryData(
      onboardingStatusQueryOptions(),
    );

    if (!onboarding.organization) {
      throw redirect({ to: "/onboarding" });
    }
  },
  component: FeedPage,
  head: () => ({
    meta: [{ title: "Feed | TownSqr" }],
  }),
});

function FeedPage() {
  const { data: session } = useAuthSession();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
      <h1>feed</h1>
    </div>
  );
}
