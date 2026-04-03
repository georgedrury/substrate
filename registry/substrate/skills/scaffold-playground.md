# Scaffold a Substrate playground

Step-by-step guide to bootstrapping a new interactive canvas playground from Substrate primitives.

## Prerequisites

A Next.js 14+ project with Tailwind CSS and the shadcn CLI configured. If you don't have one, run:

```bash
npx shadcn@latest init
```

## 1. Install core primitives

```bash
# Canvas engine
npx shadcn@latest add https://substrate.vui.run/r/design-canvas

# UI chrome
npx shadcn@latest add https://substrate.vui.run/r/toolbar
npx shadcn@latest add https://substrate.vui.run/r/panel
npx shadcn@latest add https://substrate.vui.run/r/pane
npx shadcn@latest add https://substrate.vui.run/r/action
npx shadcn@latest add https://substrate.vui.run/r/slider
```

Installing `design-canvas` automatically pulls in all hooks, stores, types, and canvas modules it depends on.

## 2. Create the playground layout

Create a page that composes the canvas with toolbar and panels:

```tsx
// app/playground/page.tsx
"use client"

import { DesignCanvas } from "@/registry/substrate/canvas/design-canvas"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
  ToolbarSeparator,
} from "@/registry/substrate/components/toolbar"
import { Panel } from "@/registry/substrate/components/panel"
import { useToolStore } from "@/registry/substrate/stores/tool-store"
import { usePanelStore } from "@/registry/substrate/stores/panel-store"
import {
  RiCursorLine,
  RiHandLine,
  RiSquareLine,
  RiCircleLine,
  RiSubtractLine,
  RiText,
} from "@remixicon/react"

export default function PlaygroundPage() {
  const activeTool = useToolStore((s) => s.activeTool)
  const setTool = useToolStore((s) => s.setTool)
  const leftPanel = usePanelStore((s) => s.leftPanel)
  const rightPanel = usePanelStore((s) => s.rightPanel)

  return (
    <div className="h-screen w-screen bg-muted">
      {/* Left panel — layers, tools */}
      {leftPanel && (
        <Panel position="left">
          {/* Add panes here */}
        </Panel>
      )}

      {/* Canvas */}
      <DesignCanvas />

      {/* Right panel — properties */}
      {rightPanel && (
        <Panel position="right">
          {/* Add property panes here */}
        </Panel>
      )}

      {/* Toolbar */}
      <Toolbar>
        <ToolbarToggleGroup value={activeTool} onValueChange={setTool}>
          <ToolbarToggle value="select" tooltip="Select" shortcut="V">
            <RiCursorLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="hand" tooltip="Hand" shortcut="H">
            <RiHandLine className="size-4" />
          </ToolbarToggle>

          <ToolbarSeparator />

          <ToolbarToggle value="rectangle" tooltip="Rectangle" shortcut="R">
            <RiSquareLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="ellipse" tooltip="Ellipse" shortcut="O">
            <RiCircleLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="line" tooltip="Line" shortcut="L">
            <RiSubtractLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="text" tooltip="Text" shortcut="T">
            <RiText className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>
    </div>
  )
}
```

## 3. What you get out of the box

Once scaffolded, the playground includes:

- **Canvas** — pan (scroll/space+drag), zoom (pinch/scroll), create elements by dragging with a shape tool
- **Selection** — click to select, shift-click to multi-select, marquee selection
- **Manipulation** — move and resize selected elements with handles
- **History** — Cmd+Z / Cmd+Shift+Z for undo/redo
- **Keyboard shortcuts** — V (select), H (hand), R (rectangle), O (ellipse), L (line), T (text), F (frame), Delete, Cmd+A, Cmd+D (duplicate)
- **Grid** — toggleable via the document store

## 4. Next steps

- **Add property panels** — see the [composing panels](./composing-panels.md) skill
- **Create custom tools** — see the [create custom tool](./create-custom-tool.md) skill
- **Wire interactions** — see the [wire interactions](./wire-interactions.md) skill
- **Customise appearance** — see the [theming](./theming.md) skill
