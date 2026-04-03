"use client"

import { useState } from "react"
import { ColourPicker } from "@/registry/substrate/components/colour-picker"
import {
	Action,
	ActionControls,
	ActionLabel,
} from "../substrate/components/action"

export default function ColourPickerDemo() {
	const [colour, setColour] = useState("#6366f1")

	return (
		<div className="flex items-center gap-3">
			<Action>
				<ActionLabel>Colour</ActionLabel>
				<ActionControls>
					<ColourPicker value={colour} onChange={setColour} />
					<span className="text-sm font-mono text-muted-foreground">
						{colour}
					</span>
				</ActionControls>
			</Action>
		</div>
	)
}
