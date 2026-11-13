"use client"

import { useCallback } from "react"
import type { Point, Camera } from "@/lib/substrate/types"
import { screenToWorld, worldToScreen, clamp } from "@/lib/substrate/math"
import { boundingBox } from "@/lib/substrate/bounding-box"
import { useDocumentStore } from "@/stores/substrate/document-store"

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10

const FIT_PADDING = 64

// Zooming "to the centre" means the centre of the canvas, not the window: side
// panels would otherwise pull the view sideways on every step. Screen points
// here are relative to the canvas element, which DesignCanvas marks with
// data-slot="design-canvas".
function canvasSize(): { width: number; height: number } {
  const canvas = document.querySelector<HTMLElement>('[data-slot="design-canvas"]')
  const rect = canvas?.getBoundingClientRect()
  return rect && rect.width > 0
    ? { width: rect.width, height: rect.height }
    : { width: window.innerWidth, height: window.innerHeight }
}

export function useCanvasTransform() {
  const camera = useDocumentStore((s) => s.camera)
  const setCamera = useDocumentStore((s) => s.setCamera)

  const toWorld = useCallback(
    (screenPoint: Point): Point => screenToWorld(screenPoint, camera),
    [camera]
  )

  const toScreen = useCallback(
    (worldPoint: Point): Point => worldToScreen(worldPoint, camera),
    [camera]
  )

  const zoomToPoint = useCallback(
    (screenPoint: Point, newZoom: number) => {
      const clamped = clamp(newZoom, MIN_ZOOM, MAX_ZOOM)
      const worldBefore = screenToWorld(screenPoint, camera)
      const newCamera: Camera = {
        x: screenPoint.x - worldBefore.x * clamped,
        y: screenPoint.y - worldBefore.y * clamped,
        zoom: clamped,
      }
      setCamera(newCamera)
    },
    [camera, setCamera]
  )

  const pan = useCallback(
    (dx: number, dy: number) => {
      setCamera({ x: camera.x + dx, y: camera.y + dy })
    },
    [camera, setCamera]
  )

  // Zoom around the middle of the canvas, as zoom buttons and +/- keys expect
  const setZoom = useCallback(
    (zoom: number) => {
      const { width, height } = canvasSize()
      zoomToPoint({ x: width / 2, y: height / 2 }, zoom)
    },
    [zoomToPoint]
  )

  const zoomIn = useCallback(() => setZoom(camera.zoom * 1.2), [camera.zoom, setZoom])

  const zoomOut = useCallback(() => setZoom(camera.zoom / 1.2), [camera.zoom, setZoom])

  const resetZoom = useCallback(() => {
    setCamera({ x: 0, y: 0, zoom: 1 })
  }, [setCamera])

  // Frame every visible element in the canvas, or go back to 1:1 on an empty board
  const zoomToFit = useCallback(() => {
    const { elements, elementOrder } = useDocumentStore.getState()
    const visible = elementOrder.map((id) => elements[id]).filter((el) => el && el.visible)
    const bounds = boundingBox(visible)
    if (!bounds) {
      setCamera({ x: 0, y: 0, zoom: 1 })
      return
    }
    const { width, height } = canvasSize()
    const zoom = clamp(
      Math.min(
        (width - FIT_PADDING * 2) / Math.max(bounds.width, 1),
        (height - FIT_PADDING * 2) / Math.max(bounds.height, 1),
      ),
      MIN_ZOOM,
      MAX_ZOOM,
    )
    setCamera({
      zoom,
      x: width / 2 - (bounds.x + bounds.width / 2) * zoom,
      y: height / 2 - (bounds.y + bounds.height / 2) * zoom,
    })
  }, [setCamera])

  return { camera, toWorld, toScreen, zoomToPoint, pan, setZoom, zoomIn, zoomOut, zoomToFit, resetZoom }
}
