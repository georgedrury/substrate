---
name: substrate-feedback
description: "Substrate status, communication, and discovery components: toast, progress bar, badge, empty state, shortcut overlay, command palette, context menu, and popover. Use when showing feedback, status indicators, contextual menus, or discoverability aids. Triggers on: toast, notification, progress, loading, empty state, badge, command palette, context menu, popover, shortcut help, keyboard shortcuts display."
user-invocable: true
---

# Substrate feedback

Feedback components handle communication with the user – notifications, status indicators, contextual actions, and discoverability features.

## When to use this skill

Use the feedback skill when you need to:

- Show success/error/undo notifications
- Display loading or progress
- Show empty states when there's no content
- Add a command palette (⌘K) for quick actions
- Build right-click context menus
- Show a keyboard shortcuts overlay
- Use popovers for inline detail views
- Add status badges to elements

For structural layout (toolbar, panels), see **substrate-scaffold**.
For interactive controls (inputs, sliders), see **substrate-controls**.

---

## Components

### Toast

`registry/substrate/components/toast.tsx`

Thin wrapper around Sonner. Exports a `toast` function with convenience methods.

| Method | Duration | Use case |
| --- | --- | --- |
| `toast(message)` | 4s | General notification |
| `toast.success(message)` | 3s | Confirmation (saved, exported) |
| `toast.error(message)` | 6s | Error with longer reading time |
| `toast.warning(message)` | 5s | Caution |
| `toast.info(message)` | 4s | Informational |
| `toast.undo(message, onUndo)` | 6s | Action with undo option |
| `toast.dismiss(id?)` | — | Programmatic dismiss |

**When to use**: After async operations (save, export, publish), destructive actions (delete with undo), errors. Use `toast.undo` for delete operations to give users a recovery path.

```ts
toast.undo("Layer deleted", () => restoreLayer(id))
```

---

### ProgressBar

`registry/substrate/components/progress-bar.tsx`

Thin bar (h-1.5) with determinate and indeterminate modes.

**Props**: `value`, `max` (default 100), `indeterminate`

**When to use**: File uploads, export progress, batch operations. Use `indeterminate` when duration is unknown. Place at the top of a panel or inside a pane.

---

### Badge

`registry/substrate/components/badge.tsx`

Small label with 4 variants: `default`, `secondary`, `outline`, `muted`.

**When to use**: Element type indicators (in layer lists), node categories, status labels (draft/published), keyboard shortcut hints.

---

### EmptyState

`registry/substrate/components/empty-state.tsx`

Centred placeholder for empty panels or lists.

**Exports**: `EmptyState`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateAction`

**When to use**: Empty layer lists, empty canvas, no search results, first-run experience.

```tsx
<EmptyState>
  <EmptyStateIcon><RiStackLine /></EmptyStateIcon>
  <EmptyStateTitle>No layers yet</EmptyStateTitle>
  <EmptyStateDescription>
    Draw a shape on the canvas to get started
  </EmptyStateDescription>
</EmptyState>
```

---

### CommandPalette

`registry/substrate/components/command-palette.tsx`

⌘K-triggered command launcher using cmdk + Radix Dialog.

**Exports**: `CommandPalette`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`

**When to use**: Quick access to any action – tool switching, file operations, element creation, settings. Especially useful in node editors ("Add Node → Blur") and complex apps with many features.

**Recommended groups**: Tools, Actions, Create, Recent, Settings.

---

### ContextMenu

`registry/substrate/components/context-menu.tsx`

Right-click menu built on Radix ContextMenu. Supports submenus.

**Exports**: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuLabel`, `ContextMenuShortcut`, `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent`

**When to use**: Right-click on canvas elements, layer items, node cards, tabs. Show contextual actions (copy, paste, delete, group, bring to front) with keyboard shortcut hints.

**Connects to**: `createKeyboardShortcuts` (substrate-interaction) – use `formatShortcut` to render shortcut hints in menu items.

---

### ShortcutOverlay

`registry/substrate/components/shortcut-overlay.tsx`

Full-screen overlay listing all keyboard shortcuts, triggered by `?` key.

**Props**: `groups` – array of `{ label, shortcuts: { label, keys }[] }`

**When to use**: Discoverability aid. One per app. Pass the same shortcut groups registered with `createKeyboardShortcuts`.

---

### Popover

`registry/substrate/components/popover.tsx`

Floating panel built on Radix Popover. Optional arrow.

**Exports**: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverClose`

**When to use**: Inline details, settings, colour pickers, property editors that don't warrant a full panel.

---

## Recommended patterns

### Delete with undo

```ts
function handleDelete(ids: string[]) {
  const snapshot = getElements(ids)
  pushSnapshot()
  removeElements(ids)
  toast.undo(`${ids.length} element${ids.length > 1 ? "s" : ""} deleted`, () => {
    restoreElements(snapshot)
  })
}
```

### Context menu with shortcuts

```tsx
<ContextMenu>
  <ContextMenuTrigger>{children}</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={copy}>
      Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem onSelect={paste}>
      Paste <ContextMenuShortcut>⌘V</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>Arrange</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem onSelect={bringToFront}>Bring to front</ContextMenuItem>
        <ContextMenuItem onSelect={sendToBack}>Send to back</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
```

### Command palette with tool switching

```tsx
<CommandPalette>
  <CommandInput placeholder="Search actions…" />
  <CommandList>
    <CommandGroup heading="Tools">
      <CommandItem onSelect={() => setTool("select")}>
        <RiCursorLine /> Select
        <CommandShortcut>V</CommandShortcut>
      </CommandItem>
      <CommandItem onSelect={() => setTool("rectangle")}>
        <RiRectangleLine /> Rectangle
        <CommandShortcut>R</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandPalette>
```

---

## Cross-references

| Need | Skill |
| --- | --- |
| Keyboard shortcut registration | **substrate-interaction** |
| Toolbar and status bar for badges | **substrate-scaffold** |
| Node editor command palette groups | **substrate-nodes** |
| Empty state in layer/tree lists | **substrate-interaction** |
