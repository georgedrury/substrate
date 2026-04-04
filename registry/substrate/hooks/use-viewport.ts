"use client"

import { useState, useCallback, useRef } from "react"

type Viewport = {
	x: number
	y: number
	zoom: number
}

type UseViewportOptions = {
	initial?: Partial<Viewport>
	minZoom?: number
	maxZoom?: number
	zoomFactor?: number
}

function useViewport({
	initial,
	minZoom = 0.1,
	maxZoom = 10,
	zoomFactor = 1.2,
}: UseViewportOptions = {}) {
	const [viewport, setViewport] = useState<Viewport>({
		x: initial?.x ?? 0,
		y: initial?.y ?? 0,
		zoom: initial?.zoom ?? 1,
	})

	const viewportRef = useRef(viewport)
	viewportRef.current = viewport

	const clampZoom = useCallback(
		(z: number) => Math.min(maxZoom, Math.max(minZoom, z)),
		[minZoom, maxZoom],
	)

	// ── Coordinate transforms ──

	const toWorld = useCallback(
		(screenX: number, screenY: number) => ({
			x: (screenX - viewportRef.current.x) / viewportRef.current.zoom,
			y: (screenY - viewportRef.current.y) / viewportRef.current.zoom,
		}),
		[],
	)

	const toScreen = useCallback(
		(worldX: number, worldY: number) => ({
			x: worldX * viewportRef.current.zoom + viewportRef.current.x,
			y: worldY * viewportRef.current.zoom + viewportRef.current.y,
		}),
		[],
	)

	// ── Pan ──

	const pan = useCallback((dx: number, dy: number) => {
		setViewport((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
	}, [])

	// ── Zoom ──

	const zoomToPoint = useCallback(
		(screenX: number, screenY: number, newZoom: number) => {
			const clamped = clampZoom(newZoom)
			const v = viewportRef.current
			// Keep the world point under the cursor stationary
			const worldX = (screenX - v.x) / v.zoom
			const worldY = (screenY - v.y) / v.zoom
			setViewport({
				x: screenX - worldX * clamped,
				y: screenY - worldY * clamped,
				zoom: clamped,
			})
		},
		[clampZoom],
	)

	const zoomIn = useCallback(
		(screenX?: number, screenY?: number) => {
			const cx = screenX ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 0)
			const cy = screenY ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 0)
			zoomToPoint(cx, cy, viewportRef.current.zoom * zoomFactor)
		},
		[zoomFactor, zoomToPoint],
	)

	const zoomOut = useCallback(
		(screenX?: number, screenY?: number) => {
			const cx = screenX ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 0)
			const cy = screenY ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 0)
			zoomToPoint(cx, cy, viewportRef.current.zoom / zoomFactor)
		},
		[zoomFactor, zoomToPoint],
	)

	const resetZoom = useCallback(() => {
		setViewport({ x: 0, y: 0, zoom: 1 })
	}, [])

	// ── Zoom to fit a bounding box ──

	const zoomToFit = useCallback(
		(bounds: { x: number; y: number; width: number; height: number }, padding = 40) => {
			if (typeof window === "undefined") return
			const viewWidth = window.innerWidth - padding * 2
			const viewHeight = window.innerHeight - padding * 2
			if (bounds.width === 0 || bounds.height === 0) return

			const zoom = clampZoom(Math.min(viewWidth / bounds.width, viewHeight / bounds.height))
			const cx = bounds.x + bounds.width / 2
			const cy = bounds.y + bounds.height / 2

			setViewport({
				x: window.innerWidth / 2 - cx * zoom,
				y: window.innerHeight / 2 - cy * zoom,
				zoom,
			})
		},
		[clampZoom],
	)

	// ── Wheel handler (attach to your container) ──

	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			e.preventDefault()
			if (e.ctrlKey || e.metaKey) {
				// Pinch zoom
				const delta = -e.deltaY * 0.01
				const newZoom = viewportRef.current.zoom * (1 + delta)
				zoomToPoint(e.clientX, e.clientY, newZoom)
			} else {
				// Pan
				pan(-e.deltaX, -e.deltaY)
			}
		},
		[pan, zoomToPoint],
	)

	return {
		viewport,
		setViewport,
		toWorld,
		toScreen,
		pan,
		zoomToPoint,
		zoomIn,
		zoomOut,
		resetZoom,
		zoomToFit,
		handleWheel,
	}
}

export { useViewport, type Viewport, type UseViewportOptions }
