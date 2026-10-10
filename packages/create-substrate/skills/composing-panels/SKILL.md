---
name: composing-panels
description: "Compose Substrate panel UIs — how Panel, Pane, PaneHeader, Action, and ActionControls nest together to build property inspectors, layer panels, and parameter forms. Use when laying out the side panels of a playground. Triggers on: panel, pane, sidebar, inspector, property panel, layer panel, form row, action row, compose panels, nest components."
user-invocable: true
---

# Composing panels

Guide to building property panels, layer lists, and inspector UIs using Substrate's panel component system.

## Component hierarchy

Substrate's panel system is a composition of four components:

```
Panel (side panel shell — left or right)
  └── Pane (collapsible content section)
        ├── PaneHeader
        │     ├── PaneLabel (section title)
        │     └── PaneAction (header button)
        └── Action (form field row)
              ├── ActionLabel
              └── ActionControls
                    └── Slider, input, colour picker, etc.
```

## Install

```bash
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/panel
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/pane
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/action
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/slider
```

## Panel positioning

```tsx
import { Panel } from "@/components/substrate/panel"

{
	/* Left panel — layers, tool options */
}
;<Panel position="left">{/* Panes go here */}</Panel>

{
	/* Right panel — properties inspector */
}
;<Panel position="right">{/* Panes go here */}</Panel>
```

Panels are absolutely positioned and sized via CSS. They sit alongside the canvas in the playground layout.

## Building a properties inspector

A typical properties panel reads from `useDocumentStore` and writes back via `updateElement`:

```tsx
"use client"

import { useDocumentStore } from "@/stores/substrate/document-store"
import {
	Pane,
	PaneHeader,
	PaneLabel,
	PaneAction,
} from "@/components/substrate/pane"
import {
	Action,
	ActionLabel,
	ActionControls,
} from "@/components/substrate/action"
import { Slider } from "@/components/substrate/slider"

export function PropertiesPanel() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

	// Single selection only for properties
	if (selectedIds.size !== 1) return null
	const element = elements[[...selectedIds][0]]
	if (!element) return null

	const handleChange = (changes: Record<string, unknown>) => {
		pushSnapshot()
		updateElement(element.id, changes)
	}

	return (
		<>
			{/* Position and size */}
			<Pane>
				<PaneHeader>
					<PaneLabel>Transform</PaneLabel>
				</PaneHeader>
				<Action>
					<ActionLabel>X</ActionLabel>
					<ActionControls>
						<input
							type="number"
							value={Math.round(element.x)}
							onChange={(e) => handleChange({ x: Number(e.target.value) })}
							className="w-full bg-transparent text-xs tabular-nums"
						/>
					</ActionControls>
				</Action>
				<Action>
					<ActionLabel>Y</ActionLabel>
					<ActionControls>
						<input
							type="number"
							value={Math.round(element.y)}
							onChange={(e) => handleChange({ y: Number(e.target.value) })}
							className="w-full bg-transparent text-xs tabular-nums"
						/>
					</ActionControls>
				</Action>
				<Action>
					<ActionLabel>W</ActionLabel>
					<ActionControls>
						<input
							type="number"
							value={Math.round(element.width)}
							onChange={(e) => handleChange({ width: Number(e.target.value) })}
							className="w-full bg-transparent text-xs tabular-nums"
						/>
					</ActionControls>
				</Action>
				<Action>
					<ActionLabel>H</ActionLabel>
					<ActionControls>
						<input
							type="number"
							value={Math.round(element.height)}
							onChange={(e) => handleChange({ height: Number(e.target.value) })}
							className="w-full bg-transparent text-xs tabular-nums"
						/>
					</ActionControls>
				</Action>
			</Pane>

			{/* Opacity */}
			<Pane>
				<PaneHeader>
					<PaneLabel>Opacity</PaneLabel>
				</PaneHeader>
				<Action>
					<ActionLabel>{Math.round(element.opacity * 100)}%</ActionLabel>
					<ActionControls>
						<Slider
							value={[element.opacity * 100]}
							onValueChange={([v]) => handleChange({ opacity: v / 100 })}
							max={100}
							step={1}
						/>
					</ActionControls>
				</Action>
			</Pane>
		</>
	)
}
```

