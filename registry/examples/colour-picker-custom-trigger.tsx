"use client"

import { useState } from "react"
import { ColourPicker, ColourSwatch } from "@/registry/substrate/components/colour-picker"
import { Button } from "@/components/ui/button"

export default function ColourPickerCustomTrigger() {
	const [colour, setColour] = useState("#ef4444")

	return (
		<ColourPicker value={colour} onChange={setColour}>
			<Button variant="outline" size="sm">
				<ColourSwatch colour={colour} size="sm" />
				Pick colour
			</Button>
		</ColourPicker>
	)
}
