"use client"

import { DesignCanvas } from "@/registry/substrate/canvas/design-canvas"

import { LayersPanel } from "../panels/layers-panel"
import { usePanelStore } from "@/registry/substrate/stores/panel-store"
import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { PropertiesPanel } from "../panels/properties-panel"
import { Tools } from "../panels/tools"

function EditorLayout() {
	const leftPanel = usePanelStore((s) => s.leftPanel)
	const rightPanelOpen = usePanelStore((s) => s.rightPanelOpen)
	const zoom = useDocumentStore((s) => s.camera.zoom)
	const canUndo = useDocumentStore((s) => s.past.length > 0)
	const canRedo = useDocumentStore((s) => s.future.length > 0)

	return (
		<div className="flex h-screen w-screen overflow-hidden">
			{/* Left toolbar + layers overlay */}
			{leftPanel === "layers" && <LayersPanel />}

			<Tools />
			{/* Canvas */}
			<div className="relative flex-1">
				<DesignCanvas />

				{/* Zoom indicator */}
				<div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur-sm border border-border">
					<span>{Math.round(zoom * 100)}%</span>
					{canUndo && <span className="text-[10px]">Undo</span>}
					{canRedo && <span className="text-[10px]">Redo</span>}
				</div>
			</div>

			{/* Right panel */}
			{rightPanelOpen && <PropertiesPanel />}
		</div>
	)
}

export function DesignEditor() {
	return <EditorLayout />
}
