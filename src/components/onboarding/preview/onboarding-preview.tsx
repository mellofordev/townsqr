import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Step1Preview } from "./step1.tsx";
import { Step2Preview } from "./step2.tsx";

interface OnboardingPreviewProps {
	step: number;
}

const ONBOARDING_EASE_OUT: [number, number, number, number] = [
	0.23, 1, 0.32, 1,
];

export function OnboardingPreview({ step }: OnboardingPreviewProps) {
	const shouldReduceMotion = useReducedMotion();
	const stepMotion = {
		animate: {
			opacity: 1,
		},
		exit: {
			opacity: 0,
		},
		initial: {
			opacity: 0,
		},
	};

	return (
		<section className="hidden h-svh overflow-hidden bg-muted/35 px-12 py-10 lg:block">
			<AnimatePresence initial={false} mode="wait">
				<motion.div
					animate="animate"
					className="mx-auto flex h-full max-w-2xl flex-col justify-center"
					exit="exit"
					initial="initial"
					key={step}
					transition={{
						duration: shouldReduceMotion ? 0.16 : 0.24,
						ease: ONBOARDING_EASE_OUT,
					}}
					variants={stepMotion}
				>
					{step === 1 ? <Step1Preview /> : <Step2Preview />}
				</motion.div>
			</AnimatePresence>
		</section>
	);
}
