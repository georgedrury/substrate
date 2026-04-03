"use client"

import { useRef, useCallback } from "react"
import type { Point, HandlePosition } from "../types"

export type DragType = "create" | "move" | "resize" | "marquee" | "pan"

export interface DragInfo {
  type: DragType
  startWorld: Point
  startScreen: Point
  currentWorld: Point
  currentScreen: Point
  handle?: HandlePosition
  elementStartPositions?: Record<string, { x: number; y: number; width: number; height: number }>
}

export function useCanvasDrag() {
  const dragRef = useRef<DragInfo | null>(null)

  const startDrag = useCallback((info: DragInfo) => {
    dragRef.current = info
  }, [])

  const updateDrag = useCallback((worldPoint: Point, screenPoint: Point) => {
    if (dragRef.current) {
      dragRef.current.currentWorld = worldPoint
      dragRef.current.currentScreen = screenPoint
    }
  }, [])

  const endDrag = useCallback((): DragInfo | null => {
    const info = dragRef.current
    dragRef.current = null
    return info
  }, [])

  const isDragging = useCallback(() => dragRef.current !== null, [])

  return { dragRef, startDrag, updateDrag, endDrag, isDragging }
}
