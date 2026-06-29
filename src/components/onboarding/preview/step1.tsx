import { Hash, Megaphone } from "lucide-react";
import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

import { Card, CardContent, CardHeader } from "#/components/ui/card.tsx";

type MotionDivProps = Pick<
	HTMLMotionProps<"div">,
	"animate" | "initial" | "transition"
>;

const PREVIEW_EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

function getCardTransform(rotate: number, y = 0, scale = 1) {
	return `translate3d(0, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
}

export function Step1Preview() {
	const shouldReduceMotion = useReducedMotion();
	const cardMotion = (rotate: number, delay: number): MotionDivProps =>
		shouldReduceMotion
			? {
					animate: { transform: getCardTransform(rotate) },
					initial: false,
				}
			: {
					animate: { opacity: 1, transform: getCardTransform(rotate) },
					initial: {
						opacity: 0,
						transform: getCardTransform(rotate, 18, 0.96),
					},
					transition: { delay, duration: 0.42, ease: PREVIEW_EASE_OUT },
				};

	return (
		<>
			<h2 className="max-w-xl text-5xl leading-[1.05] font-semibold tracking-normal">
				Your company square, ready to form.
			</h2>

			<div className="relative mt-12 h-[460px]">
				<motion.div
					className="absolute top-0 left-8 w-[22rem]"
					{...cardMotion(-1.5, 0.04)}
				>
					<Card
						className="gap-0 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.09)]"
						size="sm"
					>
						<CardHeader className="flex flex-row items-start gap-3 p-5">
							<div className="min-w-0">
								<p className="text-sm tracking-tight text-muted-foreground/70">
									Workspace
								</p>
								<p className="mt-2 truncate text-xl font-semibold">
									Northstar Labs
								</p>
								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									A shared home for announcements, teams, knowledge, and
									everyday conversation.
								</p>
							</div>
						</CardHeader>
					</Card>
				</motion.div>

				<motion.div
					className="absolute top-12 right-0 w-[17rem]"
					{...cardMotion(2, 0.12)}
				>
					<Card
						className="gap-0 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.09)]"
						size="sm"
					>
						<CardHeader className="flex flex-row items-center gap-3 p-5">
							<div className="flex size-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700">
								<Megaphone className="size-4" aria-hidden="true" />
							</div>
							<div>
								<p className="text-sm tracking-tight text-muted-foreground/70">
									Announcement
								</p>
								<p className="mt-2 font-medium">Monday company update</p>
							</div>
						</CardHeader>
					</Card>
				</motion.div>

				<motion.div
					className="absolute top-48 left-24 w-64"
					{...cardMotion(1, 0.2)}
				>
					<Card
						className="gap-0 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.09)]"
						size="sm"
					>
						<CardHeader className="p-5 pb-0">
							<p className="text-sm tracking-tight text-muted-foreground/70">
								Channels
							</p>
						</CardHeader>
						<CardContent className="mt-4 grid gap-2 p-5 pt-0">
							<div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm font-medium">
								<Hash
									className="size-4 text-muted-foreground"
									aria-hidden="true"
								/>
								general
							</div>
							<div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm font-medium">
								<Hash
									className="size-4 text-muted-foreground"
									aria-hidden="true"
								/>
								engineering
							</div>
							<div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm font-medium">
								<Hash
									className="size-4 text-muted-foreground"
									aria-hidden="true"
								/>
								people-team
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					className="absolute right-16 bottom-8 w-80"
					{...cardMotion(-1, 0.28)}
				>
					<Card
						className="gap-0 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.09)]"
						size="sm"
					>
						<CardHeader className="p-5 pb-0">
							<p className="text-sm tracking-tight text-muted-foreground/70">
								First Post
							</p>
						</CardHeader>
						<CardContent className="p-5 pt-3">
							<p className="text-base leading-6 font-medium">
								Welcome to Northstar Labs. Start here for company news and team
								updates.
							</p>
							<div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
								<span className="rounded-full bg-muted px-3 py-1">
									12 reactions
								</span>
								<span className="rounded-full bg-muted px-3 py-1">
									4 comments
								</span>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</>
	);
}
