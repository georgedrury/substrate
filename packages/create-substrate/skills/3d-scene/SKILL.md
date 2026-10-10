---
name: 3d-scene
description: "Build interactive 3D viewports with Substrate — scene graphs, orbit cameras, object placement, materials, and lighting. Use when the app involves spatial objects in three dimensions. Triggers on: 3D, scene, viewport, three.js, react-three-fiber, r3f, orbit camera, material editor, lighting, shader playground, product viewer, scene graph."
user-invocable: true
---

# 3D scene

Guide to building interactive 3D viewports with Substrate — object placement, orbit cameras, material editors, and lighting controls.

## When to use this surface

Use a 3D scene when the app involves spatial objects in three dimensions: product viewers, architectural walkthroughs, particle systems, shader playgrounds, or any tool where users orbit, zoom, and interact with a scene graph.

## Surface setup

The 3D viewport lives inside the Substrate layout where the canvas would normally go. Use Three.js (via `@react-three/fiber` and `@react-three/drei`) as the rendering engine.

### Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

### Mount the viewport

Create a surface component that fills the available space between panels:

```tsx
"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Environment } from "@react-three/drei"

export function SceneViewport() {
  return (
    <div className="absolute inset-0 bg-canvas">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <OrbitControls makeDefault />
        <Grid infiniteGrid fadeDistance={50} />
        <Environment preset="studio" />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {/* Scene objects render here */}
      </Canvas>
    </div>
  )
}
```

Drop this into the playground layout in place of `<DesignCanvas />`.

## Store architecture

Create a Zustand scene store to manage the 3D scene graph. This follows the same pattern as `document-store` but for 3D objects:

```ts
interface SceneObject {
  id: string
  name: string
  type: "mesh" | "light" | "group" | "camera"
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  geometry?: "box" | "sphere" | "cylinder" | "plane" | "torus" | "custom"
  material?: MaterialConfig
  visible: boolean
  locked: boolean
  children?: string[]
}
```

Store actions should include: `addObject`, `removeObject`, `updateObject`, `selectObject`, `pushSnapshot` (for undo/redo). Use the same snapshot-based undo pattern as the 2D canvas.

## Wiring to Substrate chrome

### Toolbar

Map toolbar toggles to 3D-specific modes:

| Tool | Purpose | Shortcut |
|---|---|---|
| Select | Click objects in the viewport | V |
| Move | Translate selected object(s) | G |
| Rotate | Rotate selected object(s) | R |
| Scale | Scale selected object(s) | S |
| Add | Open an add menu (cube, sphere, light, etc.) | Shift+A |

Use `useToolStore` — the same store the 2D canvas uses. The tool type union can be extended with 3D-specific modes.

### Panels

**Left panel — scene hierarchy:**

A tree view of the scene graph. Each node shows name, type icon, and visibility toggle. Clicking selects the object in the viewport. This follows the same pattern as the layers panel but supports nesting (groups/parent-child).

**Right panel — properties inspector:**

Use the Pane/Action/Slider compound components to expose:

- **Transform pane** — X/Y/Z position, rotation (degrees), scale with number inputs
- **Geometry pane** — type-specific properties (radius, segments, width/height/depth)
- **Material pane** — colour picker, metalness/roughness sliders, texture upload
- **Light pane** (when a light is selected) — intensity slider, colour, shadow toggle

### Keyboard shortcuts

Extend `useKeyboardShortcuts` or create a `use3DShortcuts` hook:

- Delete — remove selected object
- Cmd+Z / Cmd+Shift+Z — undo/redo via snapshot store
- Cmd+D — duplicate selected
- H — toggle visibility of selected
- Numpad shortcuts for camera views (front/top/right) if desired

## Interaction patterns

### Object selection

`@react-three/fiber` provides `onPointerDown` on mesh components. Use raycasting (built into R3F) rather than manual hit-testing:

```tsx
<mesh
  onClick={(e) => {
    e.stopPropagation()
    sceneStore.selectObject(object.id, e.shiftKey)
  }}
>
  {/* geometry + material */}
</mesh>
```

### Transform gizmos

Use `@react-three/drei`'s `TransformControls` for move/rotate/scale. Wire the active mode to `useToolStore`:

```tsx
{selectedId && (
  <TransformControls
    object={selectedRef}
    mode={activeTool === "rotate" ? "rotate" : activeTool === "scale" ? "scale" : "translate"}
    onObjectChange={() => sceneStore.updateFromRef(selectedId, selectedRef)}
  />
)}
```

### Camera

`OrbitControls` handles orbit/zoom/pan. Disable it when a transform gizmo is active to prevent conflicts. The hand tool can temporarily enable a fly/walk camera mode.

## Theming

The 3D viewport background can read `--canvas` via CSS on the container div. For the Three.js scene background, read it from the DOM:

```ts
const style = getComputedStyle(document.documentElement)
const bg = style.getPropertyValue("--canvas").trim()
// Convert to Three.js colour and set scene.background
```

Grid, gizmo, and selection highlight colours can be configured as constants or driven by additional CSS variables.

## What to build

Some examples of what this surface enables:

- **Product configurator** — load a 3D model, expose material/colour options in panes, orbit to inspect
- **Scene builder** — add primitives, position them, set up lighting, export as glTF
- **Shader playground** — custom `ShaderMaterial` with uniforms exposed as sliders in the properties panel
- **Particle system editor** — particle emitter properties as pane controls, real-time preview in the viewport
- **Architectural viewer** — import a model, add measurement tools, annotate with text labels

## Related reference skills

- **substrate-scaffold** — Toolbar, Panel, StatusBar, ZoomControls for the app shell
- **substrate-controls** — NumberInput, Slider, ColourPicker, ActionControls for property panes
- **substrate-interaction** — useUndoable, useClipboard, createKeyboardShortcuts, TreeList for scene hierarchy
