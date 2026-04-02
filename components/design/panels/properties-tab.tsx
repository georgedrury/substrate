"use client"

import { useSelection } from "../contexts/selection-context"
import { Separator } from "@/components/ui/separator"
import { TransformSection } from "../properties/transform-section"
import { FillSection } from "../properties/fill-section"
import { StrokeSection } from "../properties/stroke-section"
import { TextSection } from "../properties/text-section"
import { AppearanceSection } from "../properties/appearance-section"
import { AlignmentSection } from "../properties/alignment-section"

export function PropertiesTab() {
	const { selectedElements } = useSelection()

	if (selectedElements.length === 0) {
		return (
			<div className="flex h-full items-center justify-center p-4">
				<p className="text-xs text-muted-foreground">No selection</p>
			</div>
		)
	}

	const element = selectedElements[0]

	return (
		<div className="space-y-3 py-3">
			<div className="text-xs font-medium truncate px-3">{element.name}</div>

			<TransformSection />
			<Separator />
			<FillSection />
			<Separator />
			<StrokeSection />

			{element.type === "text" && (
				<>
					<Separator />
					<TextSection />
				</>
			)}

			<Separator />
			<AppearanceSection />

			{selectedElements.length > 1 && (
				<>
					<Separator />
					<AlignmentSection />
				</>
			)}
		</div>
	)
}
