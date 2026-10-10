---
name: install-components
description: "Catalogue of every Substrate component, hook, utility, and store — with the exact `substrate-kit add` command to install each. Use this BEFORE writing any custom slider, input, toggle, picker, toolbar, panel, or other UI primitive — Substrate almost certainly already has one. Triggers on: slider, input, toggle, select, picker, swatch, toolbar, panel, pane, modal, popover, context menu, command palette, progress bar, badge, tabs, tree, layer list, resizer, status bar, zoom, gallery, timeline, easing, node, port, custom component, build my own, write a slider, from scratch, install, substrate-kit add."
user-invocable: true
---

# Install Substrate components

**Before you write any UI primitive from scratch, check this catalogue.** Substrate ships a slider, number input, colour picker, toggle, select, context menu, command palette, toolbar, panel, timeline, easing editor, node graph, and many more — installable with a single command.

## How to install

All Substrate components install through the Substrate CLI, **not** by hand-rolling them or copying from other registries:

```bash
npx substrate-kit add <component-name>
```

Install several at once:

```bash
npx substrate-kit add slider number-input toggle colour-picker
```

Install every component in a category:

```bash
npx substrate-kit add --category substrate/ui/form
npx substrate-kit add --category substrate/ui/control
```

Open an interactive picker (no arguments):

```bash
npx substrate-kit add
```

List all categories and their components:

```bash
npx substrate-kit add --list-categories
```

### Requirements

- Run from a project created with `npx create-substrate` or initialised with `npx @substrate-kit/cli init`. Both add `@substrate-kit/cli` as a dev dependency, which is what makes `npx substrate-kit` resolve. The CLI looks for `components.json` — it will error if it's missing.
- Components land in `registry/substrate/...` and related aliases defined in `components.json`.
- Under the hood the CLI delegates to `npx shadcn@latest add` against `https://substrate.georgedrury.co.uk/r/<name>`. Do **not** use the shadcn CLI directly — always go through `substrate-kit add` so the CLI can print theme-override hints and keep the workflow uniform.

### Related CLI commands

| Command | What it does |
| --- | --- |
| `substrate-kit add <name>` | Install one or more components |
| `substrate-kit docs <name>` | Read component docs in the terminal |
| `substrate-kit browse <name>` | Open component docs in the browser |
| `substrate-kit variables <name>` | Print the theme-override CSS variables for a component |

---

## Don't build these — install them

When you catch yourself about to write a custom version of any of these, stop and run `substrate-kit add <name>` instead.

### Form controls — `substrate/ui/form`

| Component | Command | Use for |
| --- | --- | --- |
| Controls | `substrate-kit add controls` | Whole parameter panels from a config object (`useControls` + `<Controls />`) — reach for this before hand-wiring rows |
| Slider | `substrate-kit add slider` | Any range input — opacity, volume, zoom, numeric sliders |
| Number Input | `substrate-kit add number-input` | Numeric property fields with drag-to-scrub on the label |
| Number Slider | `substrate-kit add number-slider` | Combined slider + numeric input on one row |
| Select | `substrate-kit add select` | Dropdown pickers (blend mode, font family, alignment) |
| Toggle | `substrate-kit add toggle` | Binary on/off switches (snap, visibility, lock) |
| Text Area | `substrate-kit add text-area` | Auto-resizing multi-line text input |

### Higher-level controls — `substrate/ui/control`

| Component | Command | Use for |
| --- | --- | --- |
| Colour Picker | `substrate-kit add colour-picker` | HSV picker with hex/RGB + opacity |
| Swatch Palette | `substrate-kit add swatch-palette` | Grid of preset colours |
| Alignment Controls | `substrate-kit add alignment-controls` | Horizontal/vertical align + distribute |
| Collapsible Pane | `substrate-kit add collapsible-pane` | Expandable section inside a panel |
| Layer List | `substrate-kit add layer-list` | Sortable list with visibility/lock toggles |
| Tree List | `substrate-kit add tree-list` | Hierarchical tree with expand/collapse and drag reorder |
| Node | `substrate-kit add node` | Card-based node with typed input/output ports |

### Chrome (app shell) — `substrate/ui/chrome`

| Component | Command | Use for |
| --- | --- | --- |
| Surface | `substrate-kit add surface` | Consistent mount point for a creative surface |
| History Controls | `substrate-kit add history-controls` | Undo/redo buttons wired to the document store |
| Breadcrumbs | `substrate-kit add breadcrumbs` | Document/frame hierarchy navigation |
| Command Palette | `substrate-kit add command-palette` | Cmd-K searchable command launcher |
| Document Tabs | `substrate-kit add document-tabs` | Tab bar for open documents |
| Resizer | `substrate-kit add resizer` | Draggable split-pane handle |
| Shortcut Overlay | `substrate-kit add shortcut-overlay` | `?`-triggered keyboard shortcuts overlay |
| Status Bar | `substrate-kit add status-bar` | Bottom bar for tool/selection/zoom info |
| Zoom Controls | `substrate-kit add zoom-controls` | Zoom in/out/reset with percentage display |

### Core UI — `substrate/ui`

