import {
	queryOptions,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import type { authClient } from "#/lib/auth-client.ts";
import { createRequestContext } from "#/server/context.ts";

export type AuthSession = (typeof authClient.$Infer)["Session"] | null;

export const authSessionQueryKey = ["auth", "session"] as const;

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const ctx = await createRequestContext();

		return ctx.session as AuthSession;
	},
);

export function authSessionQueryOptions() {
	return queryOptions({
		queryKey: authSessionQueryKey,
		queryFn: () => getCurrentSession(),
		retry: false,
		staleTime: 30 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: true,
	});
}

export function useAuthSession() {
	return useSuspenseQuery(authSessionQueryOptions());
}

export function useAuthSessionCache() {
	const queryClient = useQueryClient();

	return {
		setSession(session: AuthSession) {
			queryClient.setQueryData(authSessionQueryKey, session);
		},
		invalidateSession() {
			return queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
		},
	};
}
