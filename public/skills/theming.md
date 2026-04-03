# Theming Substrate

Guide to customising the visual appearance of Substrate's canvas, UI chrome, and elements.

## How theming works

Substrate components use Tailwind's semantic colour tokens (`bg-background`, `text-foreground`, `bg-accent`, etc.) rather than raw colours. This means theming is handled at the CSS variable level — you change the tokens, everything updates.

The canvas renderer uses its own colour values for grid lines, selection boxes, and handles. These are defined as constants in the renderer and can be overridden.

## 1. UI chrome (toolbar, panels, panes)

These components use the standard shadcn/Tailwind semantic tokens. Override them in your `globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark variants */
}
```

### Key tokens per component

- **Toolbar** — `bg-background`, `border`, `shadow-lg` for the container; `hover:bg-muted`, `aria-checked:bg-accent` for toggles
- **Panel** — `bg-background`, `border-border` for the shell; scrollbar inherits from the panel
- **Pane** — text uses `text-xs font-medium` (inherits `foreground`)
- **Slider** — track uses `bg-accent`, thumb uses `bg-foreground`
- **Tooltip** — inverted: `bg-foreground`, `text-background`

## 2. Canvas rendering

The canvas renderer draws directly to a `CanvasRenderingContext2D`, so CSS variables don't apply. Instead, modify the colour constants in `canvas/renderer.ts`:

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