| Component | Command | Use for |
| --- | --- | --- |
| Toolbar | `substrate-kit add toolbar` | Floating toolbar with toggle groups and tooltips |
| Panel | `substrate-kit add panel` | Left/right side panel container |
| Pane | `substrate-kit add pane` | Content section (header + label + actions) inside a panel |
| Action | `substrate-kit add action` | Labelled form-row container |
| Badge | `substrate-kit add badge` | Small status indicator |
| Context Menu | `substrate-kit add context-menu` | Right-click menu with items, separators, submenus |
| Empty State | `substrate-kit add empty-state` | Placeholder for empty panels/lists |
| Popover | `substrate-kit add popover` | Floating content anchored to a trigger |
| Progress Bar | `substrate-kit add progress-bar` | Horizontal progress indicator |
| Toast | `substrate-kit add toast` | Notifications with undo, powered by Sonner |

### Animation — `substrate/ui/animation`

| Component | Command | Use for |
| --- | --- | --- |
| Timeline | `substrate-kit add timeline` | Ruler + playhead + tracks + keyframe diamonds |
| Easing Curve Editor | `substrate-kit add easing-curve-editor` | Draggable cubic-bezier editor |

### Visualisation — `substrate/ui/visualization`

| Component | Command | Use for |
| --- | --- | --- |
| Gallery | `substrate-kit add gallery` | Responsive thumbnail grid with selection and actions |

### 2D canvas — `substrate/canvas`

| Component | Command | Use for |
| --- | --- | --- |
| Design Canvas | `substrate-kit add design-canvas` | The main HTML5 canvas component (pulls in renderer/hit-test/interaction) |
| Renderer | `substrate-kit add renderer` | Pure Canvas 2D draw functions |
| Hit Test | `substrate-kit add hit-test` | Point-in-element geometry |
| Element Factory | `substrate-kit add element-factory` | Factories for rectangle/ellipse/text/etc |

### Canvas hooks — `substrate/canvas` & `substrate/hook`

| Hook | Command | Use for |
| --- | --- | --- |
| useCanvasRenderer | `substrate-kit add use-canvas-renderer` | rAF render loop with dirty-flag optimisation |
| useCanvasInteraction | `substrate-kit add use-canvas-interaction` | Pointer-event state machine (idle/pan/create/drag) |
| useCanvasDrag | `substrate-kit add use-canvas-drag` | Drag tracking (create/move/resize) |
| useCanvasTransform | `substrate-kit add use-canvas-transform` | Screen↔world coordinate conversion, pan, zoom |
| useHitTest | `substrate-kit add use-hit-test` | Hit-testing wrapper around canvas state |
| useKeyboardShortcuts | `substrate-kit add use-keyboard-shortcuts` | Global keyboard shortcut binding |
| useSelection | `substrate-kit add use-selection` | Multi-select with cmd/shift modifiers |
| useDragReorder | `substrate-kit add use-drag-reorder` | Pointer-based list reordering |
| useClipboard | `substrate-kit add use-clipboard` | Copy/cut/paste with system clipboard |
| useViewport | `substrate-kit add use-viewport` | Pan/zoom state for canvas surfaces |
| useUndoable | `substrate-kit add use-undoable` | Lightweight undo/redo stack |

### Stores — `substrate/store`

| Store | Command | Use for |
| --- | --- | --- |
| document-store | `substrate-kit add document-store` | Elements, camera, selection, history |
| tool-store | `substrate-kit add tool-store` | Active tool + temporary tool support |
| panel-store | `substrate-kit add panel-store` | Left/right panel visibility, open panes |
| animation-store | `substrate-kit add animation-store` | Playback: duration, time, play/pause |

### Libraries — `substrate/lib`

| Lib | Command | Use for |
| --- | --- | --- |
| types | `substrate-kit add types` | Core canvas type definitions |
| math | `substrate-kit add math` | Geometry helpers (rotate, clamp, hit, distance) |
| id | `substrate-kit add id` | `crypto.randomUUID` wrapper |
| color | `substrate-kit add color` | OKLCh parsing and manipulation |
| keyboard-shortcuts | `substrate-kit add keyboard-shortcuts` | Declarative shortcut registration + formatting |
| snap | `substrate-kit add snap` | Grid + smart edge snapping |
| bounding-box | `substrate-kit add bounding-box` | AABB union/intersect/contain/expand |
| easing | `substrate-kit add easing` | Cubic bezier easing presets and evaluation |

---

## Rules of thumb

1. **If you're about to write a form control, stop.** `slider`, `number-input`, `number-slider`, `select`, `toggle`, `text-area` already exist. Writing a custom one means throwing away the `data-slot` composition that makes `ActionControls` style children automatically.
2. **If you're about to write a colour picker, stop.** `colour-picker` and `swatch-palette` exist.
3. **If you're about to write a context menu, command palette, toast, or popover, stop.** All four are in the registry.
4. **If you're about to write a panel/pane/toolbar/status bar, stop.** The entire app shell is packaged — see `substrate-scaffold` for composition patterns.
5. **If you're about to write a canvas renderer or hit-test from scratch, stop.** `design-canvas` bundles the renderer, hit-test, interaction state machine, and keyboard shortcuts.
6. **Never use `npx shadcn@latest add` directly** for Substrate components — go through `substrate-kit add` so theme hints and workflow stay consistent.

## Cross-references

| Want a domain overview? | Skill |
| --- | --- |
| Form controls and property editors | **substrate-controls** |
| App shell (toolbar, panels, tabs, status bar) | **substrate-scaffold** |
| Spatial hooks (viewport, selection, snapping) | **substrate-canvas** |
| Node graph (nodes, ports, wires) | **substrate-nodes** |
| Status/notification/discovery UI | **substrate-feedback** |
| Selection/undo/clipboard/shortcuts wiring | **substrate-interaction** |
| Building a new playground | **scaffold-playground** |
| Composing a property panel | **composing-panels** |
