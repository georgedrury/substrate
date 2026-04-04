---
name: substrate-canvas
description: "Spatial hooks and utilities for Substrate canvas surfaces: viewport (pan/zoom), selection, drag reorder, snapping, bounding box, coordinate maths, and hit testing. Use when building or extending a 2D/3D spatial surface. Triggers on: viewport, pan, zoom, snap to grid, bounding box, hit test, coordinate transform, canvas interaction, spatial, drag."
user-invocable: true
---

# Substrate canvas

Canvas utilities handle everything spatial – viewport transforms, coordinate systems, snapping, bounding box computation, and hit testing. These are the building blocks for any surface where users interact with positioned objects.

## When to use this skill

Use the canvas skill when you need to:

- Add pan/zoom to a surface
- Implement snap-to-grid or smart edge snapping
- Compute bounding boxes for selection or zoom-to-fit
- Convert between screen and world coordinates
- Build or extend hit testing
- Add spatial selection (click, shift-click, marquee)

For the app shell around the surface, see **substrate-scaffold**.
For non-spatial interaction (undo, clipboard, shortcuts), see **substrate-interaction**.

---

## Hooks

### useViewport

`registry/substrate/hooks/use-viewport.ts`

Generic pan/zoom state. Surface-agnostic – works for 2D canvas, node editors, or any pannable area.

**Returns**: `viewport` (x, y, zoom), `toWorld`, `toScreen`, `pan`, `zoomToPoint`, `zoomIn`, `zoomOut`, `resetZoom`, `zoomToFit`, `handleWheel`

**When to use**: Any surface that needs panning and zooming. Wire `handleWheel` to the container's `onWheel`, use `toWorld`/`toScreen` for coordinate transforms.

**Connects to**: `ZoomControls` (substrate-scaffold) reads `viewport.zoom` and calls `zoomIn`/`zoomOut`/`resetZoom`.

```tsx
const { viewport, handleWheel, zoomToFit } = useViewport({
  minZoom: 0.1,
  maxZoom: 10,
})
```

---

### useSelection

`registry/substrate/hooks/use-selection.ts`

Multi-select with modifier key support: plain click, ⌘-click toggle, shift-click range.

**Returns**: `selectedIds`, `select`, `setSelection`, `selectAll`, `deselectAll`, `isSelected`

**When to use**: Layer lists, node selections, element picking – any context where the user selects from a list or spatial layout.

**Connects to**: `LayerList` and `TreeList` (substrate-interaction) for list-based selection. Canvas hit-testing for spatial selection.

---

### useDragReorder

`registry/substrate/hooks/use-drag-reorder.ts`

Pointer-based list reordering using pointer capture. Calculates drop index from drag distance.

**Returns**: `getDragItemProps`, `dragIndex`, `dropIndex`, `isDragging`

**When to use**: Reorderable layer lists, timeline tracks, node port ordering.

**Connects to**: `LayerList` (substrate-interaction) for visual layer reordering.

---

### Canvas-specific hooks

These hooks are tightly coupled to the 2D canvas surface and its stores:

| Hook | File | Purpose |
| --- | --- | --- |
| `useCanvasTransform` | `hooks/use-canvas-transform.ts` | Screen ↔ world coordinate conversion using `document-store` camera |
| `useCanvasRenderer` | `hooks/use-canvas-renderer.ts` | Canvas 2D rendering loop with dirty flag and rAF |
| `useCanvasDrag` | `hooks/use-canvas-drag.ts` | Pointer-based drag tracking (start/move/end) |
| `useCanvasInteraction` | `hooks/use-canvas-interaction.ts` | Orchestrates tool-specific behaviour (select, create, pan) |
| `useHitTest` | `hooks/use-hit-test.ts` | Point-in-element and handle hit detection |
| `useKeyboardShortcuts` | `hooks/use-keyboard-shortcuts.ts` | Canvas-specific keyboard bindings |

These are typically used together inside a `DesignCanvas` or similar surface component. See **substrate-surfaces** for how they compose.

---

## Utilities

### snapToGrid / snapToGuides

`registry/substrate/lib/snap.ts`

