"use client"

import { useState } from "react"
import {
	RiGridLine,
	RiRulerLine,
	RiFocusLine,
} from "@remixicon/react"
import { Toggle } from "@/registry/substrate/components/toggle"

export default function ToggleDemo() {
	const [grid, setGrid] = useState(true)
	const [rulers, setRulers] = useState(false)
	const [snap, setSnap] = useState(true)

	return (
		<div className="flex gap-1">
			<Toggle pressed={grid} onPressedChange={setGrid} aria-label="Toggle grid">
				<RiGridLine /> Grid
			</Toggle>
			<Toggle pressed={rulers} onPressedChange={setRulers} aria-label="Toggle rulers">
				<RiRulerLine /> Rulers
			</Toggle>
			<Toggle pressed={snap} onPressedChange={setSnap} aria-label="Toggle snap">
				<RiFocusLine /> Snap
			</Toggle>
		</div>
	)
}
