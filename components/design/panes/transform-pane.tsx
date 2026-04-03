"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Pane, PaneHeader, PaneLabel } from "@/registry/substrate/components/pane"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"

export function TransformPane() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

	const selectedElements = [...selectedIds].map((id) => elements[id]).filter(Boolean)

	const element = selectedElements[0]
	if (!element) return null

	return (
		<Pane>
			<PaneHeader>
				<PaneLabel>Transform</PaneLabel>
			</PaneHeader>
			<div className="grid grid-cols-2 gap-2">
				<NumberField label="X" value={element.x} field="x" elementId={element.id} updateElement={updateElement} pushSnapshot={pushSnapshot} />
				<NumberField label="Y" value={element.y} field="y" elementId={element.id} updateElement={updateElement} pushSnapshot={pushSnapshot} />
				<NumberField label="W" value={element.width} field="width" elementId={element.id} updateElement={updateElement} pushSnapshot={pushSnapshot} />
				<NumberField label="H" value={element.height} field="height" elementId={element.id} updateElement={updateElement} pushSnapshot={pushSnapshot} />
			</div>
			<div className="grid grid-cols-2 gap-2">
				<NumberField label="R" value={element.rotation} field="rotation" elementId={element.id} updateElement={updateElement} pushSnapshot={pushSnapshot} />
			</div>
		</Pane>
	)
}

function NumberField({
	label,
	value,
	field,
	elementId,
	updateElement,
	pushSnapshot,
}: {
	label: string
	value: number
	field: string
	elementId: string
	updateElement: (id: string, changes: Record<string, number>) => void
	pushSnapshot: () => void
}) {
	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const num = parseFloat(e.target.value)
			if (isNaN(num)) return
			pushSnapshot()
			updateElement(elementId, { [field]: num })
		},
		[elementId, field, updateElement, pushSnapshot],
	)

	return (
		<Action>
			<ActionLabel className="w-4">{label}</ActionLabel>
			<ActionControls>
				<Input
					type="number"
					value={Math.round(value * 100) / 100}
					onChange={onChange}
					className="h-7 text-xs"
				/>
			</ActionControls>
		</Action>
	)
}