## Building a layers panel

A layers panel lists elements in render order (bottom to top) and lets users select, reorder, and toggle visibility:

```tsx
"use client"

import { useDocumentStore } from "@/stores/substrate/document-store"
import {
	Pane,
	PaneHeader,
	PaneLabel,
} from "@/components/substrate/pane"

export function LayersPanel() {
	const elements = useDocumentStore((s) => s.elements)
	const elementOrder = useDocumentStore((s) => s.elementOrder)
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const select = useDocumentStore((s) => s.select)
	const updateElement = useDocumentStore((s) => s.updateElement)

	return (
		<Pane>
			<PaneHeader>
				<PaneLabel>Layers</PaneLabel>
			</PaneHeader>
			<div className="flex flex-col-reverse">
				{elementOrder.map((id) => {
					const el = elements[id]
					if (!el) return null
					return (
						<button
							key={id}
							onClick={(e) => select([id], e.shiftKey)}
							data-selected={selectedIds.has(id) || undefined}
							className="flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-accent data-[selected]:bg-accent"
						>
							<span className="truncate">{el.name}</span>
							<button
								onClick={(e) => {
									e.stopPropagation()
									updateElement(id, { visible: !el.visible })
								}}
								className="ml-auto opacity-50 hover:opacity-100"
							>
								{el.visible ? "👁" : "—"}
							</button>
						</button>
					)
				})}
			</div>
		</Pane>
	)
}
```

## Wiring panels to the store

Use `usePanelStore` to control panel visibility:

```tsx
import { usePanelStore } from "@/stores/substrate/panel-store"

const leftPanel = usePanelStore((s) => s.leftPanel)
const rightPanel = usePanelStore((s) => s.rightPanel)
const toggleLeft = usePanelStore((s) => s.toggleLeft)
const toggleRight = usePanelStore((s) => s.toggleRight)
```

Then conditionally render:

```tsx
{
	leftPanel && (
		<Panel position="left">
			<LayersPanel />
		</Panel>
	)
}

{
	rightPanel && (
		<Panel position="right">
			<PropertiesPanel />
		</Panel>
	)
}
```

## Creating custom panes

Follow the compound component pattern:

1. **Wrap in `<Pane>`** for consistent spacing
2. **Use `<PaneHeader>` + `<PaneLabel>`** for the section title
3. **Use `<PaneAction>`** for header buttons (add, remove, toggle)
4. **Use `<Action>` + `<ActionLabel>` + `<ActionControls>`** for each property row
5. **Read from `useDocumentStore`** with granular selectors
6. **Call `pushSnapshot()` before mutations** to enable undo/redo
7. **Use `updateElement(id, changes)`** to write back

## Patterns

### Conditional panes by element type

Show different properties based on the selected element's type:

```tsx
{
	element.type === "rectangle" && (
		<Pane>
			<PaneHeader>
				<PaneLabel>Corner radius</PaneLabel>
			</PaneHeader>
			<Action>
				<ActionControls>
					<Slider
						value={[element.cornerRadius]}
						onValueChange={([v]) => handleChange({ cornerRadius: v })}
						max={100}
					/>
				</ActionControls>
			</Action>
		</Pane>
	)
}
```

### Multi-selection

When multiple elements are selected, show shared properties or a summary:

```tsx
if (selectedIds.size > 1) {
	return (
		<Pane>
			<PaneHeader>
				<PaneLabel>{selectedIds.size} elements selected</PaneLabel>
			</PaneHeader>
			{/* Show shared opacity, alignment buttons, etc. */}
		</Pane>
	)
}
```

## Related reference skills

- **substrate-scaffold** — full catalogue of Panel, Pane, CollapsiblePane, PaneHeader, and layout components
- **substrate-controls** — full catalogue of ActionControls, NumberInput, Slider, NumberSlider, Select, Toggle, ColourPicker, and the data-slot composition pattern
- **substrate-interaction** — HistoryControls (auto-positioned in PaneHeader), LayerList, TreeList
