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

| Child slot       | Styling applied                      |
| ---------------- | ------------------------------------ |
| `number-input`   | Strips border, sets `bg-transparent` |
| `select-trigger` | Strips border, sets `bg-transparent` |
| `colour-swatch`  | `size-4`, removes border             |
| `slider`         | Removes border                       |

**Exports**: `Action`, `ActionLabel`, `ActionControls`

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

### Controls and useControls

`registry/substrate/components/controls.tsx`, `registry/substrate/hooks/use-controls.ts`

Config-driven panels. Describe parameters as an object, get typed values back, and render every panel with `<Controls />`. Built on DialKit's headless store; the rows are the Substrate controls below.

```tsx
const chart = useControls("Chart", {
	months: [12, 3, 12, 1], // [default, min, max, step]
	grid: true,
	colour: "#a78bfa",
	metric: { type: "select", options: ["revenue", "users"] },
	style: { strokeWidth: [2, 1, 6] }, // nested object = collapsible folder
})

<Panel>
	<Controls />
</Panel>
```

**Config types**: number tuple or bare number (NumberSlider), boolean (Toggle), string (TextArea), hex string (ColourPicker), `{ type: "select" }`, `{ type: "easing" }` (EasingCurveEditor), `{ type: "spring" }` with `visualDuration`/`bounce` or `stiffness`/`damping`/`mass` (SpringEditor; easing and spring share a row with a type switch), `{ type: "image", options }` (ImagePicker, uploads become data URLs), `{ type: "pad", x, y }` with slider-style axis tuples (XYPad, returns `{ x, y }`, positive y is up), `{ type: "action" }` with the `onAction` option, nested object (folder).

**Options**: `id`, `persist`, `onAction`, `shortcuts` (by control path, e.g. `{ radius: { key: "r" }, visible: { key: "v" } }`: hold a slider's key and scroll, or `interaction: "drag"`/`"move"`; press a toggle's key). **Controls prop**: `panel` to render a single panel by name. Each panel header has a versions menu (DialKit presets), a copy button that copies the values as an agent instruction, and reset.

**Setting values from code**: `useControlsController` returns `{ values, setValues, reset }` for loading saved state or presets.

**Values that belong to a selection**: mount a small component with `key={selected.id}` that seeds its config from the selected item (hold it in `useState` so it is built once) and writes `useControls` values back in an effect. Only do this when nothing else edits those values while the item is selected.

**When to use**: The default for any panel of tunable parameters with local state – chart settings, generation parameters, material properties. Compose the individual controls by hand instead when values live in a store with selection and undo (as in the design editor's property panes), or when a row needs a custom layout.

---

### ControlsTimeline and useControlsTimeline

`registry/substrate/components/controls-timeline.tsx`, `registry/substrate/hooks/use-controls-timeline.ts`

Animation clips defined in code, tuned in a timeline editor. Built on DialKit's headless timeline. Bind `timeline.<clip>.current` to style so the UI follows the playhead; `<ControlsTimeline />` scrubs, moves and resizes clips and edits their values in a popover.

```tsx
const timeline = useControlsTimeline("Card", {
	enter: { at: 0, duration: 0.6, from: { y: 24, opacity: 0 }, to: { y: 0, opacity: 1 }, transition: { type: "spring", visualDuration: 0.5, bounce: 0.2 } },
	badge: { at: 0.6, from: { scale: 0 }, steps: [{ duration: 0.2, to: { scale: 1.2 } }, { duration: 0.2, to: { scale: 1 } }] },
	glow: { at: 1, props: { blur: { from: 0, to: 24, duration: 0.6 } } },
}, { loop: true })

<div style={{ opacity: timeline.enter.current.opacity }} />
<ControlsTimeline />
```

**Options**: `id`, `persist`, `autoplay` (default true), `loop` (`true` or `{ from }`). **Controls**: `play`, `pause`, `replay`, `seek`.

**When to use**: tuning entrance and choreography timing by eye. Once tuned, copy the values and move them into the production animation.

---

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

Colour picker with a hex input. `value` accepts any CSS colour (hex, `oklch()`, `rgb()`, named) and `onChange` returns hex; `onStart` fires when a drag or edit begins, for undo snapshots. The swatch trigger renders `data-slot="colour-swatch"` for slot-aware composition.

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
			<ActionLabel>Y</ActionLabel>
			<NumberInput value={y} onChange={setY} onStart={pushSnapshot} />
		</ActionControls>
		<ActionControls>
			<ActionLabel>W</ActionLabel>
			<NumberInput value={w} onChange={setW} min={0} onStart={pushSnapshot} />
			<ActionLabel>H</ActionLabel>
			<NumberInput value={h} onChange={setH} min={0} onStart={pushSnapshot} />
		</ActionControls>
		<ActionControls>
			<ActionLabel>Rotation</ActionLabel>
			<NumberInput
				value={r}
				onChange={setR}
				suffix="°"
				onStart={pushSnapshot}
			/>
		</ActionControls>
	</CollapsiblePaneContent>
</CollapsiblePane>
```

### Opacity control

```tsx
<ActionControls>
	<ActionLabel>Opacity</ActionLabel>
	<NumberSlider
		value={opacity}
		onChange={setOpacity}
		min={0}
		max={100}
		suffix="%"
	/>
</ActionControls>
```

### Colour + blend mode row

```tsx
<ActionControls>
	<ColourPicker value={fill} onChange={setFill} />
	<Select value={blendMode} onValueChange={setBlendMode}>
		<SelectTrigger>
			<SelectValue />
		</SelectTrigger>
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

| Need                                  | Skill                     |
| ------------------------------------- | ------------------------- |
| Pane and panel containers             | **substrate-scaffold**    |
| Undo support (onStart → pushSnapshot) | **substrate-interaction** |
| Animation easing in timeline surfaces | **substrate-surfaces**    |
| Node property panels                  | **substrate-nodes**       |
