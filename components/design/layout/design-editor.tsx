"use client"

import { DesignProvider } from "./design-provider"
import { DesignCanvas } from "../canvas/design-canvas"
import { Toolbar } from "../panels/toolbar"
import { LayersPanel } from "../panels/layers-panel"
import { PanelSwitcher } from "../panels/design-panel"
import { usePanel } from "../contexts/panel-context"
import { useCanvas } from "../contexts/canvas-context"
import { useHistory } from "../contexts/history-context"

function EditorLayout() {
	const { state: panelState } = usePanel()
	const { state: canvasState } = useCanvas()
	const { canUndo, canRedo } = useHistory()

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-muted">
			{/* Left toolbar + layers overlay */}
			<Toolbar />
			{panelState.leftPanel === "layers" && (
				<div className="w-55 border-r border-border bg-background shrink-0">
					<LayersPanel />
				</div>
			)}

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
			{panelState.rightPanelOpen && (
				<div className="w-70 border-l border-border bg-background shrink-0">
					<PanelSwitcher />
				</div>
			)}
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
