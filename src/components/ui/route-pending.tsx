export function RoutePending() {
	return (
		<div className="flex h-svh w-full items-center justify-center bg-background text-foreground">
			<output
				aria-label="Loading"
				className="size-5 animate-spin rounded-full border border-muted-foreground/25 border-t-foreground"
			/>
		</div>
	);
}
