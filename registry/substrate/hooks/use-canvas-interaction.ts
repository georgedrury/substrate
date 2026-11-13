"use client"

import { useCallback, useRef, useState } from "react"
import { useDocumentStore } from "@/stores/substrate/document-store"
import { useToolStore } from "@/stores/substrate/tool-store"
import { useCanvasTransform } from "./use-canvas-transform"
import { useHitTest } from "./use-hit-test"
import { useCanvasDrag } from "./use-canvas-drag"
import { getElementsInBounds } from "@/components/substrate/hit-test"
import {
  createRectangle,
  createEllipse,
  createText,
  createLine,
  createFrame,
} from "@/lib/substrate/element-factory"
import {
  normalizeBounds,
  distance,
  resizeBounds,
  angleBetween,
  normalizeAngle,
  snapAngle,
  boundsCenter,
} from "@/lib/substrate/math"
import type { Point, Handle, DesignElement } from "@/lib/substrate/types"

// Holding shift while rotating snaps to this step, in degrees
const ROTATE_SNAP = 15

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
  const elements = useDocumentStore((s) => s.elements)
  const elementOrder = useDocumentStore((s) => s.elementOrder)
  const selectedIds = useDocumentStore((s) => s.selectedIds)
  const addElement = useDocumentStore((s) => s.addElement)
  const updateElement = useDocumentStore((s) => s.updateElement)
  const select = useDocumentStore((s) => s.select)
  const deselectAll = useDocumentStore((s) => s.deselectAll)
  const toggleSelection = useDocumentStore((s) => s.toggleSelection)
  const setHovered = useDocumentStore((s) => s.setHovered)
  const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

  const activeTool = useToolStore((s) => s.activeTool)
  const setTool = useToolStore((s) => s.setTool)

  const { toWorld, camera, pan, zoomToPoint } = useCanvasTransform()
  const { getElementAtScreenPoint, getHandleAtScreenPoint } = useHitTest()
  const { dragRef, startDrag, updateDrag, endDrag } = useCanvasDrag()
  // The handle under the pointer, for the cursor (and kept during a handle drag)
  const [activeHandle, setActiveHandle] = useState<Handle | null>(null)
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

      // The hand tool and the middle mouse button both pan
      if (activeTool === "hand" || e.button === 1) {
        if (e.button === 1) e.preventDefault()
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
        if (handle && selectedIds.size === 1) {
          const id = [...selectedIds][0]
          const el = elements[id]
          if (el) {
            setActiveHandle(handle)
            const base = {
              startWorld: worldPoint,
              startScreen: screenPoint,
              currentWorld: worldPoint,
              currentScreen: screenPoint,
            }
            if (handle === "rotate") {
              const center = boundsCenter(el)
              startDrag({
                ...base,
                type: "rotate",
                rotate: {
                  id,
                  center,
                  startAngle: angleBetween(center, worldPoint),
                  startRotation: el.rotation,
                },
              })
            } else {
              startDrag({
                ...base,
                type: "resize",
                handle,
                elementStartPositions: {
                  [id]: { x: el.x, y: el.y, width: el.width, height: el.height },
                },
              })
            }
            return
          }
        }

        // Check element hit
        const hitId = getElementAtScreenPoint(screenPoint)
        if (hitId) {
          if (e.shiftKey) {
            toggleSelection(hitId)
          } else if (!selectedIds.has(hitId)) {
            select([hitId])
          }

          // Prepare for move
          const positions: Record<string, { x: number; y: number; width: number; height: number }> = {}
          const idsToMove = selectedIds.has(hitId)
            ? selectedIds
            : new Set([hitId])
          for (const id of idsToMove) {
            const el = elements[id]
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
        deselectAll()
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
      getElementAtScreenPoint, selectedIds, elements,
      select, toggleSelection, deselectAll, startDrag, pushSnapshot,
    ]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current
      if (!drag) {
        // Hover detection
        const screenPoint = getCanvasPoint(e)
        const hitId = getElementAtScreenPoint(screenPoint)
        setHovered(hitId)
        setActiveHandle(activeTool === "select" ? getHandleAtScreenPoint(screenPoint) : null)
        return
      }

      const screenPoint = getCanvasPoint(e)
      const worldPoint = toWorld(screenPoint)

      if (!hasDraggedRef.current && pointerStartRef.current) {
        if (distance(screenPoint, pointerStartRef.current) < DRAG_THRESHOLD) return
        hasDraggedRef.current = true
        // Snapshot once the drag really starts, so a click on a handle
        // doesn't leave an empty undo step
        if (drag.type === "move" || drag.type === "resize" || drag.type === "rotate") pushSnapshot()
      }

      updateDrag(worldPoint, screenPoint)

      switch (drag.type) {
        case "pan":
          pan(e.movementX, e.movementY)
          drag.currentScreen = screenPoint
          break

        case "move": {
          if (!drag.elementStartPositions) break
          const dx = worldPoint.x - drag.startWorld.x
          const dy = worldPoint.y - drag.startWorld.y
          for (const [id, start] of Object.entries(drag.elementStartPositions)) {
            updateElement(id, { x: start.x + dx, y: start.y + dy })
          }
          break
        }

        case "resize": {
          if (!drag.elementStartPositions || !drag.handle) break
          const [id, start] = Object.entries(drag.elementStartPositions)[0]
          const dx = worldPoint.x - drag.startWorld.x
          const dy = worldPoint.y - drag.startWorld.y
          const rotation = useDocumentStore.getState().elements[id]?.rotation ?? 0
          updateElement(id, resizeBounds(start, drag.handle, { x: dx, y: dy }, rotation))
          break
        }

        case "rotate": {
          if (!drag.rotate) break
          const { id, center, startAngle, startRotation } = drag.rotate
          const turned = startRotation + angleBetween(center, worldPoint) - startAngle
          updateElement(id, {
            rotation: normalizeAngle(e.shiftKey ? snapAngle(turned, ROTATE_SNAP) : turned),
          })
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
      setHovered, updateDrag, pan, updateElement, markDirty,
      pushSnapshot, dragStateRef, getHandleAtScreenPoint, activeTool,
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
            // A click makes a default-size shape; a text note is a single line
            const bounds = {
              x: drag.startWorld.x,
              y: drag.startWorld.y,
              width: activeTool === "text" ? 160 : 100,
              height: activeTool === "line" ? 0 : activeTool === "text" ? 32 : 100,
            }
            const element = createElement(activeTool, bounds)
            if (element) {
              pushSnapshot()
              addElement(element)
              select([element.id])
            }
          } else {
            const bounds = normalizeBounds(drag.startWorld, worldPoint)
            if (bounds.width < 2 && bounds.height < 2) break
            const element = createElement(activeTool, bounds)
            if (element) {
              pushSnapshot()
              addElement(element)
              select([element.id])
            }
          }
          setTool("select")
          break
        }

        case "marquee": {
          const bounds = normalizeBounds(drag.startWorld, worldPoint)
          const ids = getElementsInBounds(bounds, elements, elementOrder)
          if (ids.length > 0) {
            select(ids, e.shiftKey)
          }
          break
        }

        case "move":
        case "resize":
          break
      }

      markDirty()
    },
    [
      endDrag, getCanvasPoint, toWorld, activeTool, addElement,
      select, setTool, pushSnapshot, elements, elementOrder, markDirty, dragStateRef,
    ]
  )

  // A native listener (see DesignCanvas): React's onWheel is passive
  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top }

      if (e.ctrlKey || e.metaKey) {
        const delta = -e.deltaY * 0.01
        const newZoom = camera.zoom * (1 + delta)
        zoomToPoint(screenPoint, newZoom)
      } else {
        pan(-e.deltaX, -e.deltaY)
      }

      markDirty()
    },
    [camera.zoom, zoomToPoint, pan, markDirty]
  )

  return { onPointerDown, onPointerMove, onPointerUp, onWheel, activeHandle }
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
