"use client"

import { useCallback } from "react"
import { Slider } from "@/registry/substrate/components/slider"
import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Pane, PaneLabel } from "@/registry/substrate/components/pane"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"

export function AppearancePane() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

	const element = [...selectedIds].map((id) => elements[id]).filter(Boolean)[0]
	if (!element) return null

	const updateOpacity = useCallback(
		(opacity: number) => {
			pushSnapshot()
			updateElement(element.id, { opacity })
		},
		[element.id, updateElement, pushSnapshot],
	)

	return (
		<Pane>
			<PaneLabel>Layer</PaneLabel>
			<Action>
				<ActionLabel>Opacity</ActionLabel>
				<ActionControls className="flex items-center gap-2">
					<Slider
						value={[element.opacity * 100]}
						onValueChange={([v]) => updateOpacity(v / 100)}
						max={100}
						step={1}
						className="flex-1"
					/>
					<span className="text-[11px] text-muted-foreground w-8 text-right">
						{Math.round(element.opacity * 100)}%
					</span>
				</ActionControls>
			</Action>
		</Pane>
	)
}
