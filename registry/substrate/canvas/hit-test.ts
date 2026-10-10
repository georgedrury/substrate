import type {
  Point,
  Bounds,
  DesignElement,
  HandlePosition,
} from "@/lib/substrate/types"
import { rotatePoint, boundsCenter, pointInBounds, pointInEllipseBounds } from "@/lib/substrate/math"

const HANDLE_SIZE = 8

function unrotatePoint(point: Point, el: DesignElement): Point {
  if (el.rotation === 0) return point
  const center = boundsCenter(el)
  return rotatePoint(point, center, -el.rotation)
}

export function pointInElement(point: Point, el: DesignElement): boolean {
  if (!el.visible || el.locked) return false

  const local = unrotatePoint(point, el)
  const bounds: Bounds = { x: el.x, y: el.y, width: el.width, height: el.height }

  switch (el.type) {
    case "ellipse":
      return pointInEllipseBounds(local, bounds)
    case "line": {
      const dx = el.width
      const dy = el.height
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len === 0) return false
      const t =
        ((local.x - el.x) * dx + (local.y - el.y) * dy) / (len * len)
      const clamped = Math.max(0, Math.min(1, t))
      const projX = el.x + clamped * dx
      const projY = el.y + clamped * dy
      const dist = Math.sqrt(
        (local.x - projX) ** 2 + (local.y - projY) ** 2
      )
      return dist <= Math.max(el.stroke?.width ?? 2, 4)
    }
    default:
      return pointInBounds(local, bounds)
  }
}

export function getElementAtPoint(
  point: Point,
  elements: Record<string, DesignElement>,
  elementOrder: string[]
): string | null {
  // Check in reverse order (topmost first)
  for (let i = elementOrder.length - 1; i >= 0; i--) {
    const id = elementOrder[i]
    const el = elements[id]
    if (el && pointInElement(point, el)) {
      return id
    }
  }
  return null
}

export function getElementsInBounds(
  bounds: Bounds,
  elements: Record<string, DesignElement>,
  elementOrder: string[]
): string[] {
  const result: string[] = []
  for (const id of elementOrder) {
    const el = elements[id]
    if (!el || !el.visible || el.locked) continue

    // Simple overlap check (ignoring rotation for marquee selection)
    if (
      el.x < bounds.x + bounds.width &&
      el.x + el.width > bounds.x &&
      el.y < bounds.y + bounds.height &&
      el.y + el.height > bounds.y
    ) {
      result.push(id)
    }
  }
  return result
}

export function getHandleAtPoint(
  point: Point,
  elementBounds: Bounds,
  _zoom: number
): HandlePosition | null {
  const half = HANDLE_SIZE / 2 + 2 // add padding for easier grabbing
  const b = elementBounds

  const handles: { pos: HandlePosition; x: number; y: number }[] = [
    { pos: "nw", x: b.x, y: b.y },
    { pos: "n", x: b.x + b.width / 2, y: b.y },
    { pos: "ne", x: b.x + b.width, y: b.y },
    { pos: "e", x: b.x + b.width, y: b.y + b.height / 2 },
    { pos: "se", x: b.x + b.width, y: b.y + b.height },
    { pos: "s", x: b.x + b.width / 2, y: b.y + b.height },
    { pos: "sw", x: b.x, y: b.y + b.height },
    { pos: "w", x: b.x, y: b.y + b.height / 2 },
  ]

  for (const handle of handles) {
    if (
      Math.abs(point.x - handle.x) <= half &&
      Math.abs(point.y - handle.y) <= half
    ) {
      return handle.pos
    }
  }

  return null
}
