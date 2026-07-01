import type { HeroIcon } from "./ui.ts";

export type ActivitySummaryItem = {
	id: string;
	label: string;
	count: string | number;
	icon: HeroIcon;
};

export type TrendingActivityReaction = "celebrate" | "like" | "love";

export type TrendingActivityItem = {
	id: string;
	label: string;
	count: string;
	reactions: TrendingActivityReaction[];
};
