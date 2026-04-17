---
name: wire-interactions
description: "Wire up Substrate's interaction pipeline — pointer events, drag state machine, hit testing, coordinate transforms, mutations, and keyboard shortcuts. Use when connecting a canvas surface to the document store or debugging interaction flows. Triggers on: pointer events, drag, interaction state machine, hit test, useCanvasInteraction, useCanvasDrag, useCanvasTransform, keyboard shortcut, wire up, connect canvas."
user-invocable: true
---

# Wire interactions

Guide to connecting canvas pointer events, drag state, keyboard shortcuts, and the interaction state machine in Substrate.

## Architecture overview

Substrate's interaction system is a layered pipeline:

```
Pointer events (DOM)
  → useCanvasInteraction (state machine)
    → useCanvasDrag (drag tracking)
    → useCanvasTransform (coordinate conversion)
    → useHitTest (what's under the cursor)
    → useDocumentStore (mutations)
    → markDirty() → useCanvasRenderer (repaint)

Keyboard events (DOM)
  → useKeyboardShortcuts
    → useToolStore (tool switching)
    → useDocumentStore (delete, undo/redo, select all, duplicate)
    → useCanvasTransform (zoom)
```

## The interaction state machine

`useCanvasInteraction` is the central orchestrator. It manages an `InteractionMode`:

| Mode | Triggered by | During move | On release |
|---|---|---|---|
| `idle` | Default state | Update hover, cursor | — |
| `panning` | Middle-click, or hand tool drag | Update camera via `setCamera` | Return to idle |
| `creating` | Drag with shape tool on empty canvas | Preview element dimensions | Commit new element to store |
| `moving` | Drag on selected element | Update element positions | Commit positions |
| `resizing` | Drag on resize handle | Update element bounds | Commit bounds |
| `marquee_selecting` | Drag on empty canvas with select tool | Draw selection rectangle | Select contained elements |

### Pointer down logic

```
1. Convert screen point → world point (useCanvasTransform)
2. Check for resize handle hit (useHitTest)
   → Yes: start "resizing" drag
3. Check for element hit (useHitTest)
   → Yes + already selected: start "moving" drag
   → Yes + not selected: select it, start "moving" drag
   → Yes + shift held: toggle selection
4. No hit + shape tool active: start "creating" drag
5. No hit + select tool: start "marquee_selecting" drag
6. Middle button or hand tool: start "panning" drag
```

### Pointer move logic

```
1. If not dragging: update hover state via hit-test, return
2. Convert to world coordinates
3. Update drag state (useCanvasDrag.updateDrag)
4. Based on drag type:
   - "pan": update camera
   - "create": preview element (stored on drag ref, rendered by renderer)
   - "move": update element positions (delta from start)
   - "resize": update element bounds respecting handle position
   - "marquee": update selection rectangle
5. Call markDirty() to trigger repaint
```

### Pointer up logic

```
1. End drag (useCanvasDrag.endDrag)
2. Based on drag type:
   - "create": push snapshot, add element to store, select it, reset tool to select
   - "move"/"resize": push snapshot (positions already updated during drag)
   - "marquee": select all elements within the marquee bounds
   - "pan": nothing to commit
```

## Coordinate system

Substrate uses two coordinate systems:

- **Screen space** — pixel coordinates relative to the canvas element
- **World space** — the infinite canvas coordinate system, affected by camera pan and zoom

`useCanvasTransform` provides:

- `screenToWorld(point)` — convert screen → world
- `worldToScreen(point)` — convert world → screen
- `pan(dx, dy)` — move camera
- `zoomToPoint(point, delta)` — zoom centred on a point

Always convert pointer event coordinates to world space before doing hit-testing or element manipulation.

## The drag state machine

`useCanvasDrag` tracks the current drag operation via a ref (not React state — avoids re-renders during high-frequency pointer moves):

```ts
interface DragInfo {
  type: DragType           // "create" | "move" | "resize" | "marquee" | "pan"
  startWorld: Point        // Where the drag began (world space)
  startScreen: Point       // Where the drag began (screen space)
  currentWorld: Point      // Current position (updated on every move)
  currentScreen: Point
  handle?: HandlePosition  // Which resize handle, if resizing
  elementStartPositions?: Record<string, { x, y, width, height }>  // Snapshot for move/resize
}
```

## Adding a custom interaction

To add a new interaction pattern:

1. **Define the mode** — add to `InteractionMode` in `types.ts` if it's a new state
2. **Entry condition** — add detection in the pointer down handler
3. **During drag** — add a case in pointer move
4. **Completion** — add a case in pointer up
5. **Always call `markDirty()`** after any visual change
6. **Always call `pushSnapshot()`** before committing mutations (for undo/redo)

## Keyboard shortcuts

`useKeyboardShortcuts` listens globally on `window`. It:

- Skips events when an input/textarea is focused
- Supports modifier combinations (`meta+key`, `shift+key`)
- Supports temporary tool switching (hold Space for hand tool, release to restore)

To add a shortcut:

```ts
// In the handleKeyDown callback
case "your-key": {
  e.preventDefault()
  // Your action
  return
}
```

For modifier combinations, check `meta` (which is `e.metaKey || e.ctrlKey` for cross-platform):

```ts
if (meta && e.key.toLowerCase() === "k") {
  e.preventDefault()
  // Cmd+K action
  return
}
```

## Related reference skills

- **substrate-interaction** — full catalogue of useUndoable, useClipboard, createKeyboardShortcuts (declarative replacement for switch statements), and formatShortcut
- **substrate-canvas** — useViewport, useSelection, useDragReorder, snap, boundingBox
- **substrate-feedback** — CommandPalette (⌘K), ShortcutOverlay (?), ContextMenu, Toast (for delete-with-undo)
