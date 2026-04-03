"use client"

import { DesignProvider } from "./design-provider"
import { DesignCanvas } from "../canvas/design-canvas"

import { LayersPanel } from "../panels/layers-panel"
import { usePanel } from "../contexts/panel-context"
import { useCanvas } from "../contexts/canvas-context"
import { useHistory } from "../contexts/history-context"
import { PropertiesPanel } from "../panels/properties-panel"
import { Tools } from "../panels/tools"

function EditorLayout() {
	const { state: panelState } = usePanel()
	const { state: canvasState } = useCanvas()

	const { canUndo, canRedo } = useHistory()

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-muted">
			{/* Left toolbar + layers overlay */}
			{panelState.leftPanel === "layers" && <LayersPanel />}

			<Tools />
			{/* Canvas */}
			<div className="relative flex-1">
				<DesignCanvas />

				{/* Zoom indicator */}
				<div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur-sm border border-border">
					<span>{Math.round(canvasState.camera.zoom * 100)}%</span>
					{canUndo && <span className="text-[10px]">Undo</span>}
					{canRedo && <span className="text-[10px]">Redo</span>}
				</div>
			</div>

			{/* Right panel */}
			{panelState.rightPanelOpen && <PropertiesPanel />}
		</div>
	)
}

export function DesignEditor() {
	return (
		<DesignProvider>
			<EditorLayout />
		</DesignProvider>
	)
}
