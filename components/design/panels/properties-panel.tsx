"use client"

import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Panel } from "@/registry/substrate/components/panel"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/registry/substrate/components/badge"
import {
	EmptyState,
	EmptyStateIcon,
	EmptyStateTitle,
	EmptyStateDescription,
} from "@/registry/substrate/components/empty-state"
import { RiCursorLine } from "@remixicon/react"

import { AlignmentPane } from "../panes/alignment-pane"
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
			<Panel>
				<EmptyState>
					<EmptyStateIcon>
						<RiCursorLine className="size-5" />
					</EmptyStateIcon>
					<EmptyStateTitle>No selection</EmptyStateTitle>
					<EmptyStateDescription>
						Select an element to view its properties
					</EmptyStateDescription>
				</EmptyState>
			</Panel>
		)
	}

	const element = selectedElements[0]

	return (
		<Panel>
			<div className="flex items-center gap-2 px-3">
				<span className="text-xs font-medium truncate flex-1">{element.name}</span>
				<Badge variant="muted">{element.type}</Badge>
			</div>

			<TransformPane />
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
			{selectedElements.length > 1 && (
				<>
					<Separator />
					<AlignmentPane />
				</>
			)}
		</Panel>
	)
}
