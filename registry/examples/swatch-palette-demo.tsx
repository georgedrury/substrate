"use client"

import { useState } from "react"
import {
	SwatchPalette,
	TAILWIND_COLOURS,
} from "@/registry/substrate/components/swatch-palette"

export default function SwatchPaletteDemo() {
	const [colour, setColour] = useState("#3b82f6")

	return (
		<div className="w-[240px] space-y-3">
			<SwatchPalette
				colours={TAILWIND_COLOURS}
				value={colour}
				onSelect={setColour}
			/>
			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<span
					className="size-5 rounded-md border"
					style={{ backgroundColor: colour }}
				/>
				{colour}
			</div>
		</div>
	)
}
