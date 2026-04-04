"use client"

import { useState } from "react"
import { NumberInput } from "@/registry/substrate/components/number-input"

export default function NumberInputDemo() {
	const [x, setX] = useState(583.3)
	const [y, setY] = useState(151.17)

	return (
		<div className="w-[260px] space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<NumberInput label="X" value={x} onChange={setX} />
				<NumberInput label="Y" value={y} onChange={setY} />
			</div>
		</div>
	)
}
