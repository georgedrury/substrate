---
name: substrate-add-hook
description: Add a new React hook to the Substrate registry. Covers hook conventions, typed returns, registry.json entry, and dependency chains. Triggers when adding a hook, creating a new use* function, or extending Substrate's hook library.
user-invocable: false
---

# Add a Substrate hook

Use this skill when adding a new hook to `registry/substrate/hooks/`.

## File conventions

- One file per hook: `registry/substrate/hooks/use-{name}.ts` (`.tsx` only if it returns JSX)
- Always starts with `"use client"`
- Single named function export matching the filename in camelCase: `useCanvasDrag` → `use-canvas-drag.ts`

## Hook pattern

```ts
"use client"

import { useRef, useCallback } from "react"
import type { Point } from "../types"

// Export types that callers need
export type {Name}Info = {
  // ...
}

export function use{Name}() {
  // Prefer useRef for mutable state that doesn't trigger re-renders
  // Prefer useCallback for returned functions
  // Subscribe to stores with individual selectors, not the whole store

  const someRef = useRef<SomeType | null>(null)

  const doSomething = useCallback(() => {
    // ...
  }, [])

  return { someRef, doSomething }
}
```

### Rules

1. **`"use client"` directive** — always, on the first line.
2. **Typed exports** — export any types that callers will need (e.g. `DragInfo`, `DragType`).
3. **Ref-based mutable state** — use `useRef` for state that changes during pointer/animation frames but shouldn't trigger re-renders (e.g. drag position, animation state).
4. **Stable callbacks** — wrap returned functions in `useCallback` with correct dependency arrays.
5. **Granular store selectors** — subscribe to individual fields: `useDocumentStore((s) => s.camera)`, never `useDocumentStore()`.
6. **Import types from `../types`** — use Substrate's shared type definitions.
7. **Import stores from `../stores/{store-name}`** and other hooks from `../hooks/{hook-name}`.

## Store-connected hooks

When a hook wraps store state (like `useHitTest` wraps `document-store` + `hit-test`):

```ts
"use client"

import { useCallback } from "react"
import { useDocumentStore } from "../stores/document-store"
import { useCanvasTransform } from "./use-canvas-transform"
// ... pure functions from lib/canvas

export function use{Name}() {
  const elements = useDocumentStore((s) => s.elements)
  const { screenToWorld } = useCanvasTransform()

  const someAction = useCallback((screenPoint: Point) => {
    const worldPoint = screenToWorld(screenPoint)
    // ... use pure functions with store state
  }, [elements, screenToWorld])

  return { someAction }
}
```

## registry.json entry

```json
{
	"name": "use-{name}",
	"type": "registry:hook",
	"title": "use{Name}",
	"description": "Hook for ... — one sentence.",
	"author": "George Drury <info@georgedrury.co.uk>",
	"categories": ["substrate", "canvas"],
	"registryDependencies": ["https://substrate.georgedrury.co.uk/r/types"],
	"meta": {
		"lineage": [{ "name": "Substrate" }]
	},
	"files": [
		{
			"path": "registry/substrate/hooks/use-{name}.ts",
			"type": "registry:hook",
			"target": ""
		}
	]
}
```

### Dependency chain

Hooks typically depend on other registry items. Map the full chain:

- `types` — almost always needed
- `math` — if doing coordinate conversions or geometry
- Store dependencies — `document-store`, `tool-store`, `panel-store`
- Other hooks — e.g. `use-canvas-transform`, `use-hit-test`
- Pure lib — `hit-test`, `renderer`, `element-factory`

All must be listed as `registryDependencies` with full URLs.

## Checklist

1. [ ] Create hook file in `registry/substrate/hooks/use-{name}.ts`
2. [ ] Export public types alongside the hook
3. [ ] Add entry to `registry.json` with correct `registryDependencies` chain
4. [ ] Verify `npm run build` passes

## Where does this hook belong?

After creating a hook, consider which domain skill it fits into and update that skill's hook list. The domain skills live in `packages/cli/skills/`; run `npm run skills:sync` after editing them.

| Domain | Skill | Examples |
| --- | --- | --- |
| Spatial surface (pan, zoom, hit test) | **substrate-canvas** | useViewport, useSelection, useDragReorder, useCanvasTransform, useHitTest |
| Editing flows (undo, clipboard) | **substrate-interaction** | useUndoable, useClipboard |
| Tree/list expand state | **substrate-interaction** | useTreeExpansion (inside tree-list.tsx) |
