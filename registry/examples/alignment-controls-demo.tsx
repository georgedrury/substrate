"use client"

import { AlignmentControls, type AlignAction } from "@/registry/substrate/components/alignment-controls"
import { toast } from "@/registry/substrate/components/toast"

export default function AlignmentControlsDemo() {
	const handleAlign = (action: AlignAction) => {
		toast(`Aligned: ${action}`)
	}

	return (
		<div className="flex flex-col items-center gap-4">
			<AlignmentControls onAlign={handleAlign} />
			<AlignmentControls onAlign={handleAlign} showDistribute={false} />
		</div>
	)
}
