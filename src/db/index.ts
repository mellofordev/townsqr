import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema.ts";

function createDatabase(databaseUrl: string) {
	return drizzle(neon(databaseUrl), { schema });
}

let database: ReturnType<typeof createDatabase> | undefined;

function assertNeonDatabaseUrl(databaseUrl: string) {
	const { hostname } = new URL(databaseUrl);

	if (hostname === "localhost" || hostname === "127.0.0.1") {
		throw new Error(
			"DATABASE_URL points to localhost, but this app is configured to use the Neon HTTP driver. Set DATABASE_URL to your Neon Postgres connection string, or switch the Drizzle driver for local Postgres.",
		);
	}
}

export function getDb() {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is not set");
	}

	assertNeonDatabaseUrl(databaseUrl);

	database ??= createDatabase(databaseUrl);

	return database;
}
