---
name: substrate-surfaces
description: Build creative surfaces for Substrate playgrounds — 2D canvas, 3D scenes, animation timelines, image generation, data visualisation. Covers the surface abstraction, integration with Substrate chrome (toolbar, panels, stores), and architecture patterns for each surface type. Triggers when creating a new playground, choosing a rendering engine, wiring a viewport to panels, or building any creative tool with Substrate.
user-invocable: true
---

# Substrate surfaces

A surface is the central interactive area of a Substrate playground — the part where the core creative interaction happens. Substrate provides the chrome (toolbar, panels, panes, stores, shortcuts) and the surface provides the rendering and interaction model.

## The surface concept

Every Substrate playground follows the same layout:

```
┌──────────┬────────────────────────┬──────────┐
│          │                        │          │
│  Left    │       Surface          │  Right   │
│  panel   │                        │  panel   │
│          │                        │          │
└──────────┴────────────────────────┴──────────┘
                 [ Toolbar ]
```

The surface slot is a `div` with `className="absolute inset-0 bg-canvas"` that sits between the panels. What you put inside it depends on what you're building.

## Architecture

### What the chrome provides (surface-agnostic)

These Substrate primitives work the same regardless of surface type:

- **Toolbar** — floating bottom bar with tool toggles, separators, tooltips, shortcuts
- **Panel** — side panels (left/right) controlled by `usePanelStore`
- **Pane / Action / Slider** — composable property controls inside panels
- **useToolStore** — active tool state, shared across surface and toolbar
- **usePanelStore** — panel visibility state
- **useKeyboardShortcuts** — global keyboard event handler (skip when inputs focused)

### What the surface provides (surface-specific)

Each surface type brings its own:

- **Rendering engine** — Canvas 2D, Three.js, GSAP, Recharts, or just DOM/images
- **Object/element store** — Zustand store for the surface's data model (elements, scene graph, keyframes, datasets)
- **Interaction model** — how pointer events map to actions (spatial selection vs parameter-driven vs timeline scrubbing)
- **Undo/redo** — snapshot-based history on the surface store (same pattern, different data shape)

### Store pattern

Every surface should create a Zustand store following this pattern:

```ts
import { create } from "zustand"

interface SurfaceState {
  // Data model — varies per surface type
  items: Record<string, SurfaceItem>
  selectedIds: Set<string>

  // History
  history: SurfaceState[]
  historyIndex: number
  pushSnapshot: () => void
  undo: () => void
  redo: () => void

  // CRUD
  addItem: (item: SurfaceItem) => void
  updateItem: (id: string, changes: Partial<SurfaceItem>) => void
  removeItem: (id: string) => void
  select: (ids: string[], additive?: boolean) => void
}
```

The data model changes (elements for 2D, scene objects for 3D, keyframes for animation, datasets for data vis) but the store shape — selection, history, CRUD — stays consistent.

### Wiring a surface to the chrome

1. **Mount the surface** — render it in the layout between panels, inside a full-bleed container
2. **Connect to useToolStore** — read the active tool to change surface behaviour (select vs create vs pan)
3. **Build panel content** — left panel for structure (layers, hierarchy, data sources), right panel for properties of the selected item
4. **Map toolbar toggles** — each surface type has its own set of relevant tools
5. **Extend keyboard shortcuts** — add surface-specific bindings, reuse the same `useKeyboardShortcuts` hook or create a surface-specific one

## Building a new surface type

When creating a surface that isn't covered by the existing types:

1. **Identify the rendering engine** — what library or API renders the main content?
2. **Define the data model** — what are the "objects" the user creates/manipulates? Design the Zustand store interface.
3. **Define the interaction model** — is it spatial (click on objects), temporal (scrub a timeline), parametric (adjust controls and regenerate), or something else?
4. **Create the surface component** — a React component that fills `absolute inset-0`, mounts the renderer, and connects to stores
5. **Wire to chrome** — map tools to toolbar, expose properties in panels, bind keyboard shortcuts
6. **Write a skill** — document the setup, architecture, and examples so Claude can scaffold it for others

## Surface types

Each surface type has a detailed guide covering dependencies, store architecture, component structure, chrome wiring, and example apps.

### 2D canvas

Spatial canvas with shapes, selection, transforms — the default Substrate surface. See [canvas-2d.md](./canvas-2d.md) for:
- Canvas 2D rendering pipeline (pure renderer → rAF loop → dirty flag)
- Coordinate systems (screen ↔ world)
- Hit-testing, interaction state machine, drag tracking
- Extending with custom element types

### 3D scene

Interactive 3D viewports using Three.js via React Three Fiber. See [3d-scene.md](./3d-scene.md) for:
- Mounting a Three.js canvas with OrbitControls
- Scene graph store architecture
- Transform gizmos and raycasting for selection
- Material/lighting property panels

### Animation

Timeline-based motion tools using GSAP. See [animation.md](./animation.md) for:
- Timeline component with playhead, tracks, and keyframe diamonds
- Keyframe and layer store architecture
- Building and scrubbing GSAP timelines from store data
- Easing curve editors

### Image generation

Prompt-driven image creation using fal.ai or similar. See [image-generation.md](./image-generation.md) for:
- Generation store (prompt, parameters, history)
- Server action for API proxying
- Preview surface, gallery, and comparison mode
- Inpainting extension with canvas overlay

### Data visualisation

Charts and dashboards using Recharts and D3. See [data-visualisation.md](./data-visualisation.md) for:
- Data and chart configuration stores
- CSV/JSON loading and column type inference
- Single chart and dashboard grid modes
- Brushing, linking, and axis assignment patterns
