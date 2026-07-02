import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "#/components/ui/sidebar.tsx";
import { cn } from "#/lib/utils.ts";
import type { SidesheetNavItem, SidesheetSection } from "#/types/index.ts";

export type {
	SidesheetChannel,
	SidesheetNavItem,
	SidesheetSection,
} from "#/types/index.ts";

type SidesheetProps = {
	activeItem?: string;
	className?: string;
	footer?: React.ReactNode;
	searchLabel?: string;
	searchPlaceholder?: string;
	sections: SidesheetSection[];
	workspaceName?: string;
};

export function Sidesheet({
	activeItem,
	className,
	footer,
	searchLabel = "Search workspace",
	searchPlaceholder = "Search workspace",
	sections,
	workspaceName = "TownSqr HQ",
}: SidesheetProps) {
	return (
		<SidebarProvider
			className="h-svh min-h-0 w-auto flex-none overflow-hidden"
			style={
				{
					"--sidebar-width": "18.5rem",
					"--sidebar-width-icon": "18.5rem",
				} as React.CSSProperties
			}
		>
			<Sidebar
				aria-label={`${workspaceName} navigation`}
				className={cn(
					"h-svh min-h-0 border-r border-sidebar-border bg-white",
					className,
				)}
				collapsible="none"
			>
				<SidebarHeader className="mt-0.5 gap-3 p-3">
					<div className="relative">
						<MagnifyingGlassIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
						<SidebarInput
							aria-label={searchLabel}
							className="pl-9"
							placeholder={searchPlaceholder}
							type="search"
						/>
					</div>
				</SidebarHeader>

				<SidebarContent className="overflow-hidden">
					{sections.map((section) => (
						<SidebarGroup
							className={cn(
								section.scrollable ? "min-h-0 flex-1 pb-0" : "shrink-0",
							)}
							key={section.id}
						>
							<SidebarGroupLabel>{section.label}</SidebarGroupLabel>
							{section.action ? (
								<SidebarGroupAction
									aria-label={section.action.label}
									onClick={section.action.onClick}
									type="button"
								>
									<section.action.icon />
								</SidebarGroupAction>
							) : null}
							<SidebarGroupContent
								className={cn(section.scrollable && "relative min-h-0 flex-1")}
							>
								<div
									className={cn(
										"pt-1",
										section.scrollable &&
											"no-scrollbar h-full overflow-y-auto overscroll-contain pb-5",
									)}
								>
									<SidebarMenu>
										{section.items.map((item) => (
											<SidesheetMenuItem
												activeItem={activeItem}
												item={item}
												key={item.id}
											/>
										))}
									</SidebarMenu>
								</div>
							</SidebarGroupContent>
						</SidebarGroup>
					))}
				</SidebarContent>

				{footer ? (
					<SidebarFooter className="p-3">{footer}</SidebarFooter>
				) : null}
			</Sidebar>
		</SidebarProvider>
	);
}

function SidesheetMenuItem({
	activeItem,
	item,
}: {
	activeItem?: string;
	item: SidesheetNavItem;
}) {
	const Icon = item.icon;
	const isActive = item.id === activeItem;

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild className="gap-3" isActive={isActive}>
				<Link
					aria-current={isActive ? "page" : undefined}
					params={item.params}
					to={item.to}
				>
					{Icon ? (
						<Icon
							className={cn(
								"text-muted-foreground",
								isActive && "text-foreground",
							)}
						/>
					) : null}
					{item.initials ? (
						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.625rem] font-semibold text-secondary-foreground">
							{item.initials}
						</span>
					) : null}
					<span
						className={cn(
							"text-sm font-normal text-muted-foreground",
							isActive && "text-foreground",
						)}
					>
						{item.label}
					</span>
				</Link>
			</SidebarMenuButton>
			{item.badge ? (
				<SidebarMenuBadge>{formatBadge(item.badge)}</SidebarMenuBadge>
			) : null}
		</SidebarMenuItem>
	);
}

function formatBadge(value: string | number) {
	if (typeof value === "number" && value > 99) {
		return "99+";
	}

	return value;
}
