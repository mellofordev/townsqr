import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { ActivityPanel } from "#/components/activities/activitypanel.tsx";
import { Appbar } from "#/components/navigation/appbar.tsx";
import { Sidesheet } from "#/components/navigation/sidesheet.tsx";
import { buildSidesheetContent } from "#/components/navigation/sidesheet-config.ts";
import { useAuthSession } from "#/lib/auth-session.ts";
import { useWorkspaceSummary } from "#/lib/workspace.ts";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Townsqr",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootLayout,
	shellComponent: RootDocument,
});

const publicRoutePrefixes = [
	"/api",
	"/join",
	"/login",
	"/onboarding",
	"/signup",
];

function RootLayout() {
	const location = useRouterState({
		select: (state) => state.location,
	});
	const pathname = location.pathname;
	const isPublicRoute = publicRoutePrefixes.some((prefix) =>
		pathname.startsWith(prefix),
	);

	if (isPublicRoute) {
		return <Outlet />;
	}

	return <AppShell pathname={pathname} />;
}

function AppShell({ pathname }: { pathname: string }) {
	const { data: session } = useAuthSession();
	const { data: workspaceSummary } = useWorkspaceSummary();
	const channels =
		workspaceSummary?.channels.map((channel) => ({
			id: channel.slug,
			name: channel.name,
		})) ?? [];
	const sidesheet = buildSidesheetContent({
		channels,
		members: workspaceSummary?.members ?? [],
		pathname,
	});
	const showActivityPanel = pathname === "/";

	return (
		<div className="flex h-svh min-h-0 w-full max-w-full overflow-hidden bg-background text-foreground">
			<Appbar
				activeItem={getActiveAppbarItem(pathname)}
				settingsActive={pathname.startsWith("/settings")}
				user={{
					name: session?.user.name ?? "TownSqr Member",
					imageUrl: session?.user.image ?? undefined,
					status: session ? "online" : "offline",
				}}
			/>
			<Sidesheet
				activeItem={sidesheet.activeItem}
				footer={
					<div className="rounded-2xl border border-sidebar-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
						<span className="font-medium text-foreground">
							{sidesheet.footerValue}
						</span>{" "}
						{sidesheet.footerLabel}
					</div>
				}
				searchLabel={sidesheet.searchLabel}
				searchPlaceholder={sidesheet.searchPlaceholder}
				sections={sidesheet.sections}
				workspaceName={workspaceSummary?.organization.name}
			/>
			<main className="h-svh min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
				<Outlet />
			</main>
			{showActivityPanel ? <ActivityPanel className="hidden xl:flex" /> : null}
		</div>
	);
}

function getActiveAppbarItem(pathname: string) {
	if (pathname.startsWith("/notifications")) {
		return "notifications";
	}

	if (pathname.startsWith("/chat")) {
		return "chat";
	}

	return "home";
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
