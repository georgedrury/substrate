"use client"

import { useCallback, useRef } from "react"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useTool } from "../contexts/tool-context"
import { useHistory } from "../contexts/history-context"
import { useCanvasTransform } from "./use-canvas-transform"
import { useHitTest } from "./use-hit-test"
import { useCanvasDrag, type DragInfo } from "./use-canvas-drag"
import { getElementsInBounds } from "../canvas/hit-test"
import {
  createRectangle,
  createEllipse,
  createText,
  createLine,
  createFrame,
} from "../lib/element-factory"
import { normalizeBounds, screenToWorld, distance } from "../lib/math"
import type { Point, DesignElement, HandlePosition } from "../types"

const DRAG_THRESHOLD = 3

export function useCanvasInteraction(
  markDirty: () => void,
  dragStateRef: React.RefObject<{
    isDragging: boolean
    dragStart: Point | null
    dragCurrent: Point | null
    dragType: "create" | "marquee" | null
  }>
) {
  const { state: canvasState, dispatch: canvasDispatch } = useCanvas()
  const { state: selectionState, dispatch: selectionDispatch } = useSelection()
  const { activeTool, setTool } = useTool()
  const { pushSnapshot } = useHistory()
  const { toWorld, camera, pan, zoomToPoint } = useCanvasTransform()
  const { getElementAtScreenPoint, getHandleAtScreenPoint } = useHitTest()
  const { dragRef, startDrag, updateDrag, endDrag } = useCanvasDrag()
  const pointerStartRef = useRef<Point | null>(null)
  const hasDraggedRef = useRef(false)

  const getCanvasPoint = useCallback(
    (e: React.PointerEvent | PointerEvent): Point => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    []
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const screenPoint = getCanvasPoint(e)
      const worldPoint = toWorld(screenPoint)
      pointerStartRef.current = screenPoint
      hasDraggedRef.current = false

      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      if (activeTool === "hand") {
        startDrag({
          type: "pan",
          startWorld: worldPoint,
          startScreen: screenPoint,
          currentWorld: worldPoint,
          currentScreen: screenPoint,
        })
        return
      }

      if (activeTool === "select") {
        // Check resize handle first
        const handle = getHandleAtScreenPoint(screenPoint)
        if (handle && selectionState.selectedIds.size === 1) {
          const id = [...selectionState.selectedIds][0]
          const el = canvasState.elements[id]
          if (el) {
            pushSnapshot()
            startDrag({
              type: "resize",
              startWorld: worldPoint,
              startScreen: screenPoint,
              currentWorld: worldPoint,
              currentScreen: screenPoint,
              handle,
              elementStartPositions: {
                [id]: { x: el.x, y: el.y, width: el.width, height: el.height },
              },
            })
            return
          }
        }

        // Check element hit
        const hitId = getElementAtScreenPoint(screenPoint)
        if (hitId) {
          if (e.shiftKey) {
            selectionDispatch({ type: "TOGGLE", id: hitId })
          } else if (!selectionState.selectedIds.has(hitId)) {
            selectionDispatch({ type: "SELECT", ids: [hitId] })
          }

          // Prepare for move
          const positions: Record<string, { x: number; y: number; width: number; height: number }> = {}
          const idsToMove = selectionState.selectedIds.has(hitId)
            ? selectionState.selectedIds
            : new Set([hitId])
          for (const id of idsToMove) {
            const el = canvasState.elements[id]
            if (el) positions[id] = { x: el.x, y: el.y, width: el.width, height: el.height }
          }

          startDrag({
            type: "move",
            startWorld: worldPoint,
            startScreen: screenPoint,
            currentWorld: worldPoint,
            currentScreen: screenPoint,
            elementStartPositions: positions,
          })
          return
        }

        // Empty space — start marquee
        selectionDispatch({ type: "DESELECT_ALL" })
        startDrag({
          type: "marquee",
          startWorld: worldPoint,
          startScreen: screenPoint,
          currentWorld: worldPoint,
          currentScreen: screenPoint,
        })
        return
      }

      // Shape creation tools
      if (["rectangle", "ellipse", "line", "text", "frame"].includes(activeTool)) {
        startDrag({
          type: "create",
          startWorld: worldPoint,
          startScreen: screenPoint,
          currentWorld: worldPoint,
          currentScreen: screenPoint,
        })
        return
      }
    },
    [
      activeTool, getCanvasPoint, toWorld, getHandleAtScreenPoint,
      getElementAtScreenPoint, selectionState.selectedIds, canvasState.elements,
      selectionDispatch, startDrag, pushSnapshot, camera,
    ]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current
      if (!drag) {
        // Hover detection
        const screenPoint = getCanvasPoint(e)
        const hitId = getElementAtScreenPoint(screenPoint)
        selectionDispatch({ type: "SET_HOVERED", id: hitId })
        return
      }

      const screenPoint = getCanvasPoint(e)
      const worldPoint = toWorld(screenPoint)

      if (!hasDraggedRef.current && pointerStartRef.current) {
        if (distance(screenPoint, pointerStartRef.current) < DRAG_THRESHOLD) return
        hasDraggedRef.current = true
        if (drag.type === "move") pushSnapshot()
      }

      updateDrag(worldPoint, screenPoint)

      switch (drag.type) {
        case "pan":
          pan(
            screenPoint.x - drag.currentScreen.x + (drag.currentScreen.x - screenPoint.x) * 0 + (e.movementX),
            e.movementY
          )
          drag.currentScreen = screenPoint
          break

        case "move": {
          if (!drag.elementStartPositions) break
          const dx = worldPoint.x - drag.startWorld.x
          const dy = worldPoint.y - drag.startWorld.y
          for (const [id, start] of Object.entries(drag.elementStartPositions)) {
            canvasDispatch({
              type: "UPDATE_ELEMENT",
              id,
              changes: { x: start.x + dx, y: start.y + dy },
            })
          }
          break
        }

        case "resize": {
          if (!drag.elementStartPositions || !drag.handle) break
          const [id, start] = Object.entries(drag.elementStartPositions)[0]
          const dx = worldPoint.x - drag.startWorld.x
          const dy = worldPoint.y - drag.startWorld.y
          const changes = computeResize(start, drag.handle, dx, dy)
          canvasDispatch({ type: "UPDATE_ELEMENT", id, changes })
          break
        }

        case "create":
          dragStateRef.current.isDragging = true
          dragStateRef.current.dragStart = drag.startWorld
          dragStateRef.current.dragCurrent = worldPoint
          dragStateRef.current.dragType = "create"
          break

        case "marquee":
          dragStateRef.current.isDragging = true
          dragStateRef.current.dragStart = drag.startWorld
          dragStateRef.current.dragCurrent = worldPoint
          dragStateRef.current.dragType = "marquee"
          break
      }

      markDirty()
    },
    [
      dragRef, getCanvasPoint, toWorld, getElementAtScreenPoint,
      selectionDispatch, updateDrag, pan, canvasDispatch, markDirty,
      pushSnapshot, dragStateRef, camera,
    ]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = endDrag()
      dragStateRef.current.isDragging = false
      dragStateRef.current.dragStart = null
      dragStateRef.current.dragCurrent = null
      dragStateRef.current.dragType = null

      if (!drag) return

      const screenPoint = getCanvasPoint(e)
      const worldPoint = toWorld(screenPoint)

      switch (drag.type) {
        case "create": {
          if (!hasDraggedRef.current) {
            // Click without drag — create small default element
            const bounds = {
              x: drag.startWorld.x,
              y: drag.startWorld.y,
              width: 100,
              height: activeTool === "line" ? 0 : 100,
            }
            const element = createElement(activeTool, bounds)
            if (element) {
              pushSnapshot()
              canvasDispatch({ type: "ADD_ELEMENT", element })
              selectionDispatch({ type: "SELECT", ids: [element.id] })
            }
          } else {
            const bounds = normalizeBounds(drag.startWorld, worldPoint)
            if (bounds.width < 2 && bounds.height < 2) break
            const element = createElement(activeTool, bounds)
            if (element) {
              pushSnapshot()
              canvasDispatch({ type: "ADD_ELEMENT", element })
              selectionDispatch({ type: "SELECT", ids: [element.id] })
            }
          }
          setTool("select")
          break
        }

        case "marquee": {
          const bounds = normalizeBounds(drag.startWorld, worldPoint)
          const ids = getElementsInBounds(
            bounds,
            canvasState.elements,
            canvasState.elementOrder
          )
          if (ids.length > 0) {
            selectionDispatch({ type: "SELECT", ids, append: e.shiftKey })
          }
          break
        }

        case "move":
        case "resize":
          // History snapshot was already pushed on drag start
          break
      }

      markDirty()
    },
    [
      endDrag, getCanvasPoint, toWorld, activeTool, canvasDispatch,
      selectionDispatch, setTool, pushSnapshot, canvasState, markDirty, dragStateRef,
    ]
  )

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const screenPoint = getCanvasPoint(e as unknown as React.PointerEvent)

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * 0.01
        const newZoom = camera.zoom * (1 + delta)
        zoomToPoint(screenPoint, newZoom)
      } else {
        // Pan
        pan(-e.deltaX, -e.deltaY)
      }

      markDirty()
    },
    [getCanvasPoint, camera.zoom, zoomToPoint, pan, markDirty]
  )

  return { onPointerDown, onPointerMove, onPointerUp, onWheel }
}

// ── Helpers ──

function createElement(tool: string, bounds: { x: number; y: number; width: number; height: number }): DesignElement | null {
  switch (tool) {
    case "rectangle": return createRectangle(bounds)
    case "ellipse": return createEllipse(bounds)
    case "text": return createText(bounds)
    case "line": return createLine(bounds)
    case "frame": return createFrame(bounds)
    default: return null
  }
}

function computeResize(
  start: { x: number; y: number; width: number; height: number },
  handle: HandlePosition,
  dx: number,
  dy: number
): Partial<DesignElement> {
  let { x, y, width, height } = start

  switch (handle) {
    case "nw":
      x += dx; y += dy; width -= dx; height -= dy; break
    case "n":
      y += dy; height -= dy; break
    case "ne":
      y += dy; width += dx; height -= dy; break
    case "e":
      width += dx; break
    case "se":
      width += dx; height += dy; break
    case "s":
      height += dy; break
    case "sw":
      x += dx; width -= dx; height += dy; break
    case "w":
      x += dx; width -= dx; break
  }

  // Prevent negative dimensions
  if (width < 1) { x += width - 1; width = 1 }
  if (height < 1) { y += height - 1; height = 1 }

  return { x, y, width, height }
}
