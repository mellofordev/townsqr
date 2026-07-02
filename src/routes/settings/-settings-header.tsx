import type { ReactNode } from "react";

export function SettingsHeader({
	children,
	description,
	title,
}: {
	children?: ReactNode;
	description: string;
	title: string;
}) {
	return (
		<header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="min-w-0">
				<h1 className="text-2xl font-semibold tracking-normal text-foreground">
					{title}
				</h1>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
			{children}
		</header>
	);
}
