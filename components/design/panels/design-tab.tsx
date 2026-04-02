"use client"

import { useCanvas } from "../contexts/canvas-context"
import { Label } from "@/components/ui/label"

export function DesignTab() {
	const { state } = useCanvas()

	return (
		<div className="space-y-3 p-3">
			<h3 className="text-xs">Canvas</h3>

			<div className="space-y-2">
				<div className="flex items-center justify-between text-xs">
					<Label className="text-muted-foreground">Zoom</Label>
					<span>{Math.round(state.camera.zoom * 100)}%</span>
				</div>

				<div className="flex items-center justify-between text-xs">
					<Label className="text-muted-foreground">Elements</Label>
					<span>{state.elementOrder.length}</span>
				</div>

				<div className="flex items-center justify-between text-xs">
					<Label className="text-muted-foreground">Position</Label>
					<span className="font-mono text-[11px]">
						{Math.round(state.camera.x)}, {Math.round(state.camera.y)}
					</span>
				</div>
			</div>
		</div>
	)
}
