"use client"

import { ControlsTimeline } from "@/registry/substrate/components/controls-timeline"
import { useControlsTimeline } from "@/registry/substrate/hooks/use-controls-timeline"

export default function ControlsTimelineDemo() {
	const timeline = useControlsTimeline(
		"Entrance",
		{
			duration: 2.4,
			card: {
				at: 0,
				from: { y: 32, opacity: 0 },
				to: { y: 0, opacity: 1 },
				transition: { type: "spring", visualDuration: 0.5, bounce: 0.25 },
			},
			title: {
				at: 0.3,
				duration: 0.4,
				from: { x: -16, opacity: 0 },
				to: { x: 0, opacity: 1 },
				transition: { type: "easing", duration: 0.4, ease: [0.2, 0, 0, 1] },
			},
			badge: {
				at: 0.7,
				from: { scale: 0 },
				steps: [
					{ duration: 0.25, to: { scale: 1.2 } },
					{ duration: 0.2, to: { scale: 1 } },
				],
			},
			glow: {
				at: 1.2,
				props: {
					blur: { from: 0, to: 24, duration: 0.6 },
					spread: { from: 0, to: 4, duration: 0.4, delay: 0.2 },
				},
			},
		},
		{ loop: true },
	)

	const { card, title, badge, glow } = timeline

	return (
		<div className="flex w-full flex-col gap-4">
			<div className="flex h-48 items-center justify-center rounded-lg bg-canvas">
				<div
					className="relative flex h-24 w-48 items-center rounded-xl bg-background px-5 shadow-sm ring-1 ring-border"
					style={{
						opacity: card.current.opacity,
						transform: `translateY(${card.current.y}px)`,
						boxShadow: `0 0 ${glow.current.blur}px ${glow.current.spread}px rgb(167 139 250 / 0.6)`,
					}}
				>
					<span
						className="text-sm font-medium"
						style={{
							opacity: title.current.opacity,
							transform: `translateX(${title.current.x}px)`,
						}}
					>
						Substrate
					</span>
					<span
						className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground"
						style={{ transform: `scale(${badge.current.scale})` }}
					>
						New
					</span>
				</div>
			</div>
			<div className="rounded-lg border bg-panel">
				<ControlsTimeline />
			</div>
		</div>
	)
}
