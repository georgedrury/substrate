---
name: theming
description: "Customise the visual appearance of Substrate — CSS variable fallback chains (Tailwind v4), canvas background, chrome tokens, element colours, and per-component overrides exposed by the registry. Use when restyling, rebranding, or matching a design system. Triggers on: theme, theming, colors, palette, CSS variables, design tokens, rebrand, dark mode, Tailwind v4, canvas colour, chrome styling, override tokens."
user-invocable: true
---

# Theming Substrate

Guide to customising the visual appearance of Substrate's canvas, UI chrome, and elements.

## How theming works

Substrate uses a CSS variable fallback chain (Tailwind v4) so you can override specific tokens without redefining everything. The pattern is:

```css
/* @theme inline block */
--color-canvas: var(--canvas, var(--color-background));
```

Set `--canvas` to override the canvas background; if unset, it falls back to `--color-background`.

## 1. Substrate tokens

Substrate defines its own semantic tokens that fall back to standard shadcn tokens:

| Tailwind class | CSS variable | Fallback | Used by |
|---|---|---|---|
| `bg-canvas` | `--color-canvas` → `--canvas` | `--color-background` | Canvas background |
| `text-canvas-foreground` | `--color-canvas-foreground` → `--canvas-foreground` | `--color-foreground-muted` | Canvas grid dots |
| `bg-panel` | `--color-panel` → `--panel` | `--color-card` | Panel background |
| `text-panel-foreground` | `--color-panel-foreground` → `--panel-foreground` | `--color-card-foreground` | Panel text |

Override the short-form variables in your `:root` and `.dark` blocks:

```css
:root {
  /* Canvas */
  --canvas: oklch(.97 0.0 0);
  --canvas-foreground: oklch(0.556 0 0);
  /* Panels */
  --panel: oklch(1 0 0);
  --panel-foreground: oklch(0.145 0 0);
}

.dark {
  --canvas: oklch(17.764% 0.00002 271.152);
  --canvas-foreground: oklch(0.708 0 0);
  --panel: oklch(0.205 0 0);
  --panel-foreground: oklch(0.985 0 0);
}
```

## 2. Standard shadcn tokens

The toolbar, slider, and tooltip still use standard shadcn tokens:

### Key tokens per component

- **Toolbar** — `bg-background`, `border`, `shadow-lg` for the container; `hover:bg-muted`, `aria-checked:bg-accent` for toggles
- **Panel** — `bg-panel`, `text-panel-foreground`, `border-border`
- **Pane** — `bg-panel` for action buttons, inherits `panel-foreground` for text
- **Slider** — track uses `bg-accent`, thumb uses `bg-foreground`
- **Tooltip** — inverted: `bg-foreground`, `text-background`

## 3. Canvas rendering

The canvas background is now driven by the `--canvas` CSS variable, read at render time via `getComputedStyle`. This means it automatically responds to light/dark mode and custom themes.

Grid dots, selection UI, and other renderer constants are still hardcoded in `canvas/renderer.ts`:

### Grid

Look for the grid rendering function. Key values:

- Grid line colour (default: light grey)
- Grid spacing (default: 20px world units)
- Major grid line interval

### Selection UI

- Selection box stroke colour (default: blue `#3b82f6`)
- Resize handle fill/stroke
- Marquee selection fill (semi-transparent blue)

### Element defaults

New element colours are set in `lib/element-factory.ts`. Each factory function defines default `fill` and `stroke` values.

## 3. Component-level overrides with `cn()`

Every Substrate component accepts `className` and spreads it via `cn()`. You can override specific styles per-instance:

```tsx
<Toolbar className="rounded-lg bg-zinc-900 border-zinc-800">
  {/* Dark toolbar variant */}
</Toolbar>

<Panel position="left" className="w-72 bg-zinc-950">
  {/* Wider, darker panel */}
</Panel>
```

## 4. Cursor customisation

Cursors are mapped in `design-canvas.tsx`'s `CURSOR_MAP`. You can swap these for custom cursor URLs:

```ts
const CURSOR_MAP: Record<string, string> = {
  select: "default",
  hand: "grab",
  rectangle: "url(/cursors/crosshair.svg) 12 12, crosshair",
  // ...
}
```

## 5. Dark mode

Substrate UI components automatically respect dark mode when using `next-themes` or a `.dark` class on the document. The canvas renderer needs manual dark mode handling — check a CSS variable or a store flag and swap your colour constants accordingly.

## Related reference skills

- **substrate-nodes** — port type CSS variables (7 port colours + 4 node chrome vars) follow the same fallback chain
- **substrate-controls** — ColourPicker, SwatchPalette for colour selection in property panes
