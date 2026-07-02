import {
	BellIcon,
	BuildingOffice2Icon,
	ChatBubbleLeftRightIcon,
	Cog6ToothIcon,
	HomeIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarProvider,
} from "#/components/ui/sidebar.tsx";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/ui/tooltip.tsx";
import { cn } from "#/lib/utils.ts";
import type { AppbarNavItem, AppbarUser } from "#/types/index.ts";

export type { AppbarNavItem, AppbarUser } from "#/types/index.ts";

const defaultAppbarItems: AppbarNavItem[] = [
	{
		id: "home",
		label: "Home",
		to: "/",
		icon: HomeIcon,
	},
	{
		id: "notifications",
		label: "Notifications",
		to: "/notifications",
		icon: BellIcon,
	},
	{
		id: "chat",
		label: "Chat",
		to: "/chat",
		icon: ChatBubbleLeftRightIcon,
	},
];

type AppbarProps = {
	activeItem?: string;
	className?: string;
	items?: AppbarNavItem[];
	settingsActive?: boolean;
	user?: AppbarUser;
};

export function Appbar({
	activeItem = "home",
	className,
	items = defaultAppbarItems,
	settingsActive = false,
	user = { name: "TownSqr Member", status: "online" },
}: AppbarProps) {
	const userInitials = getInitials(user.name);

	return (
		<TooltipProvider>
			<SidebarProvider
				className="h-svh min-h-0 w-auto flex-none overflow-hidden"
				style={
					{
						"--sidebar-width": "4.75rem",
						"--sidebar-width-icon": "4.75rem",
					} as React.CSSProperties
				}
			>
				<Sidebar
					className={cn(
						"h-svh min-h-0 border-r border-sidebar-border bg-white",
						className,
					)}
					collapsible="none"
				>
					<SidebarHeader className="items-center px-2 py-3">
						<Button aria-label="TownSqr" asChild size="icon" variant="ghost">
							<Link to="/">
								<BuildingOffice2Icon className="size-5" />
							</Link>
						</Button>
					</SidebarHeader>

					<SidebarContent className="items-center px-2">
						<SidebarGroup className="p-0">
							<SidebarGroupContent>
								<SidebarMenu className="items-center gap-3">
									{items.map((item) => {
										const Icon = item.icon;
										const isActive = !settingsActive && item.id === activeItem;

										return (
											<SidebarMenuItem key={item.id}>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															aria-current={isActive ? "page" : undefined}
															aria-label={item.label}
															asChild
															size="icon"
															variant="ghost"
														>
															<Link to={item.to}>
																<Icon
																	className={cn(
																		"size-5 text-muted-foreground",
																		isActive && "text-foreground",
																	)}
																/>
															</Link>
														</Button>
													</TooltipTrigger>
													<TooltipContent side="right">
														{item.label}
														{item.badgeLabel ? (
															<span className="text-background/70">
																{item.badgeLabel}
															</span>
														) : null}
													</TooltipContent>
												</Tooltip>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					<SidebarFooter className="items-center gap-2 px-2 py-3">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									aria-current={settingsActive ? "page" : undefined}
									aria-label="Organization settings"
									asChild
									size="icon"
									variant="ghost"
								>
									<Link to="/settings/organization">
										<Cog6ToothIcon
											className={cn(
												"size-5 text-muted-foreground",
												settingsActive && "text-foreground",
											)}
										/>
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">
								Organization settings
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button aria-label={user.name} size="icon" variant="ghost">
									{user.imageUrl ? (
										<img
											alt=""
											className="size-6 rounded-full object-cover"
											src={user.imageUrl}
										/>
									) : (
										<span className="flex size-4 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
											{userInitials}
										</span>
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">{user.name}</TooltipContent>
						</Tooltip>
					</SidebarFooter>
				</Sidebar>
			</SidebarProvider>
		</TooltipProvider>
	);
}

function getInitials(name: string) {
	const [first = "T", second] = name.trim().split(/\s+/);

	return `${first[0] ?? "T"}${second?.[0] ?? ""}`.toUpperCase();
}
