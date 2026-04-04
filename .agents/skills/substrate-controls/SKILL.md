---
name: substrate-controls
description: "Substrate input and selection primitives: number input, slider, number slider, select, toggle, text area, colour picker, easing curve editor, swatch palette, and action controls. Use when building property editors, parameter forms, or any interactive control surface. Triggers on: input, slider, select, toggle, colour picker, swatch, easing, action controls, property editor, form control."
user-invocable: true
---

# Substrate controls

Controls are the interactive inputs and selectors that live inside panes, toolbars, and action groups. They follow the `data-slot` composition pattern – parent containers (ActionControls, Toolbar, PaneHeader) style children automatically via CSS selectors.

## When to use this skill

Use the controls skill when you need to:

- Add a property input to a pane (e.g. width, height, rotation, opacity)
- Build a colour selection UI
- Create a parameter group with labels and inline controls
- Wire an easing curve editor into an animation panel
- Understand how ActionControls composes child controls

For the pane containers that hold controls, see **substrate-scaffold**.
For selection, undo, and clipboard behaviour, see **substrate-interaction**.

---

## The data-slot composition pattern

This is the core design pattern of Substrate controls. Parent components style children by matching `data-slot` attributes – no prop drilling required.

### ActionControls (the key container)

`registry/substrate/components/action.tsx`

A horizontal row that auto-styles its children:

| Child slot | Styling applied |
| --- | --- |
| `number-input` | Strips border, sets `bg-transparent` |
| `select-trigger` | Strips border, sets `bg-transparent` |
| `colour-swatch` | `size-7`, removes border |
| `slider` | Removes border |

**Exports**: `ActionControls`, `ActionLabel`, `ActionSeparator`

**Typical use**: Group a label + one or more controls on a single row inside a pane.

```tsx
<ActionControls>
  <ActionLabel>Width</ActionLabel>
  <NumberInput value={width} onChange={setWidth} min={0} />
</ActionControls>
```

### How it works

ActionControls applies Tailwind `**:data-[slot=...]` selectors in its className. When you drop a `NumberInput` (which renders `data-slot="number-input"`) inside, it automatically loses its border and gains transparent background – creating a seamless inline look.

The same pattern is used by **Toolbar** (compaction) and **PaneHeader** (auto-positioning HistoryControls).

---

## Components in this domain

### NumberInput

`registry/substrate/components/number-input.tsx`

Scrub-to-adjust number field. Supports label, suffix, min/max, step/shiftStep, precision, and pointer-lock scrubbing.

**Props**: `value`, `onChange`, `onStart`, `label`, `suffix`, `min`, `max`, `step`, `shiftStep`, `precision`, `disabled`

**When to use**: Any numeric property – dimensions, position, rotation, opacity, font size. Use `onStart` to push an undo snapshot before the value changes.

---

### Slider

`registry/substrate/components/slider.tsx`

Range slider built on Radix Slider. Single value or range (two thumbs).

**When to use**: Bounded continuous values where a visual track helps – opacity, volume, zoom level.

---

### NumberSlider

`registry/substrate/components/number-slider.tsx`

Compound of Slider + NumberInput on a single row. The slider fills available space, the input is a fixed `w-18`.

**Props**: Same as NumberInput plus all Slider range props.

**When to use**: When you want both a slider for quick scrubbing and a precise numeric input – e.g. opacity, blur radius.

---

### Select

`registry/substrate/components/select.tsx`

Dropdown built on Radix Select. Compact `h-7` trigger.

**Exports**: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectValue`

**When to use**: Enum-style choices – blend mode, font family, alignment, export format. Renders `data-slot="select-trigger"` for ActionControls awareness.

---

### Toggle

`registry/substrate/components/toggle.tsx`

Binary toggle button built on Radix Toggle. `h-7 min-w-7 px-2`. Accent styling when pressed.

**When to use**: On/off features – snap to grid, show guides, lock aspect ratio, bold/italic.

---

### TextArea

`registry/substrate/components/text-area.tsx`

Auto-resizing textarea with `minRows` / `maxRows`. Shares border/bg styling with NumberInput.

**When to use**: Multi-line text – element content, descriptions, notes, code snippets.

---

### ColourPicker

`registry/substrate/components/colour-picker.tsx`

HSV colour picker with hex/RGB inputs and opacity slider. The swatch trigger renders `data-slot="colour-swatch"` for slot-aware composition.

**When to use**: Fill, stroke, background, text colour – any colour property.

---

### SwatchPalette

`registry/substrate/components/swatch-palette.tsx`

Grid of colour swatches. Exports `MATERIAL_COLOURS` (24) and `TAILWIND_COLOURS` (16) presets.

**Props**: `colours`, `columns` (default 8), `selected`, `onSelect`

**When to use**: Quick colour selection from a predefined palette. Often paired with ColourPicker.

---

### EasingCurveEditor

`registry/substrate/components/easing-curve-editor.tsx`

Cubic bezier editor with draggable control points and real-time preview.

**When to use**: Animation easing configuration. Typically inside a CollapsiblePane in an animation surface's right panel.

---

## Recommended combinations

### Property pane for a shape

```tsx
<CollapsiblePane>
  <CollapsiblePaneHeader>
    <CollapsiblePaneLabel>Transform</CollapsiblePaneLabel>
    <HistoryControls />
  </CollapsiblePaneHeader>
  <CollapsiblePaneContent className="space-y-1">
    <ActionControls>
      <ActionLabel>X</ActionLabel>
      <NumberInput value={x} onChange={setX} onStart={pushSnapshot} />
      <ActionSeparator />
      <ActionLabel>Y</ActionLabel>
      <NumberInput value={y} onChange={setY} onStart={pushSnapshot} />
    </ActionControls>
    <ActionControls>
      <ActionLabel>W</ActionLabel>
      <NumberInput value={w} onChange={setW} min={0} onStart={pushSnapshot} />
      <ActionSeparator />
      <ActionLabel>H</ActionLabel>
      <NumberInput value={h} onChange={setH} min={0} onStart={pushSnapshot} />
    </ActionControls>
    <ActionControls>
      <ActionLabel>Rotation</ActionLabel>
      <NumberInput value={r} onChange={setR} suffix="°" onStart={pushSnapshot} />
    </ActionControls>
  </CollapsiblePaneContent>
</CollapsiblePane>
```

### Opacity control

```tsx
<ActionControls>
  <ActionLabel>Opacity</ActionLabel>
  <NumberSlider value={opacity} onChange={setOpacity} min={0} max={100} suffix="%" />
</ActionControls>
```

### Colour + blend mode row

```tsx
<ActionControls>
  <ColourPicker value={fill} onChange={setFill} />
  <Select value={blendMode} onValueChange={setBlendMode}>
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="normal">Normal</SelectItem>
      <SelectItem value="multiply">Multiply</SelectItem>
      <SelectItem value="screen">Screen</SelectItem>
    </SelectContent>
  </Select>
</ActionControls>
```

---

## Cross-references

| Need | Skill |
| --- | --- |
| Pane and panel containers | **substrate-scaffold** |
| Undo support (onStart → pushSnapshot) | **substrate-interaction** |
| Animation easing in timeline surfaces | **substrate-surfaces** |
| Node property panels | **substrate-nodes** |
