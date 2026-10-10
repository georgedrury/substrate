---
name: substrate-interaction
description: "Cross-cutting interaction patterns for Substrate: selection, undo/redo, clipboard, keyboard shortcuts, history controls, layer lists, and tree lists. Use when wiring up user interaction flows that span multiple components. Triggers on: selection, undo, redo, clipboard, copy, paste, keyboard shortcut, history, layer list, tree list, drag reorder, undo stack."
user-invocable: true
---

# Substrate interaction

Interaction patterns wire together hooks, utilities, and components to create cohesive editing flows – selection, undo/redo, clipboard, keyboard shortcuts, and structural navigation (layers/trees).

## When to use this skill

Use the interaction skill when you need to:

- Wire up undo/redo across a surface
- Add clipboard (copy/cut/paste) support
- Register and manage keyboard shortcuts
- Build a layer list or tree list with selection and reordering
- Connect HistoryControls to an undo stack

For spatial interaction (pan, zoom, snap), see **substrate-canvas**.
For the controls that display properties, see **substrate-controls**.
For notifications and command palette, see **substrate-feedback**.

---

## Hooks

### useUndoable

`registry/substrate/hooks/use-undoable.ts`

Lightweight undo/redo stack using refs for performance. Stores snapshots, not diffs.

**Returns**: `pushSnapshot`, `undo`, `redo`, `canUndo`, `canRedo`, `undoCount`, `redoCount`, `clear`

**Pattern**: Call `pushSnapshot(currentState)` *before* mutating. Call `undo()` / `redo()` to get the previous/next state, then apply it.

```ts
const { pushSnapshot, undo, redo, canUndo, canRedo } = useUndoable<State>({ maxHistory: 100 })

function handleMove(id: string, x: number, y: number) {
  pushSnapshot(state)
  setState(prev => updateElement(prev, id, { x, y }))
}
```

**Connects to**: `HistoryControls` component, `NumberInput.onStart` (push snapshot before scrub), `createKeyboardShortcuts` (⌘Z / ⌘⇧Z).

---

### useClipboard

`registry/substrate/hooks/use-clipboard.ts`

Copy/cut/paste with ⌘C/⌘X/⌘V keyboard listeners. Writes to system clipboard where available, falls back to internal ref.

**Returns**: `copy`, `cut`, `paste`

**Pattern**: Provide `onCopy` (returns items to copy), `onPaste` (receives items), and optionally `onCut`.

```ts
useClipboard({
  onCopy: () => selectedElements.map(el => ({ ...el })),
  onPaste: (items) => {
    pushSnapshot(state)
    addElements(items.map(offset))
  },
  onCut: () => {
    const items = selectedElements.map(el => ({ ...el }))
    pushSnapshot(state)
    removeSelected()
    return items
  },
})
```

**Auto-skips**: Input, textarea, and contentEditable elements.

---

### useSelection

`registry/substrate/hooks/use-selection.ts`

Multi-select with modifier keys. See **substrate-canvas** for spatial selection use.

**Also useful for**: Layer lists and tree lists where items are selected by clicking rows.

---

### useDragReorder

`registry/substrate/hooks/use-drag-reorder.ts`

Pointer-based list reordering. See **substrate-canvas** for details.

---

## Utilities

### createKeyboardShortcuts

`registry/substrate/lib/keyboard-shortcuts.ts`

Declarative shortcut registration. Replaces imperative switch statements.

```ts
const dispose = createKeyboardShortcuts([
  { key: "z", meta: true, handler: handleUndo, label: "Undo", group: "Edit" },
  { key: "z", meta: true, shift: true, handler: handleRedo, label: "Redo", group: "Edit" },
  { key: "c", meta: true, handler: copy, label: "Copy", group: "Edit" },
  { key: "v", meta: true, handler: paste, label: "Paste", group: "Edit" },
  { key: "Delete", handler: deleteSelected, label: "Delete", group: "Edit" },
  { key: "a", meta: true, handler: selectAll, label: "Select all", group: "Selection" },
  { key: "v", handler: () => setTool("select"), label: "Select tool", group: "Tools" },
  { key: "r", handler: () => setTool("rectangle"), label: "Rectangle tool", group: "Tools" },
])

// Clean up on unmount
useEffect(() => dispose, [dispose])
```

**formatShortcut**: Converts entries to display strings for context menus and shortcut overlay.

```ts
formatShortcut({ key: "z", meta: true, shift: true }) // → "⌘+Shift+Z"
```

**Connects to**: `ShortcutOverlay` (substrate-feedback) – pass the same groups. `ContextMenuShortcut` – use `formatShortcut` for display.

---

## Components

### HistoryControls

`registry/substrate/components/history-controls.tsx`

Undo/redo button pair. Renders `data-slot="history-controls"` for auto-positioning in PaneHeader and Toolbar.

**Props**: `canUndo`, `canRedo`, `onUndo`, `onRedo`

