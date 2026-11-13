"use client"

import { useEffect, useRef } from "react"
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

	// React attaches wheel listeners as passive, so preventDefault() there
	// can't stop the browser's own pinch-zoom or page scroll. Attach natively.
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		canvas.addEventListener("wheel", onWheel, { passive: false })
		return () => canvas.removeEventListener("wheel", onWheel)
	}, [onWheel])

	return (
		<div ref={containerRef} data-slot="design-canvas" className="relative h-full w-full overflow-hidden">
			<canvas
				ref={canvasRef}
				className="absolute inset-0"
				style={{ cursor: CURSOR_MAP[activeTool] ?? "default" }}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
			/>
		</div>
	)
}
