"use client"

import { useCallback } from "react"
import { useDocumentStore } from "../stores/document-store"
import { useCanvasTransform } from "./use-canvas-transform"
import { getElementAtPoint, getHandleAtPoint } from "../canvas/hit-test"
import { worldToScreen } from "../lib/math"
import type { Point, HandlePosition, Bounds } from "../types"

export function useHitTest() {
  const elements = useDocumentStore((s) => s.elements)
  const elementOrder = useDocumentStore((s) => s.elementOrder)
  const selectedIds = useDocumentStore((s) => s.selectedIds)
  const { toWorld, camera } = useCanvasTransform()

  const getElementAtScreenPoint = useCallback(
    (screenPoint: Point): string | null => {
      const worldPoint = toWorld(screenPoint)
      return getElementAtPoint(worldPoint, elements, elementOrder)
    },
    [toWorld, elements, elementOrder],
  )

  const getHandleAtScreenPoint = useCallback(
    (screenPoint: Point): HandlePosition | null => {
      if (selectedIds.size !== 1) return null
      const id = [...selectedIds][0]
      const el = elements[id]
      if (!el) return null

      const topLeft = worldToScreen({ x: el.x, y: el.y }, camera)
      const screenBounds: Bounds = {
        x: topLeft.x,
        y: topLeft.y,
        width: el.width * camera.zoom,
        height: el.height * camera.zoom,
      }

      return getHandleAtPoint(screenPoint, screenBounds, camera.zoom)
    },
    [selectedIds, elements, camera],
  )

  return { getElementAtScreenPoint, getHandleAtScreenPoint }
}
