export type AppErrorCode =
	| "AUTH_REQUIRED"
	| "CHANNEL_ALREADY_EXISTS"
	| "CHANNEL_INVALID"
	| "CHANNEL_NOT_FOUND"
	| "INVITE_INVALID"
	| "INVITE_INVALID_EMAIL"
	| "INVITE_NOT_FOUND"
	| "MEMBER_INVALID"
	| "MEMBER_NOT_FOUND"
	| "ONBOARDING_INVALID"
	| "WORKSPACE_FORBIDDEN"
	| "WORKSPACE_NOT_FOUND";

export class AppError extends Error {
	code: AppErrorCode;
	details?: unknown;
	status: number;

	constructor(
		code: AppErrorCode,
		status: number,
		message: string,
		details?: unknown,
	) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.status = status;
		this.details = details;
	}
}

export function appError(
	code: AppErrorCode,
	status: number,
	message: string,
	details?: unknown,
) {
	return new AppError(code, status, message, details);
}
