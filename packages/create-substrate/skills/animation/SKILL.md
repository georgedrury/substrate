# Animation

Guide to building timeline-based motion tools with Substrate — keyframe editing, easing controls, playback, and animated previews.

## When to use this surface

Use an animation surface when the app involves motion over time: UI animation prototyping, motion graphics editors, sprite animation, easing explorers, or any tool where users define how things change across a timeline.

## Surface setup

Animation tools combine a **preview stage** (where the animation plays) with a **timeline** (where keyframes are edited). The preview can be DOM-based (GSAP animating real elements) or canvas-based, depending on what's being animated.

### Dependencies

```bash
npm install gsap
```

GSAP handles the animation engine — tweening, easing, timeline sequencing. For simpler cases, CSS animations or the Web Animations API may suffice, but GSAP provides the most control for a creative tool.

### Layout

Animation tools typically use a vertical split — preview on top, timeline on the bottom:

```
┌──────────┬────────────────────────┬──────────┐
│          │                        │          │
│  Left    │   Preview stage        │  Right   │
│  panel   │   (animated elements)  │  panel   │
│          │                        │          │
│  Layers  │                        │  Props   │
│          │                        │          │
├──────────┴────────────────────────┴──────────┤
│  Timeline                                     │
│  ──●────────●──────────●─────── ▶ 0:00 / 2:00│
│  [tracks with keyframe diamonds]              │
└───────────────────────────────────────────────┘
                 [ Toolbar ]
```

## Store architecture

### Animation store

```ts
interface AnimationState {
  duration: number           // Total duration in seconds
  currentTime: number        // Playhead position
  isPlaying: boolean
  fps: number                // Preview framerate (default 60)
  layers: AnimationLayer[]
  selectedKeyframes: string[]
}

interface AnimationLayer {
  id: string
  name: string
  targetId: string           // Which element this layer animates
  property: string           // "x" | "y" | "opacity" | "scale" | "rotation" | ...
  keyframes: Keyframe[]
  visible: boolean
  locked: boolean
}

interface Keyframe {
  id: string
  time: number               // Position in seconds
  value: number
  easing: EasingType         // "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cubic-bezier" | ...
  bezierHandles?: [number, number, number, number]  // For custom cubic-bezier
}
```

### Element store

Reuse the same pattern as the 2D canvas document store, but elements here represent animated objects on the stage rather than static shapes. Each element has base properties that keyframes override at specific times.

## Timeline component

The timeline is the core component that's unique to animation surfaces. It needs:

- **Playhead** — a draggable vertical line showing current time, scrubbable
- **Tracks** — one row per animated property, showing keyframe diamonds
- **Keyframe diamonds** — draggable markers at specific times, selectable
- **Zoom** — horizontal zoom to see more or fewer seconds
- **Rulers** — time markings along the top (seconds/frames)
- **Playback controls** — play/pause, jump to start/end, loop toggle

### Interaction model

The timeline uses horizontal dragging extensively:

- Drag the playhead to scrub through time
- Drag a keyframe diamond to move it in time
- Shift-click keyframes to multi-select
- Double-click a track to add a keyframe at that time
- Right-click a keyframe for easing options

This is pointer-event-driven, similar to the 2D canvas interaction model but on a 1D (time) axis rather than 2D space. Consider a dedicated `useTimelineInteraction` hook following the same state machine pattern as `useCanvasInteraction`.

## Wiring to Substrate chrome

### Toolbar

| Tool | Purpose | Shortcut |
|---|---|---|
| Select | Select keyframes on timeline | V |
| Add keyframe | Click on timeline to add | K |
| Play/Pause | Toggle playback | Space |
| Jump to start | Move playhead to 0 | Home |
| Jump to end | Move playhead to duration | End |
| Loop | Toggle loop playback | L |

### Left panel — layers

List animation layers (one per animated property per element). Show: element name, property name, visibility toggle, lock toggle. Group layers by element.

### Right panel — keyframe properties

When a keyframe is selected, show:

- **Time pane** — exact time position (number input)
- **Value pane** — the property value at this keyframe
- **Easing pane** — easing type dropdown plus a visual curve editor for cubic-bezier
- **Interpolation** — linear vs smooth vs step

The easing curve editor is a specialised pane — a small canvas showing the bezier curve with draggable control points.

## Preview stage

The preview stage renders the current state of the animation at `currentTime`. On each frame:

1. Read `currentTime` from the animation store
2. For each layer, interpolate between the surrounding keyframes using the specified easing
3. Apply interpolated values to the corresponding elements
4. Render the stage

During playback, a `requestAnimationFrame` loop advances `currentTime` at the configured FPS.

### Using GSAP

GSAP's timeline can be built from the keyframe data and scrubbed to `currentTime`:

```ts
// Build a GSAP timeline from store data
const tl = gsap.timeline({ paused: true })

for (const layer of layers) {
  for (let i = 0; i < layer.keyframes.length - 1; i++) {
    const from = layer.keyframes[i]
    const to = layer.keyframes[i + 1]
    tl.to(targetRef, {
      [layer.property]: to.value,
      duration: to.time - from.time,
      ease: to.easing,
    }, from.time)
  }
}

// Scrub to current time
tl.seek(currentTime)
```

Rebuild the GSAP timeline when keyframes change. Seek to `currentTime` on every frame during playback and when the user scrubs.

## Keyboard shortcuts

- Space — play/pause
- K — add keyframe at current time for selected property
- Delete — remove selected keyframes
- Cmd+Z / Cmd+Shift+Z — undo/redo
- Left/Right arrows — step forward/back one frame
- Shift+Left/Right — step forward/back 10 frames
- Home/End — jump to start/end

## Theming

The preview stage uses `bg-canvas`. The timeline area can use `bg-panel` or a slightly different shade. Keyframe diamonds, playhead, and track colours should be configurable — consider additional CSS variables like `--timeline-playhead`, `--timeline-keyframe`, `--timeline-track`.

## What to build

Some examples of what this surface enables:

- **UI animation prototyper** — animate component properties (opacity, position, scale), export CSS/GSAP code
- **Easing explorer** — visual comparison of different easing functions, interactive curve editor
- **Sprite animator** — frame-by-frame sprite animation with onion skinning
- **Motion graphics tool** — animate text and shapes along paths with timing controls
- **Transition builder** — design page/component transitions, preview at different speeds

## Related reference skills

- **substrate-scaffold** — Toolbar, Panel, StatusBar for the app shell
- **substrate-controls** — NumberInput, Slider, EasingCurveEditor, ActionControls for keyframe properties
- **substrate-interaction** — useUndoable, createKeyboardShortcuts, LayerList for animation layers
