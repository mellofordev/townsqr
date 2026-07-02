import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

import { authSessionQueryOptions } from "#/lib/auth-session.ts";
import { onboardingStatusQueryOptions } from "#/lib/onboarding.ts";
import {
	workspaceSettingsQueryOptions,
	workspaceSummaryQueryOptions,
} from "#/lib/workspace.ts";

type PrivateRouteContext = {
	queryClient: QueryClient;
};

export async function requireWorkspaceRoute({
	context,
}: {
	context: PrivateRouteContext;
}) {
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
}

export async function requireWorkspaceSettingsRoute({
	context,
}: {
	context: PrivateRouteContext;
}) {
	await requireWorkspaceRoute({ context });

	const settings = await context.queryClient.ensureQueryData(
		workspaceSettingsQueryOptions(),
	);

	if (!settings) {
		throw redirect({ to: "/onboarding" });
	}
}
