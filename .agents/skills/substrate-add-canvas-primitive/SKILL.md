---
name: substrate-add-canvas-primitive
description: Add a new canvas primitive to the Substrate registry — pure rendering/geometry modules or canvas components. Covers renderer functions, hit-test patterns, store patterns, and canvas component wiring. Triggers when extending the canvas, adding rendering logic, creating a store, or adding geometry/hit-testing.
user-invocable: false
---

# Add a Substrate canvas primitive

Use this skill when adding to `registry/substrate/canvas/`, `registry/substrate/stores/`, or `registry/substrate/lib/`.

Canvas primitives fall into three categories:

## 1. Pure library modules (`registry/substrate/lib/`)

Stateless utility functions. No React, no hooks, no `"use client"`.

```ts
import type { Point, Bounds } from "../types"

export function someGeometryFn(point: Point, bounds: Bounds): boolean {
	// Pure function — no side effects, no store access
}
```

### Rules

- No React imports, no `"use client"`
- Import shared types from `../types`
- Export individual named functions
- Keep functions pure — input in, output out

### Registry type: `registry:lib`

```json
{
	"name": "{name}",
	"type": "registry:lib",
	"categories": ["substrate", "lib"],
	"files": [
		{
			"path": "registry/substrate/lib/{name}.ts",
			"type": "registry:lib",
			"target": ""
		}
	]
}
```

## 2. Canvas modules (`registry/substrate/canvas/`)

Two kinds exist:

### Pure canvas modules (e.g. `renderer.ts`, `hit-test.ts`)

These are pure functions that operate on Canvas2D context or geometry. No React.

```ts
import type { DesignElement, Camera } from "../types"

// Renderer functions take a CanvasRenderingContext2D and draw
export function renderElement(
	ctx: CanvasRenderingContext2D,
	element: DesignElement,
	camera: Camera,
) {
	// ...
}

// Hit-test functions take geometry and return results
export function elementAtPoint(
	point: Point,
	elements: Record<string, DesignElement>,
	order: string[],
	camera: Camera,
): string | null {
	// ...
}
```

**Registry type:** `registry:lib` with `categories: ["substrate", "canvas"]`

### Canvas components (e.g. `design-canvas.tsx`)

React components that compose hooks and render a `<canvas>` element.

```tsx
"use client"

import { useRef } from "react"
import { useCanvasRenderer } from "../hooks/use-canvas-renderer"
import { useCanvasInteraction } from "../hooks/use-canvas-interaction"
// ... other hooks

export function {Name}Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { markDirty, dragStateRef } = useCanvasRenderer(canvasRef, containerRef)
  const { onPointerDown, onPointerMove, onPointerUp, onWheel } =
    useCanvasInteraction(markDirty, dragStateRef)

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />
    </div>
  )
}
```

**Registry type:** `registry:ui` with `categories: ["substrate", "canvas"]`

## 3. Zustand stores (`registry/substrate/stores/`)

Stores follow this pattern:

```ts
import { create } from "zustand"
import type { SomeType } from "../types"

interface {Name}State {
  // State fields
  someField: SomeType

  // Actions — colocated with state
  setSomeField: (value: SomeType) => void
}

export const use{Name}Store = create<{Name}State>()((set, get) => ({
  someField: initialValue,

  setSomeField: (value) => set({ someField: value }),
}))
```

### Store rules

1. **Colocated actions** — define actions in the same `create()` call, not as separate functions.
2. **Immutable updates** — always spread state when updating objects/arrays.
3. **Use `set` for simple updates, `get` for reads within actions.**
4. **Interface, not type** — use `interface {Name}State` for the store shape.
5. **Export the hook** — `export const use{Name}Store = create<{Name}State>()(...)`.
6. **Type the full dependency** — `dependencies: ["zustand"]` in registry.json.

**Registry type:** `registry:lib` with `categories: ["substrate", "store"]`

## registry.json template

```json
{
	"name": "{name}",
	"type": "registry:lib",
	"title": "{Title}",
	"description": "One-sentence description.",
	"author": "George Drury <info@georgedrury.co.uk>",
	"categories": ["substrate", "{category}"],
	"dependencies": [],
	"registryDependencies": ["https://substrate.georgedrury.co.uk/r/types"],
	"meta": {
		"lineage": [{ "name": "Substrate" }]
	},
	"files": [
		{
			"path": "registry/substrate/{dir}/{name}.ts",
			"type": "registry:lib",
			"target": ""
		}
	]
}
```

## Wiring a new primitive into the render pipeline

If your primitive affects what's drawn on canvas:

1. **Renderer** — add a `render{Thing}` function to `canvas/renderer.ts` (or create a new renderer module)
2. **Hook** — call your renderer function from `use-canvas-renderer.ts`'s render loop
3. **Interaction** — if interactive, handle pointer events in `use-canvas-interaction.ts`
4. **Hit-test** — if clickable, add detection in `canvas/hit-test.ts`

If it affects tool behaviour:

1. **Types** — add to `ToolType` union in `types.ts`
2. **Tool store** — no changes needed (generic over `ToolType`)
3. **Interaction hook** — add cases in the pointer event state machine
4. **Keyboard shortcuts** — add key binding in `use-keyboard-shortcuts.ts`
5. **Cursor** — add to `CURSOR_MAP` in `design-canvas.tsx`

## Checklist

1. [ ] Create the module file in the appropriate directory
2. [ ] Add entry to `registry.json` with correct type and dependencies
3. [ ] Wire into existing hooks/renderers if part of the pipeline
4. [ ] Verify `npm run build` passes
