# Scaffold a Substrate playground

Step-by-step guide to bootstrapping a new interactive playground from Substrate primitives.

## What is a Substrate playground?

A Substrate playground is a creative app built from composable primitives: a **surface** (the central area where the main interaction happens), **chrome** (toolbar, panels, panes), and **stores** (Zustand state management with undo/redo). You bring the creative idea — Substrate provides the shell.

## Prerequisites

A Next.js 14+ project with Tailwind CSS and the shadcn CLI configured. If you don't have one, run:

```bash
npx substrate create my-playground
```

This scaffolds a full project with dependencies, globals.css with Substrate tokens, and a starter playground page.

To add Substrate to an existing project instead:

```bash
npx substrate init
```

This installs skills, CLAUDE.md, components.json, and registers the MCP server.

## 1. Choose your surface

The surface is the heart of the playground — the central area where the main interaction happens. Substrate supports several surface types:

| Surface            | Best for                                                  | Skill                                         |
| ------------------ | --------------------------------------------------------- | --------------------------------------------- |
| 2D canvas          | Shape editors, diagrams, whiteboards, node graphs         | [canvas-2d](./canvas-2d.md)                   |
| 3D scene           | Product viewers, scene builders, shader playgrounds       | [3d-scene](./3d-scene.md)                     |
| Animation          | Timeline editors, motion prototyping, easing explorers    | [animation](./animation.md)                   |
| Image generation   | Prompt-driven image tools, texture generators, inpainting | [image-generation](./image-generation.md)     |
| Data visualisation | Chart editors, dashboard builders, data explorers         | [data-visualisation](./data-visualisation.md) |

Read the relevant surface skill for setup instructions, dependencies, and architecture patterns.

## 2. Install chrome primitives

Regardless of surface type, most playgrounds use the same chrome components:

```bash
# UI chrome
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/toolbar
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/panel
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/pane
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/action
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/slider
```

For the 2D canvas surface specifically, also install:

```bash
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/design-canvas
```

## 3. Compose the layout

Every playground follows the same layout pattern — surface in the centre, optional panels on left/right, toolbar floating at the bottom:

```tsx
"use client"

import { Panel } from "@/registry/substrate/components/panel"
import {
	Toolbar,
	ToolbarToggleGroup,
	ToolbarToggle,
	ToolbarSeparator,
} from "@/registry/substrate/components/toolbar"
import { usePanelStore } from "@/registry/substrate/stores/panel-store"
import { useToolStore } from "@/registry/substrate/stores/tool-store"

export default function PlaygroundPage() {
	const leftPanel = usePanelStore((s) => s.leftPanel)
	const rightPanel = usePanelStore((s) => s.rightPanel)
	const activeTool = useToolStore((s) => s.activeTool)
	const setTool = useToolStore((s) => s.setTool)

	return (
		<div className="h-screen w-screen bg-canvas">
			{leftPanel && (
				<Panel position="left">
					{/* Layers, data sources, history — depends on surface type */}
				</Panel>
			)}

			{/* Your surface goes here */}
			{/* <DesignCanvas /> or <SceneViewport /> or <PreviewSurface /> etc. */}

			{rightPanel && (
				<Panel position="right">
					{/* Properties, parameters, configuration — depends on surface type */}
				</Panel>
			)}

			<Toolbar>
				<ToolbarToggleGroup value={activeTool} onValueChange={setTool}>
					{/* Tool toggles — depends on surface type */}
				</ToolbarToggleGroup>
			</Toolbar>
		</div>
	)
}
```

## 4. What the chrome gives you

Once scaffolded, the chrome primitives provide:

- **Toolbar** — floating bottom bar with toggle groups, separators, and tooltip/shortcut hints
- **Panels** — side panels (left/right) with visibility controlled by `usePanelStore`
- **Panes** — collapsible sections within panels, with headers, labels, and action buttons
- **Actions** — labelled property rows (label + controls) for building inspectors
- **Sliders** — range inputs for numeric properties

These are surface-agnostic — they work the same whether you're building a 3D scene editor or an image generation tool.

## 5. Next steps

- **Build your surface** — read the surface skill for your chosen type
- **Add property panels** — see [composing panels](./composing-panels.md)
- **Wire keyboard shortcuts** — see [wire interactions](./wire-interactions.md)
- **Create custom tools** — see [create custom tool](./create-custom-tool.md)
- **Customise appearance** — see [theming](./theming.md)

## Component reference skills

For a full catalogue of available components, hooks, and utilities organised by domain:

| Domain | Skill | What it covers |
| --- | --- | --- |
| App shell | **substrate-scaffold** | Toolbar, Panel, Pane, DocumentTabs, StatusBar, ZoomControls, Breadcrumbs, Resizer |
| Input controls | **substrate-controls** | NumberInput, Slider, NumberSlider, Select, Toggle, TextArea, ColourPicker, ActionControls |
| Spatial primitives | **substrate-canvas** | useViewport, useSelection, snap, boundingBox, hit testing, coordinate maths |
| Node graph | **substrate-nodes** | Node cards, typed ports, port colour theming |
| Status and communication | **substrate-feedback** | Toast, ProgressBar, Badge, EmptyState, CommandPalette, ContextMenu, ShortcutOverlay |
| Editing flows | **substrate-interaction** | useUndoable, useClipboard, createKeyboardShortcuts, HistoryControls, LayerList, TreeList |
