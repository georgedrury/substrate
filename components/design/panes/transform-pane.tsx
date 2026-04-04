"use client"

import { useCallback } from "react"
import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Pane, PaneHeader, PaneLabel } from "@/registry/substrate/components/pane"
import { NumberInput } from "@/registry/substrate/components/number-input"

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
				<TransformField
					label="X"
					value={element.x}
					field="x"
					elementId={element.id}
					updateElement={updateElement}
					pushSnapshot={pushSnapshot}
				/>
				<TransformField
					label="Y"
					value={element.y}
					field="y"
					elementId={element.id}
					updateElement={updateElement}
					pushSnapshot={pushSnapshot}
				/>
				<TransformField
					label="W"
					value={element.width}
					field="width"
					elementId={element.id}
					updateElement={updateElement}
					pushSnapshot={pushSnapshot}
					min={0}
				/>
				<TransformField
					label="H"
					value={element.height}
					field="height"
					elementId={element.id}
					updateElement={updateElement}
					pushSnapshot={pushSnapshot}
					min={0}
				/>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<TransformField
					label="R"
					value={element.rotation}
					field="rotation"
					elementId={element.id}
					updateElement={updateElement}
					pushSnapshot={pushSnapshot}
					suffix="°"
				/>
			</div>
		</Pane>
	)
}

function TransformField({
	label,
	value,
	field,
	elementId,
	updateElement,
	pushSnapshot,
	min,
	suffix,
}: {
	label: string
	value: number
	field: string
	elementId: string
	updateElement: (id: string, changes: Record<string, number>) => void
	pushSnapshot: () => void
	min?: number
	suffix?: string
}) {
	const onChange = useCallback(
		(v: number) => {
			updateElement(elementId, { [field]: v })
		},
		[elementId, field, updateElement],
	)

	const onStart = useCallback(() => {
		pushSnapshot()
	}, [pushSnapshot])

	return (
		<NumberInput
			label={label}
			value={value}
			onChange={onChange}
			onStart={onStart}
			min={min}
			suffix={suffix}
		/>
	)
}
