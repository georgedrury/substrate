"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDocumentStore } from "../stores/document-store"
import { useToolStore } from "../stores/tool-store"
import {
	renderGrid,
	renderElement,
	renderSelectionBox,
	renderResizeHandles,
	renderCreationPreview,
	renderMarquee,
} from "../canvas/renderer"
import { worldToScreen } from "../lib/math"
import type { Point, Bounds } from "../types"

interface DragState {
	isDragging: boolean
	dragStart: Point | null
	dragCurrent: Point | null
	dragType: "create" | "marquee" | null
}

export function useCanvasRenderer(
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	containerRef: React.RefObject<HTMLDivElement | null>,
) {
	const elements = useDocumentStore((s) => s.elements)
	const elementOrder = useDocumentStore((s) => s.elementOrder)
	const camera = useDocumentStore((s) => s.camera)
	const showGrid = useDocumentStore((s) => s.showGrid)
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const activeTool = useToolStore((s) => s.activeTool)
	const dirtyRef = useRef(true)
	const dragStateRef = useRef<DragState>({
		isDragging: false,
		dragStart: null,
		dragCurrent: null,
		dragType: null,
	})

	const markDirty = useCallback(() => {
		dirtyRef.current = true
	}, [])

	// Mark dirty when state changes
	useEffect(() => {
		dirtyRef.current = true
	}, [elements, elementOrder, camera, showGrid, selectedIds])

	// Handle resize
	useEffect(() => {
		const canvas = canvasRef.current
		const container = containerRef.current
		if (!canvas || !container) return

		const observer = new ResizeObserver(() => {
			const dpr = window.devicePixelRatio || 1
			const rect = container.getBoundingClientRect()
			canvas.width = rect.width * dpr
			canvas.height = rect.height * dpr
			canvas.style.width = `${rect.width}px`
			canvas.style.height = `${rect.height}px`
			dirtyRef.current = true
		})

		observer.observe(container)
		return () => observer.disconnect()
	}, [canvasRef, containerRef])

	// Render loop
	useEffect(() => {
		let rafId: number

		function render() {
			rafId = requestAnimationFrame(render)

			if (!dirtyRef.current) return
			dirtyRef.current = false

			const canvas = canvasRef.current
			if (!canvas) return
			const ctx = canvas.getContext("2d")
			if (!ctx) return

			const dpr = window.devicePixelRatio || 1
			const width = canvas.width / dpr
			const height = canvas.height / dpr

			// Clear
			ctx.save()
			ctx.scale(dpr, dpr)
			ctx.clearRect(0, 0, width, height)
			ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--canvas").trim() || "oklch(0.97 0 0)"
			ctx.fillRect(0, 0, width, height)

			// Camera transform
			ctx.save()
			ctx.translate(camera.x, camera.y)
			ctx.scale(camera.zoom, camera.zoom)

			// Grid
			if (showGrid) {
				const canvasFg = getComputedStyle(canvas).getPropertyValue("--canvas-foreground").trim() || undefined
				renderGrid(ctx, camera, width, height, canvasFg)
			}

			// Elements
			for (const id of elementOrder) {
				const el = elements[id]
				if (el) renderElement(ctx, el)
			}

			// Creation preview (in world space)
			const drag = dragStateRef.current
			if (
				drag.isDragging &&
				drag.dragStart &&
				drag.dragCurrent &&
				drag.dragType === "create"
			) {
				renderCreationPreview(ctx, activeTool, drag.dragStart, drag.dragCurrent)
			}

			ctx.restore() // Back to screen space

			// Selection UI (screen space)
			for (const id of selectedIds) {
				const el = elements[id]
				if (!el) continue
				const topLeft = worldToScreen({ x: el.x, y: el.y }, camera)
				const screenBounds: Bounds = {
					x: topLeft.x,
					y: topLeft.y,
					width: el.width * camera.zoom,
					height: el.height * camera.zoom,
				}
				renderSelectionBox(ctx, screenBounds, camera.zoom)
				renderResizeHandles(ctx, screenBounds, camera.zoom)
			}

			// Marquee selection (screen space)
			if (
				drag.isDragging &&
				drag.dragStart &&
				drag.dragCurrent &&
				drag.dragType === "marquee"
			) {
				const screenStart = worldToScreen(drag.dragStart, camera)
				const screenEnd = worldToScreen(drag.dragCurrent, camera)
				const marqueeBounds: Bounds = {
					x: Math.min(screenStart.x, screenEnd.x),
					y: Math.min(screenStart.y, screenEnd.y),
					width: Math.abs(screenEnd.x - screenStart.x),
					height: Math.abs(screenEnd.y - screenStart.y),
				}
				renderMarquee(ctx, marqueeBounds)
			}

			ctx.restore() // dpr scale
		}

		rafId = requestAnimationFrame(render)
		return () => cancelAnimationFrame(rafId)
	}, [
		canvasRef,
		elements,
		elementOrder,
		camera,
		showGrid,
		selectedIds,
		activeTool,
	])

	return { markDirty, dragStateRef }
}
