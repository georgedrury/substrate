/**
 * Bounding box computation utilities.
 *
 * ```ts
 * const union = boundingBox([rectA, rectB, ellipse])
 * // → { x, y, width, height } enclosing all elements
 *
 * expandBounds(union, 20) // add 20px padding on each side
 * ```
 */

import type { Bounds, Point } from "../types"

/**
 * Compute the union bounding box of multiple bounds.
 * Returns null if the array is empty.
 */
function boundingBox(items: Bounds[]): Bounds | null {
	if (items.length === 0) return null

	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity

	for (const b of items) {
		minX = Math.min(minX, b.x)
		minY = Math.min(minY, b.y)
		maxX = Math.max(maxX, b.x + b.width)
		maxY = Math.max(maxY, b.y + b.height)
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
	}
}

/**
 * Compute the bounding box from an array of points.
 * Returns null if the array is empty.
 */
function boundingBoxFromPoints(points: Point[]): Bounds | null {
	if (points.length === 0) return null

	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity

	for (const p of points) {
		minX = Math.min(minX, p.x)
		minY = Math.min(minY, p.y)
		maxX = Math.max(maxX, p.x)
		maxY = Math.max(maxY, p.y)
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
	}
}

/**
 * Expand (or contract) a bounding box by a given amount on each side.
 * Negative padding contracts.
 */
function expandBounds(bounds: Bounds, padding: number): Bounds {
	return {
		x: bounds.x - padding,
		y: bounds.y - padding,
		width: bounds.width + padding * 2,
		height: bounds.height + padding * 2,
	}
}

/**
 * Expand a bounding box with independent padding per side.
 */
function expandBoundsBy(
	bounds: Bounds,
	padding: { top?: number; right?: number; bottom?: number; left?: number },
): Bounds {
	const t = padding.top ?? 0
	const r = padding.right ?? 0
	const b = padding.bottom ?? 0
	const l = padding.left ?? 0
	return {
		x: bounds.x - l,
		y: bounds.y - t,
		width: bounds.width + l + r,
		height: bounds.height + t + b,
	}
}

/**
 * Check whether a point lies inside a bounding box.
 */
function containsPoint(bounds: Bounds, point: Point): boolean {
	return (
		point.x >= bounds.x &&
		point.x <= bounds.x + bounds.width &&
		point.y >= bounds.y &&
		point.y <= bounds.y + bounds.height
	)
}

/**
 * Check whether bounds A fully contains bounds B.
 */
function containsBounds(a: Bounds, b: Bounds): boolean {
	return (
		b.x >= a.x &&
		b.y >= a.y &&
		b.x + b.width <= a.x + a.width &&
		b.y + b.height <= a.y + a.height
	)
}

/**
 * Get the centre point of a bounding box.
 */
function boundsCenter(bounds: Bounds): Point {
	return {
		x: bounds.x + bounds.width / 2,
		y: bounds.y + bounds.height / 2,
	}
}

/**
 * Compute the intersection of two bounds. Returns null if they don't overlap.
 */
function intersectBounds(a: Bounds, b: Bounds): Bounds | null {
	const x = Math.max(a.x, b.x)
	const y = Math.max(a.y, b.y)
	const right = Math.min(a.x + a.width, b.x + b.width)
	const bottom = Math.min(a.y + a.height, b.y + b.height)

	if (right <= x || bottom <= y) return null

	return { x, y, width: right - x, height: bottom - y }
}

export {
	boundingBox,
	boundingBoxFromPoints,
	expandBounds,
	expandBoundsBy,
	containsPoint,
	containsBounds,
	boundsCenter,
	intersectBounds,
}
