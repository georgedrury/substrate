"use client"

import { useState } from "react"
import {
	CollapsiblePane,
	CollapsiblePaneHeader,
	CollapsiblePaneLabel,
	CollapsiblePaneContent,
} from "@/registry/substrate/components/collapsible-pane"
import { NumberInput } from "@/registry/substrate/components/number-input"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { Slider } from "@/registry/substrate/components/slider"

export default function CollapsiblePaneDemo() {
	const [x, setX] = useState(120)
	const [y, setY] = useState(80)

	return (
		<div className="w-[260px] border rounded-lg py-2 bg-card">
			<CollapsiblePane>
				<CollapsiblePaneHeader>
					<CollapsiblePaneLabel>Transform</CollapsiblePaneLabel>
				</CollapsiblePaneHeader>
				<CollapsiblePaneContent>
					<div className="grid grid-cols-2 gap-2">
						<NumberInput label="X" value={x} onChange={setX} />
						<NumberInput label="Y" value={y} onChange={setY} />
					</div>
				</CollapsiblePaneContent>
			</CollapsiblePane>

			<CollapsiblePane defaultOpen={false}>
				<CollapsiblePaneHeader>
					<CollapsiblePaneLabel>Appearance</CollapsiblePaneLabel>
				</CollapsiblePaneHeader>
				<CollapsiblePaneContent>
					<Action>
						<ActionLabel>Opacity</ActionLabel>
						<ActionControls>
							<Slider defaultValue={[100]} max={100} step={1} />
						</ActionControls>
					</Action>
				</CollapsiblePaneContent>
			</CollapsiblePane>
		</div>
	)
}
