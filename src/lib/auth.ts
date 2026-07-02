import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getDb } from "#/db/index.ts";
import * as schema from "#/db/schema.ts";
import { getEnvValue } from "#/server/env.ts";

export const auth = betterAuth({
	appName: "TownSqr",
	basePath: "/api/auth",
	database: drizzleAdapter(getDb(), {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
			requireLocalEmailVerified: false,
		},
	},
	socialProviders: {
		google: {
			clientId: getEnvValue("GOOGLE_CLIENT_ID") ?? "",
			clientSecret: getEnvValue("GOOGLE_CLIENT_SECRET") ?? "",
		},
	},
	secret: getEnvValue("BETTER_AUTH_SECRET"),
	plugins: [tanstackStartCookies()],
});
