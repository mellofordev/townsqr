import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

type MotionDivProps = Pick<
	HTMLMotionProps<"div">,
	"animate" | "initial" | "transition"
>;

const PREVIEW_EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

function getPanelTransform(rotate: number, y = 0, scale = 1) {
	return `translate3d(0, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
}

export function Step2Preview() {
	const shouldReduceMotion = useReducedMotion();
	const panelMotion = (
		rotate: number,
		delay: number,
		duration = 0.42,
	): MotionDivProps =>
		shouldReduceMotion
			? {
					animate: { transform: getPanelTransform(rotate) },
					initial: false,
				}
			: {
					animate: { opacity: 1, transform: getPanelTransform(rotate) },
					initial: {
						opacity: 0,
						transform: getPanelTransform(rotate, 18, 0.96),
					},
					transition: { delay, duration, ease: PREVIEW_EASE_OUT },
				};

	return (
		<>
			<h2 className="max-w-xl text-5xl leading-[1.05] font-semibold tracking-normal">
				Bring the first people in.
			</h2>

			<div className="relative mt-12 h-[460px]">
				<motion.div
					className="absolute top-8 left-14 size-40 rounded-full bg-sky-100/70 shadow-[0_22px_55px_rgba(15,23,42,0.1)] ring-1 ring-foreground/5"
					{...panelMotion(-7, 0.04, 0.44)}
				>
					<img
						alt="Invited teammate avatar"
						className="h-full w-full object-contain"
						decoding="async"
						src="/faces/face1.png"
					/>
				</motion.div>

				<motion.div
					className="absolute top-24 right-28 size-40 rounded-full bg-emerald-100/70 shadow-[0_22px_55px_rgba(15,23,42,0.1)] ring-1 ring-foreground/5"
					{...panelMotion(6, 0.1, 0.44)}
				>
					<img
						alt="Invited teammate avatar"
						className="h-full w-full object-contain"
						decoding="async"
						src="/faces/face2.png"
					/>
				</motion.div>

				<motion.div
					className="absolute bottom-12 left-48 size-40 bg-amber-50 rounded-full shadow-[0_22px_55px_rgba(15,23,42,0.1)] ring-1 ring-foreground/5"
					{...panelMotion(2, 0.16, 0.44)}
				>
					<img
						alt="Invited teammate avatar"
						className="h-full w-full object-contain"
						decoding="async"
						src="/faces/face3.png"
					/>
				</motion.div>

				<motion.div
					className="absolute top-8 right-4 w-64 rounded-2xl bg-background/95 px-5 py-4 shadow-[0_18px_55px_rgba(15,23,42,0.12)] ring-1 ring-foreground/5 backdrop-blur"
					{...panelMotion(2, 0.22)}
				>
					<p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground/70 uppercase">
						Invite Code
					</p>
					<p className="mt-3 font-mono text-2xl font-semibold tracking-[0.18em]">
						TOWN2026
					</p>
				</motion.div>
			</div>
		</>
	);
}
