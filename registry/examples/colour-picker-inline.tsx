"use client"

import { useState } from "react"
import { ColourPickerContent } from "@/registry/substrate/components/colour-picker"

export default function ColourPickerInline() {
	const [colour, setColour] = useState("#6366f1")

	return (
		<div className="w-[220px]">
			<ColourPickerContent value={colour} onChange={setColour} />
		</div>
	)
}
