import { neon } from "@neondatabase/serverless";

import { getEnvValue } from "#/server/env.ts";

let client: ReturnType<typeof neon>;

export async function getClient() {
	const databaseUrl = getEnvValue("DATABASE_URL");

	if (!databaseUrl) {
		return undefined;
	}
	if (!client) {
		client = await neon(databaseUrl);
	}
	return client;
}
