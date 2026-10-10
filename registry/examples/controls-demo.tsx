"use client"

import { Controls } from "@/registry/substrate/components/controls"
import { useControls } from "@/registry/substrate/hooks/use-controls"

export default function ControlsDemo() {
	const card = useControls("Card", {
		title: "Substrate",
		radius: [16, 0, 48],
		colour: "#a78bfa",
		visible: true,
		align: { type: "select", options: ["left", "center", "right"], default: "center" },
		shadow: {
			blur: [24, 0, 64],
			opacity: [0.35, 0, 1],
		},
	})

	return (
		<div className="flex w-full items-stretch gap-4">
			<div className="flex flex-1 items-center justify-center rounded-lg bg-canvas p-6">
				{card.visible && (
					<div
						className="flex h-28 w-44 items-center px-4 text-sm font-medium text-black"
						style={{
							borderRadius: card.radius,
							background: card.colour,
							justifyContent:
								card.align === "left"
									? "flex-start"
									: card.align === "right"
										? "flex-end"
										: "center",
							boxShadow: `0 8px ${card.shadow.blur}px rgb(0 0 0 / ${card.shadow.opacity})`,
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
