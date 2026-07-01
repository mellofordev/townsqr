import { Hash, X } from "lucide-react";
import type * as React from "react";

import { Label } from "#/components/ui/label.tsx";
import { cn } from "#/lib/utils.ts";

const CHANNEL_SPLIT_PATTERN = /[\n,;]+/;

export interface ChannelNameInputProps {
	channelNames: string[];
	onAddChannelNames: (value: string) => boolean;
	onChangeInput: (value: string) => void;
	onRemoveChannelName: (channelName: string) => void;
	value: string;
}

export function ChannelNameInput({
	channelNames,
	onAddChannelNames,
	onChangeInput,
	onRemoveChannelName,
	value,
}: ChannelNameInputProps) {
	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
			if (value.trim()) {
				event.preventDefault();
				onAddChannelNames(value);
			}
		}
	}

	function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
		const pastedText = event.clipboardData.getData("text");

		if (CHANNEL_SPLIT_PATTERN.test(pastedText.trim())) {
			event.preventDefault();
			onAddChannelNames(pastedText);
		}
	}

	return (
		<div className="grid gap-2">
			<Label htmlFor="channel-names">Channels</Label>
			<div
				className={cn(
					"min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
					"aria-invalid:border-destructive aria-invalid:ring-destructive/20",
				)}
			>
				<div className="flex flex-wrap gap-2">
					{channelNames.map((channelName) => (
						<span
							className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 text-xs font-medium text-foreground"
							key={channelName}
						>
							<Hash
								aria-hidden="true"
								className="size-3 shrink-0 text-muted-foreground"
							/>
							<span className="truncate">{channelName}</span>
							<button
								aria-label={`Remove ${channelName}`}
								className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								onClick={() => onRemoveChannelName(channelName)}
								type="button"
							>
								<X aria-hidden="true" className="size-3" />
							</button>
						</span>
					))}
					<textarea
						autoComplete="off"
						className="min-h-16 min-w-48 flex-1 resize-none bg-transparent py-1 text-sm leading-6 outline-none placeholder:text-muted-foreground"
						id="channel-names"
						name="channelNames"
						onBlur={() => {
							if (value.trim()) {
								onAddChannelNames(value);
							}
						}}
						onChange={(event) => onChangeInput(event.target.value)}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						placeholder={
							channelNames.length
								? "Add another channel"
								: "Enter channel names, separated by comma or return"
						}
						rows={2}
						value={value}
					/>
				</div>
			</div>
			<p className="text-xs leading-5 text-muted-foreground">
				Add practical starting points like general, announcements, or team
				channels.
			</p>
		</div>
	);
}
