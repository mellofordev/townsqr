import { Check, Hash, Loader2, Megaphone, UsersRound } from "lucide-react";
import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

import { Card, CardContent, CardHeader } from "#/components/ui/card.tsx";

type MotionDivProps = Pick<
	HTMLMotionProps<"div">,
	"animate" | "initial" | "transition"
>;

interface FinalSetupPreviewProps {
	channelNames: string[];
	organizationName: string;
}

const PREVIEW_EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

function getCardTransform(rotate: number, y = 0, scale = 1) {
	return `translate3d(0, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
}

function formatChannelName(channelName: string) {
	return channelName.trim().toLowerCase().replace(/\s+/g, "-");
}

function getChannelKey(channelName: string) {
	return formatChannelName(channelName) || channelName;
}

export function FinalSetupPreview({
	channelNames,
	organizationName,
}: FinalSetupPreviewProps) {
	const shouldReduceMotion = useReducedMotion();
	const previewChannels = channelNames.length
		? channelNames.slice(0, 4)
		: ["general", "announcements"];
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
				Opening your workplace.
			</h2>

			<div className="relative mt-12 h-[460px]">
				<motion.div
					className="absolute top-2 left-8 w-[24rem]"
					{...cardMotion(-1, 0.04)}
				>
					<Card
						className="gap-0 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.09)]"
						size="sm"
					>
						<CardHeader className="flex flex-row items-center gap-3 p-5">
							<div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
								<Loader2 aria-hidden="true" className="size-5 animate-spin" />
							</div>
							<div className="min-w-0">
								<p className="text-sm tracking-tight text-muted-foreground/70">
									Workspace
								</p>
								<p className="mt-2 truncate text-xl font-semibold">
									{organizationName.trim() || "Your workplace"}
								</p>
							</div>
						</CardHeader>
					</Card>
				</motion.div>

				<motion.div
					className="absolute top-28 right-0 w-80"
					{...cardMotion(2, 0.12)}
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
						<CardContent className="grid gap-2 p-5">
							{previewChannels.map((channelName) => (
								<div
									className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm font-medium"
									key={getChannelKey(channelName)}
								>
									<span className="flex min-w-0 items-center gap-2">
										<Hash
											aria-hidden="true"
											className="size-4 shrink-0 text-muted-foreground"
										/>
										<span className="truncate">
											{formatChannelName(channelName)}
										</span>
									</span>
									<Check
										aria-hidden="true"
										className="size-4 shrink-0 text-emerald-600"
									/>
								</div>
							))}
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					className="absolute bottom-28 left-16 w-72"
					{...cardMotion(1, 0.2)}
				>
					<Card
						className="gap-0 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.09)]"
						size="sm"
					>
						<CardHeader className="flex flex-row items-center gap-3 p-5">
							<div className="flex size-9 items-center justify-center rounded-md bg-blue-500/10 text-blue-700">
								<Megaphone aria-hidden="true" className="size-4" />
							</div>
							<div>
								<p className="text-sm tracking-tight text-muted-foreground/70">
									Feed
								</p>
								<p className="mt-2 font-medium">Welcome post ready</p>
							</div>
						</CardHeader>
					</Card>
				</motion.div>

				<motion.div
					className="absolute right-16 bottom-10 w-64"
					{...cardMotion(-2, 0.28)}
				>
					<Card
						className="gap-0 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.09)]"
						size="sm"
					>
						<CardHeader className="flex flex-row items-center gap-3 p-5">
							<div className="flex size-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700">
								<UsersRound aria-hidden="true" className="size-4" />
							</div>
							<div>
								<p className="text-sm tracking-tight text-muted-foreground/70">
									Members
								</p>
								<p className="mt-2 font-medium">Invites queued</p>
							</div>
						</CardHeader>
					</Card>
				</motion.div>
			</div>
		</>
	);
}
