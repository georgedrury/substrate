import type { Point, Bounds, Camera, Handle, HandlePosition } from "@/lib/substrate/types"

export function rotatePoint(point: Point, center: Point, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = point.x - center.x
  const dy = point.y - center.y
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

export function boundsCenter(bounds: Bounds): Point {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }
}

export function pointInBounds(point: Point, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

export function pointInEllipseBounds(point: Point, bounds: Bounds): boolean {
  const cx = bounds.x + bounds.width / 2
  const cy = bounds.y + bounds.height / 2
  const rx = bounds.width / 2
  const ry = bounds.height / 2
  if (rx === 0 || ry === 0) return false
  const dx = (point.x - cx) / rx
  const dy = (point.y - cy) / ry
  return dx * dx + dy * dy <= 1
}

export function boundsOverlap(a: Bounds, b: Bounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function normalizeBounds(start: Point, end: Point): Bounds {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

export function screenToWorld(screenPoint: Point, camera: Camera): Point {
  return {
    x: (screenPoint.x - camera.x) / camera.zoom,
    y: (screenPoint.y - camera.y) / camera.zoom,
  }
}

export function worldToScreen(worldPoint: Point, camera: Camera): Point {
  return {
    x: worldPoint.x * camera.zoom + camera.x,
    y: worldPoint.y * camera.zoom + camera.y,
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

// ── Rotation ──
//
// Angles are in degrees, positive clockwise on screen (y points down), the
// same convention as an element's `rotation` and the canvas `rotate()` call.

/** Angle of the line from `from` to `to`, in degrees */
export function angleBetween(from: Point, to: Point): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
}

/** Wrap an angle into [-180, 180) so rotations stay small numbers */
export function normalizeAngle(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180
}

export function snapAngle(deg: number, step = 15): number {
  return Math.round(deg / step) * step
}

/** The four corners of a bounds rotated about its centre, clockwise from top left */
export function rotatedCorners(bounds: Bounds, rotation: number): Point[] {
  const center = boundsCenter(bounds)
  return [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ].map((corner) => (rotation === 0 ? corner : rotatePoint(corner, center, rotation)))
}

/** The axis-aligned box that contains a bounds once it is rotated */
export function rotatedBounds(bounds: Bounds, rotation: number): Bounds {
  if (rotation === 0) return bounds
  const corners = rotatedCorners(bounds, rotation)
  const xs = corners.map((c) => c.x)
  const ys = corners.map((c) => c.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

// ── Selection handles ──

export const HANDLE_SIZE = 8
/** How far the rotate handle floats above the top edge, in screen pixels */
export const ROTATE_HANDLE_OFFSET = 24

export const HANDLES: HandlePosition[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]

const OPPOSITE: Record<HandlePosition, HandlePosition> = {
  nw: "se",
  n: "s",
  ne: "sw",
  e: "w",
  se: "nw",
  s: "n",
  sw: "ne",
  w: "e",
}

/**
 * Where a handle sits on a bounds, before rotation. The rotate handle floats
 * `rotateOffset` above the top edge: pass screen bounds with the default offset,
 * or world bounds with the offset converted to world units.
 */
export function handleLocalPosition(
  handle: Handle,
  bounds: Bounds,
  rotateOffset = ROTATE_HANDLE_OFFSET,
): Point {
  const { x, y, width, height } = bounds
  switch (handle) {
    case "nw": return { x, y }
    case "n": return { x: x + width / 2, y }
    case "ne": return { x: x + width, y }
    case "e": return { x: x + width, y: y + height / 2 }
    case "se": return { x: x + width, y: y + height }
    case "s": return { x: x + width / 2, y: y + height }
    case "sw": return { x, y: y + height }
    case "w": return { x, y: y + height / 2 }
    case "rotate": return { x: x + width / 2, y: y - rotateOffset }
  }
}

/** Where a handle is once the bounds are rotated about their centre */
export function handlePosition(
  handle: Handle,
  bounds: Bounds,
  rotation = 0,
  rotateOffset = ROTATE_HANDLE_OFFSET,
): Point {
  const local = handleLocalPosition(handle, bounds, rotateOffset)
  return rotation === 0 ? local : rotatePoint(local, boundsCenter(bounds), rotation)
}

/**
 * Resize a bounds by dragging one handle by `delta` (world units). The handle
 * opposite the one being dragged stays where it is, also when the bounds are
 * rotated: the drag is measured along the rotated axes, then the box is moved
 * so the opposite handle is back in place.
 */
export function resizeBounds(
  start: Bounds,
  handle: HandlePosition,
  delta: Point,
  rotation = 0,
): Bounds {
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  // The drag, expressed along the element's own axes
  const dx = delta.x * cos + delta.y * sin
  const dy = -delta.x * sin + delta.y * cos

  let { x, y, width, height } = start
  switch (handle) {
    case "nw": x += dx; y += dy; width -= dx; height -= dy; break
    case "n": y += dy; height -= dy; break
    case "ne": y += dy; width += dx; height -= dy; break
    case "e": width += dx; break
    case "se": width += dx; height += dy; break
    case "s": height += dy; break
    case "sw": x += dx; width -= dx; height += dy; break
    case "w": x += dx; width -= dx; break
  }

  // Never collapse below 1 unit: the dragged edge stops and the far edge stays.
  // Only a dragged left or top edge moves x or y; the others just stop growing.
  if (width < 1) {
    if (handle.includes("w")) x = start.x + start.width - 1
    width = 1
  }
  if (height < 1) {
    if (handle.includes("n")) y = start.y + start.height - 1
    height = 1
  }

  const next: Bounds = { x, y, width, height }
  if (rotation === 0) return next

  const anchor = OPPOSITE[handle]
  const anchorBefore = handlePosition(anchor, start, rotation)
  const anchorLocalAfter = handleLocalPosition(anchor, next)
  const centreAfter = boundsCenter(next)
  // From the fixed handle to the new centre, turned into world space
  const ox = centreAfter.x - anchorLocalAfter.x
  const oy = centreAfter.y - anchorLocalAfter.y
  const centre = {
    x: anchorBefore.x + ox * cos - oy * sin,
    y: anchorBefore.y + ox * sin + oy * cos,
  }
  return { x: centre.x - width / 2, y: centre.y - height / 2, width, height }
}
