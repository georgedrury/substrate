---
name: substrate-add-component
description: Add a new UI component to the Substrate registry. Covers compound component patterns, file conventions, registry.json entry, and MDX documentation stub. Triggers when adding a component, creating a new UI primitive, or extending the Substrate component library.
user-invocable: false
---

# Add a Substrate component

Use this skill when adding a new UI component to `registry/substrate/components/`.

## File conventions

- One file per component family: `registry/substrate/components/{name}.tsx`
- Kebab-case filename, PascalCase exports
- Compound components are named function exports (not a default export)

## Component pattern

Every component follows this structure:

```tsx
import { cn } from "@/lib/utils"

// ── Optional: Radix or other primitive imports ──
// "use client" directive only if hooks or event handlers are used

type {Name}Props = {
  // Component-specific props only — not className, children, etc.
}

export function {Name}({
  className,
  ...props
}: {Name}Props & React.ComponentProps<"{element}">) {
  return (
    <{element}
      data-slot="{name}"
      className={cn("...", className)}
      {...props}
    />
  )
}
```

### Rules

1. **Extend `React.ComponentProps<"div">` (or the appropriate element)** — never define `className` or `children` manually.
2. **Use `data-slot="{name}"`** on the root element of each sub-component (not on the top-level wrapper if it's just a spacing container).
3. **Use `cn()` from `@/lib/utils`** — never raw template literals for conditional classes.
4. **Use semantic colour tokens** (`bg-background`, `text-foreground`, `bg-accent`, etc.) — never raw Tailwind colours.
5. **Named function exports** — no default export. Export all sub-components and any public types at the bottom of the file.
6. **`"use client"` only when necessary** — if the component uses hooks, event handlers, or Radix primitives that require client rendering.

### Compound component convention

For compound components (e.g. Pane → PaneHeader, PaneLabel, PaneAction):

- Prefix each sub-component with the parent name
- Each sub-component is its own named function export
- Each gets its own `data-slot`
- Type-only props go in a dedicated `type {Name}Props = {}` — layout props come from `ComponentProps`

## registry.json entry

Add an entry to the `items` array in `registry.json`:

```json
{
	"name": "{name}",
	"type": "registry:ui",
	"title": "{Title}",
	"description": "One-sentence description of what the component does.",
	"author": "George Drury <info@georgedrury.co.uk>",
	"categories": ["substrate", "ui"],
	"dependencies": [],
	"registryDependencies": [],
	"meta": {
		"example": "<{Name}>content</{Name}>",
		"lineage": [{ "name": "Substrate" }]
	},
	"files": [
		{
			"path": "registry/substrate/components/{name}.tsx",
			"type": "registry:ui",
			"target": ""
		}
	]
}
```

### Notes

- `dependencies` — only include npm packages the component directly imports (e.g. `radix-ui`, `@remixicon/react`). Omit if none.
- `registryDependencies` — full URL to any Substrate registry items this depends on, e.g. `"https://substrate.georgedrury.co.uk/r/types"`.
- `lineage` — `[{ "name": "Substrate" }]` unless built on a third-party primitive, in which case prepend it, e.g. `[{ "name": "Radix" }, { "name": "Substrate" }]`.

## MDX documentation

Create `content/docs/components/{name}.mdx`:

````mdx
---
title: { Title }
description: One-sentence description.
---

## Install

\```bash
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/{name}
\```

## Lineage

<Lineage items={[{ name: "Substrate" }]} />

## Usage

\```tsx
import { {Name} } from "@/registry/substrate/components/{name}"

<{Name}>content</{Name}>
\```

## Components

| Component | Description    |
| --------- | -------------- |
| `{Name}`  | Root container |
````

Then add `"{name}"` to the `pages` array in `content/docs/components/meta.json`.

## Checklist

1. [ ] Create component file in `registry/substrate/components/{name}.tsx`
2. [ ] Add entry to `registry.json`
3. [ ] Create MDX doc in `content/docs/components/{name}.mdx`
4. [ ] Add to `content/docs/components/meta.json` pages array
5. [ ] Verify `npm run build` passes

## Where does this component belong?

After creating a component, consider which domain skill it fits into and update that skill's component list:

| Domain | Skill | Examples |
| --- | --- | --- |
| App shell and layout | **substrate-scaffold** | Toolbar, Panel, Pane, DocumentTabs, StatusBar, Resizer |
| Inputs and selectors | **substrate-controls** | NumberInput, Slider, Select, Toggle, ColourPicker |
| Spatial surface | **substrate-canvas** | (hooks and utilities, not components) |
| Node graph | **substrate-nodes** | NodeCard, NodePort, NodePreview |
| Status and communication | **substrate-feedback** | Toast, ProgressBar, Badge, EmptyState, CommandPalette |
| Selection, undo, structure | **substrate-interaction** | HistoryControls, LayerList, TreeList |
