"use client"

import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { Slider } from "@/registry/substrate/components/slider"

export default function ActionDemo() {
	return (
		<div className="w-[260px] space-y-2">
			<Action>
				<ActionLabel>Opacity</ActionLabel>
				<ActionControls>
					<Slider defaultValue={[80]} max={100} step={1} />
				</ActionControls>
			</Action>
			<Action>
				<ActionLabel>Scale</ActionLabel>
				<ActionControls>
					<Slider defaultValue={[100]} max={200} step={1} />
				</ActionControls>
			</Action>
		</div>
	)
}
