---
name: scaffold-playground
description: "Bootstrap a new Substrate playground from scratch — choose a surface type, install chrome primitives, and compose the surface + panels + toolbar layout. Use when starting a new interactive app or initialising Substrate in an existing project. Triggers on: new playground, scaffold, bootstrap, start project, substrate create, substrate init, set up Substrate, new app, starter."
user-invocable: true
---

# Scaffold a Substrate playground

Step-by-step guide to bootstrapping a new interactive playground from Substrate primitives.

## What is a Substrate playground?

A Substrate playground is a creative app built from composable primitives: a **surface** (the central area where the main interaction happens), **chrome** (toolbar, panels, panes), and **stores** (Zustand state management with undo/redo). You bring the creative idea — Substrate provides the shell.

## Prerequisites

A Vite or Next.js project with React and Tailwind CSS v4. If you don't have one, run:

```bash
npx create-substrate my-playground
```

This scaffolds a Vite + React project with dependencies, `globals.css` with Substrate tokens, and a starter page for the surface you pick. It asks for a name and a surface; pass `--surface <type>` (or `--yes`) when there is no terminal.

To add Substrate to an existing project instead:

```bash
npx @substrate-kit/cli init
```

This detects Vite or Next, installs the skills, adds Substrate guidance to `CLAUDE.md` and `AGENTS.md` without touching the rest of them, adds the `@substrate` registry to `components.json`, and registers the MCP server in `.mcp.json`.

## 1. Choose your surface

The surface is the heart of the playground — the central area where the main interaction happens. Substrate supports several surface types:

| Surface            | Best for                                                  | Skill                                         |
| ------------------ | --------------------------------------------------------- | --------------------------------------------- |
| 2D canvas          | Shape editors, diagrams, whiteboards, node graphs         | `canvas-2d`                   |
| 3D scene           | Product viewers, scene builders, shader playgrounds       | `3d-scene`                     |
| Animation          | Timeline editors, motion prototyping, easing explorers    | `animation`                   |
| Image generation   | Prompt-driven image tools, texture generators, inpainting | `image-generation`     |
| Data visualisation | Chart editors, dashboard builders, data explorers         | `data-visualisation` |
| Node editor        | Visual programming, shader graphs, data pipelines         | `substrate-nodes`       |

Read the relevant surface skill for setup instructions, dependencies, and architecture patterns.

## 2. Install chrome primitives

Regardless of surface type, most playgrounds use the same chrome components:

```bash
# UI chrome
npx substrate-kit add toolbar panel pane action slider
```

For the 2D canvas surface specifically, also install:

```bash
npx substrate-kit add design-canvas
```

## 3. Compose the layout

Every playground follows the same layout pattern — surface in the centre, optional panels on left/right, toolbar floating at the bottom:

```tsx
"use client"

import { Panel } from "@/components/substrate/panel"
import {
	Toolbar,
	ToolbarToggleGroup,
	ToolbarToggle,
	ToolbarSeparator,
} from "@/components/substrate/toolbar"
import { usePanelStore } from "@/stores/substrate/panel-store"
import { useToolStore } from "@/stores/substrate/tool-store"

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
- **Add property panels** — see `composing-panels`
- **Wire keyboard shortcuts** — see `wire-interactions`
- **Create custom tools** — see `create-custom-tool`
- **Customise appearance** — see `theming`

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
