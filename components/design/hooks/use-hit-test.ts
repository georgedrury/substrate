"use client"

import { useCallback } from "react"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useCanvasTransform } from "./use-canvas-transform"
import { getElementAtPoint, getHandleAtPoint } from "../canvas/hit-test"
import { worldToScreen } from "../lib/math"
import type { Point, HandlePosition, Bounds } from "../types"

export function useHitTest() {
  const { state } = useCanvas()
  const { selectedElements } = useSelection()
  const { toWorld, camera } = useCanvasTransform()

  const getElementAtScreenPoint = useCallback(
    (screenPoint: Point): string | null => {
      const worldPoint = toWorld(screenPoint)
      return getElementAtPoint(worldPoint, state.elements, state.elementOrder)
    },
    [toWorld, state.elements, state.elementOrder]
  )

  const getHandleAtScreenPoint = useCallback(
    (screenPoint: Point): HandlePosition | null => {
      if (selectedElements.length !== 1) return null
      const el = selectedElements[0]

      const topLeft = worldToScreen({ x: el.x, y: el.y }, camera)
      const screenBounds: Bounds = {
        x: topLeft.x,
        y: topLeft.y,
        width: el.width * camera.zoom,
        height: el.height * camera.zoom,
      }

      return getHandleAtPoint(screenPoint, screenBounds, camera.zoom)
    },
    [selectedElements, camera]
  )

  return { getElementAtScreenPoint, getHandleAtScreenPoint }
}
