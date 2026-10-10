---
name: create-custom-tool
description: "End-to-end guide for adding a new canvas tool to Substrate — ToolType union, element factory, renderer, hit-test, interaction handler, keyboard shortcut, and toolbar entry. Use when extending the 2D canvas with a custom drawing or editing tool. Triggers on: custom tool, new tool, tool type, element factory, toolbar toggle, canvas tool, drawing tool, add tool."
user-invocable: true
---

# Create a custom tool

End-to-end guide for adding a new canvas tool to Substrate — from type definition through to toolbar entry and keyboard shortcut.

## Overview

A tool in Substrate touches these files:

1. **`types.ts`** — add to the `ToolType` union
2. **`lib/element-factory.ts`** — add a factory function (if the tool creates elements)
3. **`canvas/renderer.ts`** — add rendering logic
4. **`canvas/hit-test.ts`** — add hit-testing (if clickable)
5. **`hooks/use-canvas-interaction.ts`** — handle pointer events for the tool
6. **`hooks/use-keyboard-shortcuts.ts`** — bind a key
7. **`canvas/design-canvas.tsx`** — add cursor mapping
8. **Toolbar** — add a toggle in your page

## Step 1: Define the type

In `types.ts`, extend the `ToolType` union:

```ts
export type ToolType =
  | "select"
  | "hand"
  | "rectangle"
  | "ellipse"
  | "line"
  | "text"
  | "frame"
  | "your-tool"   // ← add here
```

If the tool creates a new element type, also extend `ElementType` and create a corresponding interface:

```ts
export type ElementType = "rectangle" | "ellipse" | "text" | "line" | "frame" | "your-element"

export interface YourElement extends BaseElement {
  type: "your-element"
  // Custom properties
  someProperty: number
}

export type DesignElement =
  | RectangleElement
  | EllipseElement
  | TextElement
  | LineElement
  | FrameElement
  | YourElement
```

## Step 2: Element factory (if creating elements)

In `lib/element-factory.ts`, add a factory:

```ts
export function createYourElement(x: number, y: number, width: number, height: number): YourElement {
  return {
    id: generateId(),
    type: "your-element",
    name: "Your Element",
    x, y, width, height,
    rotation: 0,
    opacity: 1,
    fill: { type: "solid", color: "#6366f1", opacity: 1 },
    stroke: null,
    locked: false,
    visible: true,
    someProperty: 42,
  }
}
```

## Step 3: Renderer

In `canvas/renderer.ts`, add a rendering case. The renderer uses the Canvas 2D API directly:

```ts
case "your-element": {
  ctx.save()
  // Transform, draw, restore
  ctx.restore()
  break
}
```

## Step 4: Hit-test (if clickable)

In `canvas/hit-test.ts`, add detection logic in the `hitTestElement` function:

```ts
case "your-element":
  return pointInBounds(localPoint, { x: 0, y: 0, width: el.width, height: el.height })
```

## Step 5: Interaction hook

In `hooks/use-canvas-interaction.ts`, handle the tool in the pointer event state machine. The key areas are:

- **`onPointerDown`** — detect what was clicked, start the appropriate drag type
- **`onPointerMove`** — update drag state, preview creation
- **`onPointerUp`** — finalise the action (create element, commit move, etc.)

For a creation tool, the pattern matches the existing rectangle/ellipse flow — start a "create" drag on pointer down, preview during move, commit on pointer up.

## Step 6: Keyboard shortcut

In `hooks/use-keyboard-shortcuts.ts`, add a key binding in the switch statement:

```ts
case "y": setTool("your-tool"); return
```

## Step 7: Cursor

In `canvas/design-canvas.tsx`, add to `CURSOR_MAP`:

```ts
const CURSOR_MAP: Record<string, string> = {
  // ...existing entries
  "your-tool": "crosshair",
}
```

## Step 8: Toolbar entry

In your playground page, add a toggle:

```tsx
<ToolbarToggle value="your-tool" tooltip="Your Tool" shortcut="Y">
  <YourIcon className="size-4" />
</ToolbarToggle>
```

## Tools that don't create elements

Not every tool creates elements. For tools like a measurement tool, colour picker, or zoom tool:

- Skip steps 2 (factory) and 4 (hit-test for new element type)
- In the interaction hook, handle the tool's pointer events directly (e.g. measure distance between pointer down and up)
- Store any tool-specific state in a dedicated Zustand store if needed

## Testing your tool

1. Select the tool from the toolbar or press its shortcut key
2. Verify the cursor changes
3. Test the full interaction cycle: pointer down → move → up
4. Check undo/redo works correctly (ensure `pushSnapshot()` is called before mutations)
5. Verify the element renders and can be selected/moved/resized

## Related reference skills

- **substrate-canvas** — useViewport, snap, boundingBox, hit testing, coordinate maths
- **substrate-scaffold** — Toolbar (for adding your tool button), StatusBar
- **substrate-interaction** — createKeyboardShortcuts (for binding a shortcut key), useUndoable
