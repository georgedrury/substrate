"use client"

import { useRef } from "react"
import type { TransitionConfig } from "dialkit/store"
import { Controls } from "@/registry/substrate/components/controls"
import { useControls } from "@/registry/substrate/hooks/use-controls"
import {
	springParams,
	springProgress,
	springSettleDuration,
} from "@/registry/substrate/lib/spring"

// Inline gradients so the demo needs no network
const swatch = (from: string, to: string) =>
	`data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="4" height="4" fill="url(#g)"/></svg>`,
	)}`

export default function ControlsDemo() {
	const cardRef = useRef<HTMLDivElement>(null)

	const card = useControls(
		"Card",
		{
			title: "Substrate",
			radius: [16, 0, 48],
			colour: "#a78bfa",
			image: {
				type: "image",
				options: [
					{ value: swatch("#f97316", "#facc15"), label: "Sunrise" },
					{ value: swatch("#0ea5e9", "#a78bfa"), label: "Dusk" },
				],
				default: "",
			},
			visible: true,
			align: { type: "select", options: ["left", "center", "right"], default: "center" },
			shadow: {
				offset: { type: "pad", x: [0, -24, 24, 1], y: [-8, -24, 24, 1] },
				blur: [24, 0, 64],
				opacity: [0.35, 0, 1],
			},
			entrance: { type: "spring", visualDuration: 0.4, bounce: 0.3 },
			replay: { type: "action" },
		},
		{
			onAction: (path) => {
				if (path !== "replay" || !cardRef.current) return
				cardRef.current.animate(
					[{ transform: "scale(0.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
					timing(card.entrance),
				)
			},
		},
	)

	return (
		<div className="flex w-full items-stretch gap-4">
			<div className="flex flex-1 items-center justify-center rounded-lg bg-canvas p-6">
				{card.visible && (
					<div
						ref={cardRef}
						className="flex h-28 w-44 items-center bg-cover bg-center px-4 text-sm font-medium text-black"
						style={{
							borderRadius: card.radius,
							backgroundColor: card.colour,
							backgroundImage: card.image ? `url("${card.image}")` : undefined,
							justifyContent:
								card.align === "left"
									? "flex-start"
									: card.align === "right"
										? "flex-end"
										: "center",
							boxShadow: `${card.shadow.offset.x}px ${-card.shadow.offset.y}px ${card.shadow.blur}px rgb(0 0 0 / ${card.shadow.opacity})`,
						}}
					>
						{card.title}
					</div>
				)}
			</div>
			<div className="w-70 rounded-lg border bg-panel py-2">
				<Controls />
			</div>
		</div>
	)
}

// Springs play through CSS linear() sampled from the spring's own curve
function timing(transition: TransitionConfig): KeyframeAnimationOptions {
	if (transition.type === "easing") {
		return {
			duration: transition.duration * 1000,
			easing: `cubic-bezier(${transition.ease.join(", ")})`,
		}
	}
	const params = springParams(transition)
	const seconds = springSettleDuration(params)
	const samples = Array.from({ length: 61 }, (_, i) =>
		springProgress((i / 60) * seconds, params).toFixed(4),
	)
	return { duration: seconds * 1000, easing: `linear(${samples.join(", ")})` }
}
