import { env } from "cloudflare:workers";

export interface AppEnv extends Record<string, unknown> {
	BETTER_AUTH_SECRET?: string;
	DATABASE_URL?: string;
	EMAIL_FROM?: string;
	EMAIL_REPLY_TO?: string;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	MEDIA_BUCKET?: unknown;
	CHAT_ROOM?: unknown;
	RESEND_API_KEY?: string;
	TOWNSQR_EMAIL_ENABLED?: string;
	TOWNSQR_EMAIL_FROM?: string;
	TOWNSQR_EMAIL_REPLY_TO?: string;
}

export function getEnv(): AppEnv {
	return env as AppEnv;
}

export function getEnvValue(name: keyof AppEnv) {
	const workerValue = getEnv()[name];

	if (typeof workerValue === "string" && workerValue.trim()) {
		return workerValue.trim();
	}

	const processValue = process.env[name];

	return typeof processValue === "string" && processValue.trim()
		? processValue.trim()
		: undefined;
}

export function getRequiredEnvValue(name: keyof AppEnv) {
	const value = getEnvValue(name);

	if (!value) {
		throw new Error(`${name} is not set`);
	}

	return value;
}
