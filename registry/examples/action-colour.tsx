"use client"

import { useState } from "react"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { ColourPicker } from "@/registry/substrate/components/colour-picker"
import { Slider } from "@/registry/substrate/components/slider"

export default function ActionColour() {
	const [fill, setFill] = useState("#6366f1")
	const [stroke, setStroke] = useState("#0ea5e9")

	return (
		<div className="w-[260px] space-y-2">
			<Action>
				<ActionLabel>Fill</ActionLabel>
				<ActionControls>
					<ColourPicker value={fill} onChange={setFill} />
				</ActionControls>
			</Action>
			<Action>
				<ActionLabel>Stroke</ActionLabel>
				<ActionControls>
					<ColourPicker value={stroke} onChange={setStroke} />
				</ActionControls>
			</Action>
			<Action>
				<ActionLabel>Opacity</ActionLabel>
				<ActionControls>
					<Slider defaultValue={[100]} max={100} step={1} />
				</ActionControls>
			</Action>
		</div>
	)
}
