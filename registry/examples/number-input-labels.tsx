"use client"

import { useState } from "react"
import { NumberInput } from "@/registry/substrate/components/number-input"

export default function NumberInputLabels() {
	const [w, setW] = useState(100)
	const [h, setH] = useState(100)
	const [r, setR] = useState(0)
	const [opacity, setOpacity] = useState(100)

	return (
		<div className="w-[260px] space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<NumberInput label="W" value={w} onChange={setW} min={0} />
				<NumberInput label="H" value={h} onChange={setH} min={0} />
			</div>
			<div className="grid grid-cols-2 gap-2">
				<NumberInput label="R" value={r} onChange={setR} suffix="°" />
				<NumberInput label="%" value={opacity} onChange={setOpacity} min={0} max={100} suffix="%" />
			</div>
		</div>
	)
}
