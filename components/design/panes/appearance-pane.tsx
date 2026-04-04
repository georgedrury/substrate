"use client"

import { useCallback } from "react"
import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import {
	CollapsiblePane,
	CollapsiblePaneHeader,
	CollapsiblePaneLabel,
	CollapsiblePaneContent,
} from "@/registry/substrate/components/collapsible-pane"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { NumberSlider } from "@/registry/substrate/components/number-slider"

export function AppearancePane() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

	const element = [...selectedIds].map((id) => elements[id]).filter(Boolean)[0]
	if (!element) return null

	return (
		<CollapsiblePane>
			<CollapsiblePaneHeader>
				<CollapsiblePaneLabel>Layer</CollapsiblePaneLabel>
			</CollapsiblePaneHeader>
			<CollapsiblePaneContent>
				<Action>
					<ActionLabel>Opacity</ActionLabel>
					<ActionControls>
						<NumberSlider
							value={element.opacity * 100}
							onChange={(v) => {
								updateElement(element.id, { opacity: v / 100 })
							}}
							onStart={() => pushSnapshot()}
							min={0}
							max={100}
							step={1}
							suffix="%"
						/>
					</ActionControls>
				</Action>
			</CollapsiblePaneContent>
		</CollapsiblePane>
	)
}
