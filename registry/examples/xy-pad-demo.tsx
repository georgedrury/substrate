"use client"

import { useState } from "react"
import { XYPad, type XYPadValue } from "@/registry/substrate/components/xy-pad"

const axis = { min: -40, max: 40, step: 1 }

export default function XYPadDemo() {
	const [offset, setOffset] = useState<XYPadValue>({ x: 12, y: -8 })

	return (
		<div className="flex w-full items-center gap-6">
			<div className="w-56 space-y-2">
				<XYPad aria-label="Shadow offset" value={offset} onChange={setOffset} x={axis} y={axis} />
				<p className="text-xs tabular-nums text-muted-foreground">
					x {offset.x}, y {offset.y}
				</p>
			</div>
			<div className="flex flex-1 items-center justify-center">
				<div
					className="size-20 rounded-lg bg-background"
					style={{ boxShadow: `${offset.x}px ${-offset.y}px 24px rgb(0 0 0 / 0.35)` }}
				/>
			</div>
		</div>
	)
}
