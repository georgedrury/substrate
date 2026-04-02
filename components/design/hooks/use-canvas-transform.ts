"use client"

import { useCallback } from "react"
import type { Point, Camera } from "../types"
import { screenToWorld, worldToScreen, clamp } from "../lib/math"
import { useCanvas } from "../contexts/canvas-context"

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10

export function useCanvasTransform() {
  const { state, dispatch } = useCanvas()
  const { camera } = state

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
      dispatch({ type: "SET_CAMERA", camera: newCamera })
    },
    [camera, dispatch]
  )

  const pan = useCallback(
    (dx: number, dy: number) => {
      dispatch({
        type: "SET_CAMERA",
        camera: { x: camera.x + dx, y: camera.y + dy },
      })
    },
    [camera, dispatch]
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
    dispatch({ type: "SET_CAMERA", camera: { x: 0, y: 0, zoom: 1 } })
  }, [dispatch])

  return { camera, toWorld, toScreen, zoomToPoint, pan, zoomIn, zoomOut, resetZoom }
}
