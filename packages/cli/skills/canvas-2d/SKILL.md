---
name: canvas-2d
description: "Build spatial 2D tools with Substrate — shape editors, diagram builders, whiteboards, and Figma-like design surfaces using the DesignCanvas component. Use when the app involves objects on an infinite pannable/zoomable plane. Triggers on: canvas, 2D, design canvas, shape editor, diagram, whiteboard, map builder, pan, zoom, infinite canvas, Figma-like, flat shapes."
user-invocable: true
---

# 2D canvas

Guide to building spatial 2D tools with Substrate — shape editors, diagram builders, whiteboard apps, and Figma-like design surfaces.

## When to use this surface

Use a 2D canvas when the app involves objects on an infinite pannable/zoomable plane: design tools, diagram editors, whiteboard apps, map builders, node graphs, or any tool where users place, select, and manipulate flat shapes and elements.

## Surface setup

This is Substrate's default surface. The `DesignCanvas` component provides a full 2D rendering pipeline out of the box.

### Install

```bash
npx substrate-kit add design-canvas
```

This pulls in the canvas renderer, hit-test system, interaction hooks, transform utilities, and all required stores.

### Mount

```tsx
import { DesignCanvas } from "@/components/substrate/design-canvas"

export default function PlaygroundPage() {
	return (
		<div className="h-screen w-screen bg-canvas">
			<DesignCanvas />
		</div>
	)
}
```

## Architecture

The 2D canvas uses a layered pipeline:

```
Pure renderer functions (canvas/renderer.ts)
  → useCanvasRenderer (rAF loop with dirty flag)
    → useCanvasInteraction (state machine for pointer events)
      → useCanvasDrag (ref-based drag tracking, no re-renders)
        → useCanvasTransform (screen ↔ world coordinate conversion)
          → useHitTest (spatial queries)
            → useDocumentStore (element CRUD + undo/redo)
```

### Rendering

The renderer uses the Canvas 2D API directly — no React reconciliation in the render loop. Renderer functions are pure: they take a context, camera, and element data, and draw. The `useCanvasRenderer` hook runs a `requestAnimationFrame` loop that only repaints when `markDirty()` has been called.

### Coordinate systems

- **Screen space** — pixel coordinates relative to the canvas element
- **World space** — infinite canvas coordinates, affected by camera pan/zoom

Always convert pointer events to world space before hit-testing or element manipulation. Use `screenToWorld()` and `worldToScreen()` from `useCanvasTransform`.

### State

`useDocumentStore` holds the element map, element order, selection set, and history stack. All mutations go through store actions. Call `pushSnapshot()` before any mutation to enable undo/redo.

## Wiring to Substrate chrome

### Toolbar

The default tool set for a 2D canvas:

| Tool      | Purpose                       | Shortcut |
| --------- | ----------------------------- | -------- |
| Select    | Click/drag to select elements | V        |
| Hand      | Pan the canvas                | H        |
| Rectangle | Draw rectangles               | R        |
| Ellipse   | Draw ellipses                 | O        |
| Line      | Draw lines                    | L        |
| Text      | Place text elements           | T        |
| Frame     | Draw frame containers         | F        |

### Panels

See the `composing-panels` skill for full details. In summary:

- **Left panel** — layers list (render order, visibility toggles, selection)
- **Right panel** — properties inspector (transform, fill, stroke, opacity, type-specific properties)

### Interactions

See the `wire-interactions` skill for the full state machine. Key patterns:

- Click to select, shift-click to multi-select
- Drag on empty space with select tool → marquee selection
- Drag on selected element → move
- Drag on resize handle → resize
- Drag with shape tool → create new element
- Middle-click or hand tool → pan

## State, undo and persistence

`useDocumentStore` holds the board: `elements`, `elementOrder` (back to front), `camera`, `showGrid`, the selection and the history.

