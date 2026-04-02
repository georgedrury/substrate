"use client"

import { useRef } from "react"
import { useCanvasRenderer } from "../hooks/use-canvas-renderer"
import { useCanvasInteraction } from "../hooks/use-canvas-interaction"
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts"
import { useTool } from "../contexts/tool-context"

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
  const { activeTool } = useTool()

  const { markDirty, dragStateRef } = useCanvasRenderer(canvasRef, containerRef)
  const { onPointerDown, onPointerMove, onPointerUp, onWheel } =
    useCanvasInteraction(markDirty, dragStateRef)

  useKeyboardShortcuts()

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: CURSOR_MAP[activeTool] ?? "default" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />
    </div>
  )
}
