"use client"

import { useState } from "react"
import { NumberSlider } from "@/registry/substrate/components/number-slider"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"

export default function NumberSliderDemo() {
	const [opacity, setOpacity] = useState(80)
	const [blur, setBlur] = useState(4)

	return (
		<div className="w-[280px] space-y-2">
			<Action>
				<ActionLabel>Opacity</ActionLabel>
				<ActionControls>
					<NumberSlider
						value={opacity}
						onChange={setOpacity}
						min={0}
						max={100}
						step={1}
						suffix="%"
					/>
				</ActionControls>
			</Action>
			<Action>
				<ActionLabel>Blur</ActionLabel>
				<ActionControls>
					<NumberSlider
						value={blur}
						onChange={setBlur}
						min={0}
						max={50}
						step={0.5}
						suffix="px"
					/>
				</ActionControls>
			</Action>
		</div>
	)
}