Grid snapping and smart edge snapping.

| Function | Purpose |
| --- | --- |
| `snapToGrid(point, gridSize, options?)` | Snap a point to nearest grid intersection |
| `snapValueToGrid(value, gridSize, origin?)` | Snap a single number to grid |
| `snapToGuides(point, guides, options?)` | Snap to nearby guide lines (edges, centres) within a threshold |
| `guidesFromBounds(boundsList, exclude?)` | Generate alignment guides from sibling element bounds |

**When to use**: Object placement and resizing. Call `snapToGrid` during move/resize interactions. Use `guidesFromBounds` + `snapToGuides` for Figma-style smart alignment lines.

```ts
// During element drag
const guides = guidesFromBounds(siblingBounds, draggedBounds)
const { point, snappedGuides } = snapToGuides(newPosition, guides)
// Render snappedGuides as alignment lines
```

---

### boundingBox

`registry/substrate/lib/bounding-box.ts`

Bounding box computation and spatial queries.

| Function | Purpose |
| --- | --- |
| `boundingBox(items)` | Union bounds of multiple Bounds |
| `boundingBoxFromPoints(points)` | Bounds from an array of Points |
| `expandBounds(bounds, padding)` | Expand uniformly |
| `expandBoundsBy(bounds, { top, right, bottom, left })` | Expand per-side |
| `containsPoint(bounds, point)` | Point-in-bounds test |
| `containsBounds(a, b)` | Does A fully contain B? |
| `boundsCenter(bounds)` | Centre point |
| `intersectBounds(a, b)` | Intersection or null |

**When to use**: Zoom-to-fit (compute union bounds → pass to `useViewport.zoomToFit`), marquee selection (test which elements intersect the selection rectangle), alignment distribution.

---

### math

`registry/substrate/lib/math.ts`

Core geometry functions.

| Function | Purpose |
| --- | --- |
| `rotatePoint(point, center, angleDeg)` | Rotate a point around a centre |
| `boundsCenter(bounds)` | Centre of a bounding box |
| `pointInBounds(point, bounds)` | Hit test |
| `pointInEllipseBounds(point, bounds)` | Ellipse hit test |
| `boundsOverlap(a, b)` | Overlap test |
| `normalizeBounds(start, end)` | Normalise a drag rectangle |
| `screenToWorld(point, camera)` / `worldToScreen(point, camera)` | Coordinate transforms |
| `clamp(value, min, max)` | Numeric clamp |
| `distance(a, b)` | Euclidean distance |

---

## Stores

### document-store

`registry/substrate/stores/document-store.ts`

Central store for the 2D canvas surface – elements, selection, camera, history.

### tool-store

`registry/substrate/stores/tool-store.ts`

Active tool state. Read by both the surface (to change interaction mode) and the toolbar (to highlight the active tool).

---

## Recommended patterns

### Adding snap-to-grid to an existing surface

1. Import `snapToGrid` from `lib/snap`
2. In your drag handler, snap the position before applying it:
   ```ts
   const snapped = snapToGrid(worldPosition, gridSize)
   updateElement(id, { x: snapped.x, y: snapped.y })
   ```
3. Optionally add a `Toggle` in the toolbar for enabling/disabling snap

### Zoom-to-fit selection

```ts
const selected = elements.filter((el) => selectedIds.has(el.id))
const bounds = boundingBox(selected)
if (bounds) zoomToFit(expandBounds(bounds, 40))
```

### Smart alignment snapping

```ts
const siblings = elements.filter((el) => !selectedIds.has(el.id))
const guides = guidesFromBounds(siblings.map(toBounds))
const { point, snappedGuides } = snapToGuides(dragPos, guides, { threshold: 5 })
// Render snappedGuides as thin blue lines
```

---

## Cross-references

| Need | Skill |
| --- | --- |
| Zoom controls and status bar | **substrate-scaffold** |
| Layer list, tree list for structure panels | **substrate-interaction** |
| Controls inside property panes | **substrate-controls** |
| Surface architecture and rendering | **substrate-surfaces** |
| Node editor specifics | **substrate-nodes** |