- **Undo and redo cover elements and their order only.** Pan, zoom and the grid are view state, so undoing an edit never moves the viewport.
- **Call `pushSnapshot()` before every mutation that should be undoable,** including property edits. For a scrub or drag, snapshot once at the start (`onStart`), not on every change.
- **Composite actions** record their own undo step: `duplicateElements(ids?)` clones the selection (or the given ids), and `setElementOrder(ids)` replaces the stacking order. Call `pushSnapshot()` yourself before `setElementOrder`.
- **Zoom** with `useCanvasTransform`: `setZoom(zoom)` and `zoomIn`/`zoomOut` zoom around the middle of the canvas, and `zoomToFit()` frames every visible element. Wire `ZoomControls` to `setZoom` and `zoomToFit`; setting `camera.zoom` directly zooms around the world origin and drifts.

To remember the board across reloads, restore before the first render and save on change:

```ts
import { useDocumentStore, type DocumentSnapshot } from "@/stores/substrate/document-store"

const KEY = "my-board"

// Call before the first render so the saved board is there on first paint
export function restoreBoard(): boolean {
  const raw = localStorage.getItem(KEY)
  if (!raw) return false
  try {
    useDocumentStore.getState().loadState(JSON.parse(raw) as DocumentSnapshot)
    return true
  } catch {
    return false
  }
}

// Returns an unsubscribe function
export function persistBoard(): () => void {
  let timer: number | undefined
  return useDocumentStore.subscribe((state, prev) => {
    const changed =
      state.elements !== prev.elements ||
      state.elementOrder !== prev.elementOrder ||
      state.camera !== prev.camera ||
      state.showGrid !== prev.showGrid
    if (!changed) return
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      const snapshot: DocumentSnapshot = {
        elements: state.elements,
        elementOrder: state.elementOrder,
        camera: state.camera,
        showGrid: state.showGrid,
      }
      localStorage.setItem(KEY, JSON.stringify(snapshot))
    }, 300)
  })
}
```

Selection and history are not saved, which is usually what you want. Seed a starter board with `addElement` only when `restoreBoard()` returns `false`, and give the starter shapes theme-safe colours.

## Current limits

- **Rotation:** elements render and hit-test rotated, but the selection box and resize handles stay axis-aligned, so resizing a rotated shape behaves oddly. Avoid offering rotation on shapes people will then resize, or draw rotated handles yourself.
- **Text:** a click with the text tool makes a 160×32 note. Text is edited through a properties panel (`textStyle.content`); there is no on-canvas editing.
- **Hidden and locked layers** (`visible: false`, `locked: true`) are skipped by hit-testing, so they can't be selected on the canvas.

## Extending the canvas

### Custom elements

To add a new element type (e.g. star, arrow, image), follow the `create-custom-tool` skill. The pipeline is: type definition → factory → renderer → hit-test → interaction → shortcut → cursor → toolbar.

### Custom rendering

For specialised visuals (gradients, patterns, blend modes, filters), modify the renderer functions in `canvas/renderer.ts`. Each element type has its own render case — add drawing logic there.

### Canvas overlays

For UI elements that sit on top of the canvas (selection indicators, context menus, floating labels), render them as absolutely positioned DOM elements rather than drawing them on the canvas. Convert world positions to screen positions for placement.

## Theming

The canvas background is driven by the `--canvas` CSS variable, read at render time via `getComputedStyle`. Grid dots use `--canvas-foreground`. See the `theming` skill for the full token table.

## What to build

Some examples of what this surface enables:

- **Design tool** — shape creation, styling, alignment, export (the default Substrate experience)
- **Diagram editor** — nodes and connectors with auto-routing, swimlanes, labels
- **Whiteboard** — freeform drawing, sticky notes, image placement, real-time collaboration
- **Map builder** — tile-based or freeform map editor for games or floor plans
- **Node graph** — visual programming interface with typed ports and connections
- **Wireframe tool** — UI component blocks with snap-to-grid and responsive breakpoints

## Related reference skills

- **scaffold-playground** — the craft rules and the checklist to run before you say it's done
- **substrate-canvas** — full catalogue of spatial hooks (useViewport, useSelection, useDragReorder) and utilities (snapToGrid, boundingBox, math)
- **substrate-scaffold** — Toolbar, Panel, StatusBar, ZoomControls for the app shell
- **substrate-controls** — NumberInput, Slider, ColourPicker, ActionControls for property panes
- **substrate-interaction** — useUndoable, useClipboard, createKeyboardShortcuts, LayerList
