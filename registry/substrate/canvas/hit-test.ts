import type {
  Point,
  Bounds,
  DesignElement,
  Handle,
} from "@/lib/substrate/types"
import {
  rotatePoint,
  boundsCenter,
  pointInBounds,
  pointInEllipseBounds,
  rotatedBounds,
  handleLocalPosition,
  HANDLE_SIZE,
  HANDLES,
} from "@/lib/substrate/math"

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

    // Overlap with the rotated element's bounding box
    const box = rotatedBounds(el, el.rotation)
    if (
      box.x < bounds.x + bounds.width &&
      box.x + box.width > bounds.x &&
      box.y < bounds.y + bounds.height &&
      box.y + box.height > bounds.y
    ) {
      result.push(id)
    }
  }
  return result
}

/**
 * Which handle is under `point`. `elementBounds` and `point` share a space
 * (screen space, in practice) and the bounds are rotated about their centre by
 * `rotation`. Resize handles win over the rotate handle if they ever overlap.
 */
export function getHandleAtPoint(
  point: Point,
  elementBounds: Bounds,
  _zoom: number,
  rotation = 0,
): Handle | null {
  const half = HANDLE_SIZE / 2 + 2 // add padding for easier grabbing
  // Handles are drawn in the element's rotated frame, so test in that frame
  const local = rotation === 0 ? point : rotatePoint(point, boundsCenter(elementBounds), -rotation)

  const candidates: Handle[] = [...HANDLES, "rotate"]
  for (const handle of candidates) {
    const at = handleLocalPosition(handle, elementBounds)
    if (Math.abs(local.x - at.x) <= half && Math.abs(local.y - at.y) <= half) {
      return handle
    }
  }

  return null
}
