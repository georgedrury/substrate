"use client"

import { useEffect, useRef } from "react"
import { useCanvasRenderer } from "@/hooks/substrate/use-canvas-renderer"
import { useCanvasInteraction } from "@/hooks/substrate/use-canvas-interaction"
import { useKeyboardShortcuts } from "@/hooks/substrate/use-keyboard-shortcuts"
import { useToolStore } from "@/stores/substrate/tool-store"
import { useDocumentStore } from "@/stores/substrate/document-store"
import type { Handle } from "@/lib/substrate/types"

const CURSOR_MAP: Record<string, string> = {
	select: "default",
	hand: "grab",
	rectangle: "crosshair",
	ellipse: "crosshair",
	line: "crosshair",
	text: "text",
	frame: "crosshair",
}

// Direction each resize handle points, clockwise from east, in degrees
const HANDLE_ANGLE: Record<Exclude<Handle, "rotate">, number> = {
	e: 0, se: 45, s: 90, sw: 135, w: 180, nw: 225, n: 270, ne: 315,
}

const RESIZE_CURSORS = ["ew-resize", "nwse-resize", "ns-resize", "nesw-resize"]

// A turning arrow with a light halo so it reads on any background
const ROTATE_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><path d='M12 4a8 8 0 1 0 8 8' fill='none' stroke='white' stroke-width='4.5' stroke-linecap='round'/><path d='M12 4a8 8 0 1 0 8 8' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/><path d='M12 0.5v7l-5-3.5z' fill='black' stroke='white' stroke-width='1.2'/></svg>") 10 10, grab`

// A resize cursor has to follow the rotated element: a handle that points
// north-east on an upright shape points east once the shape turns 45 degrees
function handleCursor(handle: Handle, rotation: number): string {
	if (handle === "rotate") return ROTATE_CURSOR
	const angle = (((HANDLE_ANGLE[handle] + rotation) % 180) + 180) % 180
	return RESIZE_CURSORS[Math.round(angle / 45) % 4]
}

export function DesignCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const activeTool = useToolStore((s) => s.activeTool)

	const { markDirty, dragStateRef } = useCanvasRenderer(canvasRef, containerRef)
	const { onPointerDown, onPointerMove, onPointerUp, onWheel, activeHandle } =
		useCanvasInteraction(markDirty, dragStateRef)
	const selectedRotation = useDocumentStore((s) => {
		if (s.selectedIds.size !== 1) return 0
		return s.elements[[...s.selectedIds][0]]?.rotation ?? 0
	})

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
				style={{
					cursor: activeHandle
						? handleCursor(activeHandle, selectedRotation)
						: (CURSOR_MAP[activeTool] ?? "default"),
				}}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
			/>
		</div>
	)
}
