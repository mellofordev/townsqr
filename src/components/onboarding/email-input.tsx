import { X } from "lucide-react";
import type * as React from "react";

import { Label } from "#/components/ui/label.tsx";
import { cn } from "#/lib/utils.ts";

const EMAIL_SPLIT_PATTERN = /[\s,;]+/;

export interface InviteEmailInputProps {
	emails: string[];
	onAddEmails: (value: string) => boolean;
	onChangeInput: (value: string) => void;
	onRemoveEmail: (email: string) => void;
	value: string;
}

export function InviteEmailInput({
	emails,
	onAddEmails,
	onChangeInput,
	onRemoveEmail,
	value,
}: InviteEmailInputProps) {
	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
			if (value.trim()) {
				event.preventDefault();
				onAddEmails(value);
			}
		}
	}

	function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
		const pastedText = event.clipboardData.getData("text");

		if (EMAIL_SPLIT_PATTERN.test(pastedText.trim())) {
			event.preventDefault();
			onAddEmails(pastedText);
		}
	}

	return (
		<div className="grid gap-2">
			<Label htmlFor="invite-emails">Invite by email</Label>
			<div
				className={cn(
					"min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
					"aria-invalid:border-destructive aria-invalid:ring-destructive/20",
				)}
			>
				<div className="flex flex-wrap gap-2">
					{emails.map((email) => (
						<span
							className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 text-xs font-medium text-foreground"
							key={email}
						>
							<span className="truncate">{email}</span>
							<button
								aria-label={`Remove ${email}`}
								className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								onClick={() => onRemoveEmail(email)}
								type="button"
							>
								<X aria-hidden="true" className="size-3" />
							</button>
						</span>
					))}
					<textarea
						autoComplete="email"
						className="min-h-16 min-w-48 flex-1 resize-none bg-transparent py-1 text-sm leading-6 outline-none placeholder:text-muted-foreground"
						id="invite-emails"
						name="inviteEmails"
						onBlur={() => {
							if (value.trim()) {
								onAddEmails(value);
							}
						}}
						onChange={(event) => onChangeInput(event.target.value)}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						placeholder={
							emails.length
								? "Add another email"
								: "Enter emails, separated by comma or return"
						}
						rows={2}
						value={value}
					/>
				</div>
			</div>
			<p className="text-xs leading-5 text-muted-foreground">
				Press Enter, comma, or paste a list to add multiple people.
			</p>
		</div>
	);
}
