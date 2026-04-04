/**
 * Grid snapping and smart edge snapping utilities for canvas surfaces.
 *
 * ```ts
 * // Basic grid snap
 * snapToGrid({ x: 37, y: 63 }, 10) // → { x: 40, y: 60 }
 *
 * // Snap with edge awareness
 * snapToGuides({ x: 102, y: 200 }, guides, { threshold: 5 })
 * ```
 */

import type { Point, Bounds } from "../types"

// ── Grid snapping ──

type SnapToGridOptions = {
	/** Offset the grid origin */
	origin?: Point
}

/**
 * Snap a point to the nearest grid intersection.
 */
function snapToGrid(point: Point, gridSize: number, options?: SnapToGridOptions): Point {
	const ox = options?.origin?.x ?? 0
	const oy = options?.origin?.y ?? 0
	return {
		x: Math.round((point.x - ox) / gridSize) * gridSize + ox,
		y: Math.round((point.y - oy) / gridSize) * gridSize + oy,
	}
}

/**
 * Snap a single value to the nearest grid line.
 */
function snapValueToGrid(value: number, gridSize: number, origin = 0): number {
	return Math.round((value - origin) / gridSize) * gridSize + origin
}

// ── Guide / edge snapping ──

type Guide = {
	/** Axis this guide sits on */
	axis: "x" | "y"
	/** Position of the guide line */
	value: number
}

type SnapToGuidesOptions = {
	/** Maximum pixel distance for a guide to attract (default: 5) */
	threshold?: number
}

type SnapResult = {
	/** The snapped point */
	point: Point
	/** Which guides were snapped to (empty if none) */
	snappedGuides: Guide[]
}

/**
 * Snap a point to nearby guide lines (smart edges, alignment lines, etc.).
 * Only snaps an axis if a guide is within the threshold.
 */
function snapToGuides(
	point: Point,
	guides: Guide[],
	options?: SnapToGuidesOptions,
): SnapResult {
	const threshold = options?.threshold ?? 5
	let x = point.x
	let y = point.y
	let bestDx = threshold + 1
	let bestDy = threshold + 1
	const snappedGuides: Guide[] = []

	for (const guide of guides) {
		if (guide.axis === "x") {
			const dx = Math.abs(point.x - guide.value)
			if (dx < bestDx) {
				bestDx = dx
				x = guide.value
			}
		} else {
			const dy = Math.abs(point.y - guide.value)
			if (dy < bestDy) {
				bestDy = dy
				y = guide.value
			}
		}
	}

	// Collect all guides that matched the best snap distance
	if (bestDx <= threshold) {
		for (const g of guides) {
			if (g.axis === "x" && Math.abs(point.x - g.value) === bestDx) snappedGuides.push(g)
		}
	} else {
		x = point.x
	}

	if (bestDy <= threshold) {
		for (const g of guides) {
			if (g.axis === "y" && Math.abs(point.y - g.value) === bestDy) snappedGuides.push(g)
		}
	} else {
		y = point.y
	}

	return { point: { x, y }, snappedGuides }
}

/**
 * Generate alignment guides from a set of bounds (edges + centres).
 * Useful for snapping elements to siblings.
 */
function guidesFromBounds(boundsList: Bounds[], exclude?: Bounds): Guide[] {
	const guides: Guide[] = []
	for (const b of boundsList) {
		if (b === exclude) continue
		guides.push(
			{ axis: "x", value: b.x },
			{ axis: "x", value: b.x + b.width / 2 },
			{ axis: "x", value: b.x + b.width },
			{ axis: "y", value: b.y },
			{ axis: "y", value: b.y + b.height / 2 },
			{ axis: "y", value: b.y + b.height },
		)
	}
	return guides
}

export {
	snapToGrid,
	snapValueToGrid,
	snapToGuides,
	guidesFromBounds,
	type Guide,
	type SnapToGridOptions,
	type SnapToGuidesOptions,
	type SnapResult,
}