**Typical placement**:
- Inside `PaneHeader` – auto-positioned to the right via `**:data-[slot=history-controls]:ml-auto`
- Inside `Toolbar` – auto-compacted via `**:data-[slot=history-controls]:gap-0`

---

### LayerList

`registry/substrate/components/layer-list.tsx`

Flat layer panel with selection, visibility, lock, rename, and reorder.

**Exports**: `LayerList`, `LayerItem`, `LayerIcon`, `LayerName`, `LayerActions`, `LayerToggle`, `LayerVisibilityToggle`, `LayerLockToggle`

**Features**:
- `LayerItem` supports `selected`, `hovered`, `depth` props
- `LayerName` enables double-click inline rename
- `LayerActions` are hidden by default, visible on row hover
- `LayerVisibilityToggle` and `LayerLockToggle` use eye/lock icons

**When to use**: 2D canvas surfaces, image editors, animation layers – any flat list of elements. For hierarchical structures, use TreeList instead.

**Connects to**: `useSelection` for multi-select, `useDragReorder` for reordering, `ContextMenu` (substrate-feedback) for right-click actions.

---

### TreeList

`registry/substrate/components/tree-list.tsx`

Hierarchical tree with expand/collapse, depth indentation, and icons.

**Exports**: `TreeList`, `TreeItem`, `TreeExpandButton`, `TreeItemContent`, `TreeItemIcon`, `TreeItemActions` + `useTreeExpansion` hook

**Features**:
- 16px depth indentation per level
- `TreeExpandButton` rotates chevron on expand
- `useTreeExpansion` manages expanded state: `isExpanded`, `toggle`, `expandAll`, `collapseAll`

**When to use**: Scene graph (3D), frame hierarchy (2D), file trees, component trees, node groups. For flat lists, use LayerList instead.

---

## Wiring it all together

### Complete undo/redo flow

```
┌─────────────────────────────────────────────────┐
│  User action (move, resize, delete, etc.)       │
│  → pushSnapshot(currentState)                   │
│  → mutate state                                 │
├─────────────────────────────────────────────────┤
│  ⌘Z pressed (via createKeyboardShortcuts)       │
│  → undo() returns previous state                │
│  → apply to store                               │
├─────────────────────────────────────────────────┤
│  HistoryControls (in PaneHeader or Toolbar)     │
│  → reads canUndo/canRedo                        │
│  → calls onUndo/onRedo                          │
├─────────────────────────────────────────────────┤
│  NumberInput.onStart                             │
│  → pushSnapshot before scrub begins             │
└─────────────────────────────────────────────────┘
```

### Complete shortcut flow

```
┌─────────────────────────────────────────────────┐
│  createKeyboardShortcuts(entries)                │
│  → registers keydown listener                   │
│  → entries include label + group metadata        │
├─────────────────────────────────────────────────┤
│  ShortcutOverlay (substrate-feedback)           │
│  → reads same groups for display                │
├─────────────────────────────────────────────────┤
│  ContextMenuShortcut (substrate-feedback)       │
│  → formatShortcut(entry) for inline display     │
├─────────────────────────────────────────────────┤
│  CommandPalette (substrate-feedback)            │
│  → CommandShortcut shows the key binding        │
└─────────────────────────────────────────────────┘
```

### Layer list with full interaction

```tsx
function LayerPanel() {
  const { selectedIds, select, isSelected } = useSelection({ items: elementIds })
  const { getDragItemProps } = useDragReorder({ items: elements, onReorder: reorderElements })

  return (
    <LayerList>
      {elements.map((el, i) => (
        <ContextMenu key={el.id}>
          <ContextMenuTrigger asChild>
            <LayerItem
              selected={isSelected(el.id)}
              onClick={(e) => select(el.id, e)}
              {...getDragItemProps(i)}
            >
              <LayerIcon colour={el.fill?.color} />
              <LayerName value={el.name} onRename={(name) => updateElement(el.id, { name })} />
              <LayerActions>
                <LayerVisibilityToggle
                  visible={el.visible}
                  onToggle={() => updateElement(el.id, { visible: !el.visible })}
                />
                <LayerLockToggle
                  locked={el.locked}
                  onToggle={() => updateElement(el.id, { locked: !el.locked })}
                />
              </LayerActions>
            </LayerItem>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => duplicateElement(el.id)}>
              Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => deleteElement(el.id)}>
              Delete <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </LayerList>
  )
}
```

---

## Cross-references

| Need | Skill |
| --- | --- |
| Panes and panels hosting layer/tree lists | **substrate-scaffold** |
| Property controls for selected items | **substrate-controls** |
| Viewport, snap, hit testing | **substrate-canvas** |
| Toast for delete-with-undo notifications | **substrate-feedback** |
| Node selection and graph undo | **substrate-nodes** |
| Surface-specific interaction models | **substrate-surfaces** |
