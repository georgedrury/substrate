"use client"

import { useCallback } from "react"
import type { Point, Camera } from "../types"
import { screenToWorld, worldToScreen, clamp } from "../lib/math"
import { useDocumentStore } from "../stores/document-store"

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10

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

  const zoomIn = useCallback(() => {
    zoomToPoint(
      { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      camera.zoom * 1.2
    )
  }, [camera.zoom, zoomToPoint])

  const zoomOut = useCallback(() => {
    zoomToPoint(
      { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      camera.zoom / 1.2
    )
  }, [camera.zoom, zoomToPoint])

  const resetZoom = useCallback(() => {
    setCamera({ x: 0, y: 0, zoom: 1 })
  }, [setCamera])

  return { camera, toWorld, toScreen, zoomToPoint, pan, zoomIn, zoomOut, resetZoom }
}
