---
name: substrate-scaffold
description: "Substrate app shell: toolbar, panels, panes, document tabs, status bar, zoom controls, breadcrumbs, and resizer. Use when building the frame around a surface – layout, navigation, and structural chrome. Triggers on: app shell, layout, toolbar, panel, sidebar, tabs, status bar, zoom, breadcrumbs, split pane, resizer."
user-invocable: true
---

# Substrate scaffold

The scaffold is the structural shell around a Substrate surface – everything that isn't the central creative area itself. It provides toolbar, panels, panes, tabs, status bar, and layout primitives.

## When to use this skill

Use the scaffold skill when you need to:

- Build or modify the app shell around a surface
- Add toolbar items or customise toolbar behaviour
- Create or restructure side panels
- Add property panes inside panels
- Wire up document tabs, breadcrumbs, or status bar
- Add resizable split regions

For the controls *inside* panes, see **substrate-controls**.
For the central surface area, see **substrate-surfaces** and **substrate-canvas**.

---

## Components in this domain

### Toolbar

`registry/substrate/components/toolbar.tsx`

Floating bottom bar. Renders tool buttons, separators, and groups. Uses `data-slot="toolbar"` and provides **compaction styling** – children with `data-slot` attributes are automatically resized:

| Child slot | Compacted to |
| --- | --- |
| `number-input` | h-6, w-16 |
| `colour-swatch` | size-6 |
| `slider` / `slider-track` | h-6 |
| `history-controls` | gap-0 |

**Exports**: `Toolbar`, `ToolbarButton`, `ToolbarSeparator`, `ToolbarGroup`

**Typical use**: One per playground, positioned at the bottom. Connect each `ToolbarButton` to `useToolStore` for active-tool state.

**Related**: substrate-controls (for inputs inside the toolbar), substrate-interaction (for keyboard shortcuts bound to tools)

---

### Panel

`registry/substrate/components/panel.tsx`

Side panel (left or right). Controlled by `usePanelStore`. Renders as a fixed-width column with a header and scrollable body.

**Exports**: `Panel`, `PanelHeader`, `PanelBody`

**Typical use**: Left panel for structure (layers, tree), right panel for properties (panes with controls). Wire visibility to `usePanelStore`.

---

### Pane and CollapsiblePane

`registry/substrate/components/pane.tsx`
`registry/substrate/components/collapsible-pane.tsx`

Sections within a panel. A pane is a labelled group of controls. CollapsiblePane wraps Radix Collapsible for expand/collapse with animated content.

**PaneHeader** is slot-aware – it auto-positions `HistoryControls` via:
```
**:data-[slot=history-controls]:ml-auto
**:data-[slot=history-button]:size-6
```

**Pane exports**: `Pane`, `PaneHeader`, `PaneLabel`, `PaneAction`
**CollapsiblePane exports**: `CollapsiblePane`, `CollapsiblePaneHeader`, `CollapsiblePaneLabel`, `CollapsiblePaneContent`

**Typical use**: Group related controls (Transform, Fill, Stroke, Typography) inside the right panel.

**Related**: substrate-controls (for controls inside panes)

---

### DocumentTabs

`registry/substrate/components/document-tabs.tsx`

Tab bar for multiple open documents. Built on Radix Tabs. Close button uses `<span role="button">` to avoid nested-button HTML violation.

**Exports**: `DocumentTabs`, `DocumentTabList`, `DocumentTab`, `DocumentTabContent`

**Typical use**: Top of the layout, above the surface. Each tab maps to a document/file.

---

### StatusBar

`registry/substrate/components/status-bar.tsx`

Thin bottom bar (h-7) for metadata display. Sections align left/centre/right via flexbox auto-margins. Uses `text-[11px]` and `tabular-nums`.

**Exports**: `StatusBar`, `StatusBarSection`, `StatusBarItem`, `StatusBarSeparator`

**Typical use**: Below the surface. Show cursor position, zoom level, selection count, element type.

---

### ZoomControls

`registry/substrate/components/zoom-controls.tsx`

Zoom in/out/fit/reset buttons with percentage display. Click the percentage to reset to 100%.

**Exports**: `ZoomControls`, `ZoomButton`

**Props**: `zoom`, `onZoomChange`, `onZoomToFit`, `min`, `max`, `step`

**Typical use**: Inside the StatusBar or floating over the surface. Wire to `useViewport` from substrate-canvas.

**Related**: substrate-canvas (`useViewport` hook)

---

### Breadcrumbs

`registry/substrate/components/breadcrumbs.tsx`

Navigation trail for hierarchical contexts (e.g. Frame → Group → Element). Auto-truncates labels at `max-w-32`.

**Exports**: `Breadcrumbs`, `BreadcrumbItem`

**Typical use**: Above the surface or in a panel header when navigating into nested frames/groups.

---

### Resizer

`registry/substrate/components/resizer.tsx`

Draggable divider between regions. 1px visual line with a wider hit area. Three grab dots appear on hover.

**Exports**: `Resizer`

**Props**: `orientation` (`"vertical"` | `"horizontal"`)

**Typical use**: Between the panel and the surface, or between two panes in a split layout.

---

## Recommended combinations

### Standard creative app shell

```
Toolbar + Panel (left + right) + StatusBar + DocumentTabs
```

Panels contain Panes/CollapsiblePanes. StatusBar contains ZoomControls. Toolbar is connected to useToolStore.

### Minimal single-document tool

```
Toolbar + Panel (right only) + StatusBar
```

No tabs, no left panel. Good for focused single-surface tools like an image editor or easing curve designer.

### Node editor shell

```
Toolbar + Panel (right) + StatusBar + Breadcrumbs
```

Breadcrumbs show the path into nested node groups. Right panel shows properties of the selected node. See **substrate-nodes** for node components.

---

## Layout pattern

```tsx
<div className="flex h-screen flex-col">
  <DocumentTabList>{/* tabs */}</DocumentTabList>
  <div className="flex flex-1 overflow-hidden">
    <Panel side="left">{/* layers/tree */}</Panel>
    <div className="relative flex-1">
      <Surface />{/* central area */}
    </div>
    <Panel side="right">{/* property panes */}</Panel>
  </div>
  <StatusBar>{/* metadata */}</StatusBar>
  <Toolbar>{/* tools */}</Toolbar>
</div>
```

---

## Cross-references

| Need | Skill |
| --- | --- |
| Controls inside panes (sliders, inputs, selects) | **substrate-controls** |
| The central rendering surface | **substrate-surfaces** |
| Spatial hooks (viewport, snap, bounds) | **substrate-canvas** |
| Selection, undo, clipboard, shortcuts | **substrate-interaction** |
| Toasts, progress, empty states | **substrate-feedback** |
| Node cards and port wiring | **substrate-nodes** |
