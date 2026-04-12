"use client"

import { useState } from "react"
import {
	RiAlignLeft,
	RiAlignCenter,
	RiAlignRight,
	RiAlignJustify,
} from "@remixicon/react"
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/registry/substrate/components/toggle-group"

export default function ToggleGroupDemo() {
	const [align, setAlign] = useState("left")

	return (
		<ToggleGroup
			type="single"
			value={align}
			onValueChange={(value) => value && setAlign(value)}
			aria-label="Text alignment"
		>
			<ToggleGroupItem value="left" aria-label="Align left">
				<RiAlignLeft />
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
				<RiAlignCenter />
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
				<RiAlignRight />
			</ToggleGroupItem>
			<ToggleGroupItem value="justify" aria-label="Justify">
				<RiAlignJustify />
			</ToggleGroupItem>
		</ToggleGroup>
	)
}
