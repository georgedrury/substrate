"use client"

import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Separator } from "@/components/ui/separator"

import { Panel } from "@/registry/substrate/components/panel"
import { AlignmentPane } from "../panes/alignment-pane"
import { AppearancePane } from "../panes/appearance-pane"
import { FillPane } from "../panes/fill-pane"
import { StrokePane } from "../panes/stroke-pane"
import { TextPane } from "../panes/text-pane"
import { TransformPane } from "../panes/transform-pane"

export function PropertiesPanel() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)

	const selectedElements = [...selectedIds].map((id) => elements[id]).filter(Boolean)
	if (selectedElements.length === 0) {
		return (
			<Panel className="">
				<div className="flex h-full items-center justify-center p-4">
					<p className="text-xs text-muted-foreground">No selection</p>
				</div>
			</Panel>
		)
	}

	const element = selectedElements[0]

	return (
		<Panel>
			<div className="text-xs font-medium truncate px-3">{element.name}</div>
			<TransformPane />
			<Separator />
			<AppearancePane />
			<Separator />
			<FillPane />
			<Separator />
			<StrokePane />
			{element.type === "text" && (
				<>
					<Separator />
					<TextPane />
				</>
			)}

			<Separator />

			{selectedElements.length > 1 && (
				<>
					<Separator />
					<AlignmentPane />
				</>
			)}
		</Panel>
	)
}
