import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { getDb } from "#/db/index.ts";
import * as schema from "#/db/schema.ts";

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
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	plugins: [tanstackStartCookies()],
});
