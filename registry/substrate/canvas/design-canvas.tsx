"use client"

import { useRef } from "react"
import { useCanvasRenderer } from "@/hooks/substrate/use-canvas-renderer"
import { useCanvasInteraction } from "@/hooks/substrate/use-canvas-interaction"
import { useKeyboardShortcuts } from "@/hooks/substrate/use-keyboard-shortcuts"
import { useToolStore } from "@/stores/substrate/tool-store"

const CURSOR_MAP: Record<string, string> = {
	select: "default",
	hand: "grab",
	rectangle: "crosshair",
	ellipse: "crosshair",
	line: "crosshair",
	text: "text",
	frame: "crosshair",
}

export function DesignCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const activeTool = useToolStore((s) => s.activeTool)

	const { markDirty, dragStateRef } = useCanvasRenderer(canvasRef, containerRef)
	const { onPointerDown, onPointerMove, onPointerUp, onWheel } =
		useCanvasInteraction(markDirty, dragStateRef)

	useKeyboardShortcuts()

	return (
		<div ref={containerRef} className="relative h-full w-full overflow-hidden ">
			<canvas
				ref={canvasRef}
				className="absolute inset-0 "
				style={{ cursor: CURSOR_MAP[activeTool] ?? "default" }}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onWheel={onWheel}
			/>
		</div>
	)
}
