import { createFileRoute, redirect } from "@tanstack/react-router";

import { authSessionQueryOptions } from "#/lib/auth-session.ts";
import { onboardingStatusQueryOptions } from "#/lib/onboarding.ts";
import { workspaceSummaryQueryOptions } from "#/lib/workspace.ts";

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

    await context.queryClient.ensureQueryData(workspaceSummaryQueryOptions());
  },
  component: FeedPage,
  head: () => ({
    meta: [{ title: "Feed | TownSqr" }],
  }),
});

function FeedPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 px-6 py-6">
      feed
    </div>
  );
}
