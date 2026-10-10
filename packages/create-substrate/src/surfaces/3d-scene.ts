import type { SurfaceConfig } from "./types.js"

export const scene3d: SurfaceConfig = {
  components: [
    "toolbar",
    "panel",
    "pane",
    "action",
    "slider",
    "number-input",
    "colour-picker",
    "status-bar",
  ],
  extraDeps: {
    three: "^0.172.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
  },
  extraDevDeps: {
    "@types/three": "^0.172.0",
  },
  app: () => `import { useEffect, useRef, useState } from "react"
import type { Mesh } from "three"
import { Canvas } from "@react-three/fiber"
import { Grid, OrbitControls, TransformControls } from "@react-three/drei"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
  ToolbarSeparator,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import {
  Pane,
  PaneHeader,
  PaneLabel,
  PaneAction,
  PaneContent,
} from "@/components/substrate/pane"
import { Action, ActionLabel, ActionControls } from "@/components/substrate/action"
import { NumberInput } from "@/components/substrate/number-input"
import { Slider } from "@/components/substrate/slider"
import { ColourPicker } from "@/components/substrate/colour-picker"
import {
  StatusBar,
  StatusBarSection,
  StatusBarItem,
  StatusBarSeparator,
} from "@/components/substrate/status-bar"
import {
  RiBox3Line,
  RiCursorLine,
  RiDeleteBinLine,
  RiDragMoveLine,
  RiExpandDiagonal2Line,
  RiGlobeLine,
  RiRefreshLine,
} from "@remixicon/react"

type Vec3 = [number, number, number]
type Mode = "select" | "translate" | "rotate" | "scale"
type Shape = "box" | "sphere"

interface SceneObject {
  id: string
  name: string
  shape: Shape
  position: Vec3
  rotation: Vec3
  scale: Vec3
  colour: string
  roughness: number
  metalness: number
}

const MODES: Mode[] = ["select", "translate", "rotate", "scale"]
const MODE_KEYS: Record<string, Mode> = {
  v: "select",
  g: "translate",
  r: "rotate",
  s: "scale",
}
const AXES = ["X", "Y", "Z"] as const
const COLOURS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#0ea5e9"]

const INITIAL_OBJECTS: SceneObject[] = [
  {
    id: "box-1",
    name: "Box 1",
    shape: "box",
    position: [-1.5, 0.5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    colour: "#6366f1",
    roughness: 0.4,
    metalness: 0.1,
  },
  {
    id: "sphere-1",
    name: "Sphere 1",
    shape: "sphere",
    position: [1.5, 0.6, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    colour: "#f43f5e",
    roughness: 0.2,
    metalness: 0.1,
  },
]

const toolbarButton =
  "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 outline-none transition-all hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"

function isMode(value: string): value is Mode {
  return MODES.some((mode) => mode === value)
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function withAxis(vector: Vec3, axis: number, value: number): Vec3 {
  const next: Vec3 = [vector[0], vector[1], vector[2]]
  next[axis] = value
  return next
}

function SceneMesh({
  object,
  selected,
  mode,
  onSelect,
  onTransform,
}: {
  object: SceneObject
  selected: boolean
  mode: Mode
  onSelect: () => void
  onTransform: (patch: Pick<SceneObject, "position" | "rotation" | "scale">) => void
}) {
  const [mesh, setMesh] = useState<Mesh | null>(null)

  return (
    <>
      <mesh
        ref={setMesh}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={(event) => {
          event.stopPropagation()
          onSelect()
        }}
      >
        {object.shape === "box" ? (
          <boxGeometry args={[1, 1, 1]} />
        ) : (
          <sphereGeometry args={[0.6, 32, 32]} />
        )}
        <meshStandardMaterial
          color={object.colour}
          roughness={object.roughness}
          metalness={object.metalness}
          emissive={selected ? "#ffffff" : "#000000"}
          emissiveIntensity={selected ? 0.08 : 0}
        />
      </mesh>
      {mesh && selected && mode !== "select" && (
        <TransformControls
          object={mesh}
          mode={mode}
          onObjectChange={() =>
            onTransform({
              position: [mesh.position.x, mesh.position.y, mesh.position.z],
              rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
              scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
            })
          }
        />
      )}
    </>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>("select")
  const [objects, setObjects] = useState(INITIAL_OBJECTS)
  const [selectedId, setSelectedId] = useState<string | null>("box-1")
  const [lightIntensity, setLightIntensity] = useState(1.5)
  const nextIndex = useRef(INITIAL_OBJECTS.length + 1)

  const selected = objects.find((object) => object.id === selectedId) ?? null

  function updateObject(id: string, patch: Partial<SceneObject>) {
    setObjects((prev) =>
      prev.map((object) => (object.id === id ? { ...object, ...patch } : object)),
    )
  }

  function addObject(shape: Shape) {
    const index = nextIndex.current++
    const object: SceneObject = {
      id: \`\${shape}-\${index}\`,
      name: \`\${shape === "box" ? "Box" : "Sphere"} \${index}\`,
      shape,
      position: [(index % 5) - 2, shape === "box" ? 0.5 : 0.6, 1.5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      colour: COLOURS[index % COLOURS.length],
      roughness: 0.4,
      metalness: 0.1,
    }
    setObjects((prev) => [...prev, object])
    setSelectedId(object.id)
  }

  function removeObject(id: string) {
    setObjects((prev) => prev.filter((object) => object.id !== id))
    setSelectedId((current) => (current === id ? null : current))
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return
      }
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return

      const nextMode = MODE_KEYS[event.key.toLowerCase()]
      if (nextMode) {
        setMode(nextMode)
      } else if (event.key === "Escape") {
        setSelectedId(null)
      } else if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        removeObject(selectedId)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedId])

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 bg-canvas">
          <Canvas
            camera={{ position: [4, 3, 5], fov: 50 }}
            onPointerMissed={() => {
              if (mode === "select") setSelectedId(null)
            }}
          >
            <ambientLight intensity={0.6} />
            <hemisphereLight args={["#ffffff", "#444444", 0.6]} />
            <directionalLight position={[5, 8, 5]} intensity={lightIntensity} />
            <Grid infiniteGrid fadeDistance={25} cellColor="#333333" sectionColor="#555555" />
            <OrbitControls makeDefault />
            {objects.map((object) => (
              <SceneMesh
                key={object.id}
                object={object}
                selected={object.id === selectedId}
                mode={mode}
                onSelect={() => setSelectedId(object.id)}
                onTransform={(patch) => updateObject(object.id, patch)}
              />
            ))}
          </Canvas>

          <Toolbar className="absolute bottom-4">
            <ToolbarToggleGroup
              value={mode}
              onValueChange={(value) => {
                if (isMode(value)) setMode(value)
              }}
            >
              <ToolbarToggle value="select" tooltip="Select" shortcut="V">
                <RiCursorLine className="size-4" />
              </ToolbarToggle>
              <ToolbarSeparator />
              <ToolbarToggle value="translate" tooltip="Move" shortcut="G">
                <RiDragMoveLine className="size-4" />
              </ToolbarToggle>
              <ToolbarToggle value="rotate" tooltip="Rotate" shortcut="R">
                <RiRefreshLine className="size-4" />
              </ToolbarToggle>
              <ToolbarToggle value="scale" tooltip="Scale" shortcut="S">
                <RiExpandDiagonal2Line className="size-4" />
              </ToolbarToggle>
            </ToolbarToggleGroup>
            <ToolbarSeparator />
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Add box"
                title="Add box"
                className={toolbarButton}
                onClick={() => addObject("box")}
              >
                <RiBox3Line className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Add sphere"
                title="Add sphere"
                className={toolbarButton}
                onClick={() => addObject("sphere")}
              >
                <RiGlobeLine className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Delete selected"
                title="Delete selected"
                className={toolbarButton}
                disabled={!selected}
                onClick={() => {
                  if (selected) removeObject(selected.id)
                }}
              >
                <RiDeleteBinLine className="size-4" />
              </button>
            </div>
          </Toolbar>
        </div>

        <Panel position="right">
          <Pane>
            <PaneHeader>
              <PaneLabel>Scene</PaneLabel>
            </PaneHeader>
            <PaneContent className="space-y-1">
              {objects.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No objects. Add one from the toolbar.
                </p>
              )}
              {objects.map((object) => (
                <button
                  key={object.id}
                  type="button"
                  onClick={() => setSelectedId(object.id)}
                  className={
                    object.id === selectedId
                      ? "flex h-7 w-full items-center gap-2 rounded-md bg-accent px-2 text-xs text-accent-foreground"
                      : "flex h-7 w-full items-center gap-2 rounded-md px-2 text-xs hover:bg-accent/50"
                  }
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: object.colour }}
                  />
                  {object.name}
                </button>
              ))}
            </PaneContent>
          </Pane>

          <Pane>
            <PaneHeader>
              <PaneLabel>Lighting</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <Action>
                <ActionLabel>Intensity</ActionLabel>
                <ActionControls>
                  <Slider
                    min={0}
                    max={4}
                    step={0.05}
                    value={[lightIntensity]}
                    onValueChange={([value]) => setLightIntensity(value)}
                  />
                </ActionControls>
              </Action>
            </PaneContent>
          </Pane>

          {selected ? (
            <>
              <Pane>
                <PaneHeader>
                  <PaneLabel>Transform</PaneLabel>
                  <PaneAction
                    aria-label="Reset transform"
                    title="Reset transform"
                    onClick={() =>
                      updateObject(selected.id, { rotation: [0, 0, 0], scale: [1, 1, 1] })
                    }
                  >
                    <RiRefreshLine />
                  </PaneAction>
                </PaneHeader>
                <PaneContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">Position</div>
                  <div className="grid grid-cols-3 gap-2">
                    {AXES.map((axis, index) => (
                      <NumberInput
                        key={axis}
                        label={axis}
                        step={0.1}
                        value={selected.position[index]}
                        onChange={(value) =>
                          updateObject(selected.id, {
                            position: withAxis(selected.position, index, value),
                          })
                        }
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">Rotation</div>
                  <div className="grid grid-cols-3 gap-2">
                    {AXES.map((axis, index) => (
                      <NumberInput
                        key={axis}
                        label={axis}
                        step={1}
                        precision={1}
                        value={toDegrees(selected.rotation[index])}
                        onChange={(value) =>
                          updateObject(selected.id, {
                            rotation: withAxis(selected.rotation, index, toRadians(value)),
                          })
                        }
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">Scale</div>
                  <div className="grid grid-cols-3 gap-2">
                    {AXES.map((axis, index) => (
                      <NumberInput
                        key={axis}
                        label={axis}
                        step={0.1}
                        min={0.01}
                        value={selected.scale[index]}
                        onChange={(value) =>
                          updateObject(selected.id, {
                            scale: withAxis(selected.scale, index, value),
                          })
                        }
                      />
                    ))}
                  </div>
                </PaneContent>
              </Pane>

              <Pane>
                <PaneHeader>
                  <PaneLabel>Material</PaneLabel>
                </PaneHeader>
                <PaneContent className="space-y-2">
                  <Action>
                    <ActionLabel>Colour</ActionLabel>
                    <ActionControls>
                      <ColourPicker
                        value={selected.colour}
                        onChange={(colour) => updateObject(selected.id, { colour })}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {selected.colour}
                      </span>
                    </ActionControls>
                  </Action>
                  <Action>
                    <ActionLabel>Roughness</ActionLabel>
                    <ActionControls>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[selected.roughness]}
                        onValueChange={([value]) =>
                          updateObject(selected.id, { roughness: value })
                        }
                      />
                    </ActionControls>
                  </Action>
                  <Action>
                    <ActionLabel>Metalness</ActionLabel>
                    <ActionControls>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[selected.metalness]}
                        onValueChange={([value]) =>
                          updateObject(selected.id, { metalness: value })
                        }
                      />
                    </ActionControls>
                  </Action>
                </PaneContent>
              </Pane>
            </>
          ) : (
            <Pane>
              <PaneContent>
                <p className="text-xs text-muted-foreground">
                  Click an object to inspect it.
                </p>
              </PaneContent>
            </Pane>
          )}
        </Panel>
      </div>

      <StatusBar>
        <StatusBarSection align="left">
          <StatusBarItem>Mode: {mode}</StatusBarItem>
          <StatusBarSeparator />
          <StatusBarItem>
            {objects.length} {objects.length === 1 ? "object" : "objects"}
          </StatusBarItem>
        </StatusBarSection>
        <StatusBarSection align="right">
          <StatusBarItem>{selected ? selected.name : "Nothing selected"}</StatusBarItem>
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
}
