"use client"

import { useState, useEffect } from "react"
import { ProgressBar } from "@/registry/substrate/components/progress-bar"

export default function ProgressBarDemo() {
	const [value, setValue] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setValue((v) => (v >= 100 ? 0 : v + 2))
		}, 100)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className="w-[300px] space-y-4">
			<div className="space-y-1.5">
				<div className="flex justify-between text-[11px] text-muted-foreground">
					<span>Exporting...</span>
					<span>{value}%</span>
				</div>
				<ProgressBar value={value} />
			</div>
			<div className="space-y-1.5">
				<span className="text-[11px] text-muted-foreground">Loading assets</span>
				<ProgressBar value={0} indeterminate />
			</div>
		</div>
	)
}
