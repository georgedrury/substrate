"use client"

import { useState } from "react"
import {
	NodeCard,
	NodeHeader,
	NodeTitle,
	NodeBadge,
	NodeBody,
	NodePorts,
	NodePort,
	NodePreview,
	NodeDivider,
} from "@/registry/substrate/components/node"
import { NumberSlider } from "@/registry/substrate/components/number-slider"
import { NumberInput } from "@/registry/substrate/components/number-input"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { ColourPicker } from "@/registry/substrate/components/colour-picker"

export default function NodeDemo() {
	const [blur, setBlur] = useState(4)
	const [colour, setColour] = useState("#6366f1")
	const [width, setWidth] = useState(1920)
	const [height, setHeight] = useState(1080)

	return (
		<div className="flex gap-6 items-start p-4">
			{/* Blur node */}
			<NodeCard selected>
				<NodeHeader>
					<NodeTitle>Gaussian blur</NodeTitle>
					<NodeBadge>Filter</NodeBadge>
				</NodeHeader>
				<NodePorts>
					<NodePort type="image" label="Image" direction="input" connected />
					<NodePort type="number" label="Radius" direction="input" />
				</NodePorts>
				<NodeDivider />
				<NodeBody>
					<Action>
						<ActionLabel>Radius</ActionLabel>
						<ActionControls>
							<NumberSlider value={blur} onChange={setBlur} min={0} max={50} suffix="px" />
						</ActionControls>
					</Action>
				</NodeBody>
				<NodeDivider />
				<NodePorts>
					<NodePort type="image" label="Output" direction="output" connected />
				</NodePorts>
			</NodeCard>

			{/* Colour fill node */}
			<NodeCard>
				<NodeHeader>
					<NodeTitle>Solid fill</NodeTitle>
					<NodeBadge>Generate</NodeBadge>
				</NodeHeader>
				<NodeBody>
					<Action>
						<ActionLabel>Colour</ActionLabel>
						<ActionControls>
							<ColourPicker value={colour} onChange={setColour} />
						</ActionControls>
					</Action>
					<div className="grid grid-cols-2 gap-2">
						<NumberInput label="W" value={width} onChange={setWidth} min={1} />
						<NumberInput label="H" value={height} onChange={setHeight} min={1} />
					</div>
				</NodeBody>
				<NodeDivider />
				<NodePorts>
					<NodePort type="image" label="Image" direction="output" />
					<NodePort type="colour" label="Colour" direction="output" connected />
				</NodePorts>
			</NodeCard>

			{/* Output node */}
			<NodeCard>
				<NodeHeader>
					<NodeTitle>Output</NodeTitle>
				</NodeHeader>
				<NodePorts>
					<NodePort type="image" label="Final" direction="input" connected />
				</NodePorts>
				<NodePreview>
					<div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-[10px] text-muted-foreground">
						Preview
					</div>
				</NodePreview>
			</NodeCard>
		</div>
	)
}
