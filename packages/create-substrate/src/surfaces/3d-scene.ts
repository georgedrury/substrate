import type { SurfaceConfig } from "./types.js"

export const scene3d: SurfaceConfig = {
  components: [
    "toolbar",
    "panel",
    "pane",
    "slider",
    "number-input",
    "colour-picker",
    "status-bar",
  ],
  extraDeps: {
    three: "^0.170.0",
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.117.0",
  },
  extraDevDeps: {
    "@types/three": "^0.170.0",
  },
  app: () => `import { useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Environment } from "@react-three/drei"
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
  PaneContent,
} from "@/components/substrate/pane"
import { NumberInput } from "@/components/substrate/number-input"
import { Slider } from "@/components/substrate/slider"
import { ColourPicker } from "@/components/substrate/colour-picker"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import {
  RiCursorLine,
  RiDragMoveLine,
  RiRefreshLine,
  RiExpandDiagonal2Line,
} from "@remixicon/react"

interface SceneObject {
  id: string
  type: "box" | "sphere"
  position: [number, number, number]
  colour: string
  roughness: number
}

const INITIAL_OBJECTS: SceneObject[] = [
  { id: "box-1", type: "box", position: [-1.5, 0.5, 0], colour: "#6366f1", roughness: 0.4 },
  { id: "sphere-1", type: "sphere", position: [1.5, 0.6, 0], colour: "#f43f5e", roughness: 0.2 },
]

function SceneMesh({
  object,
  selected,
  onSelect,
}: {
  object: SceneObject
  selected: boolean
  onSelect: () => void
}) {
  return (
    <mesh position={object.position} onClick={onSelect}>
      {object.type === "box" ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <sphereGeometry args={[0.6, 32, 32]} />
      )}
      <meshStandardMaterial
        color={object.colour}
        roughness={object.roughness}
        emissive={selected ? "#ffffff" : "#000000"}
        emissiveIntensity={selected ? 0.05 : 0}
      />
    </mesh>
  )
}

export default function App() {
  const [mode, setMode] = useState("select")
  const [objects, setObjects] = useState(INITIAL_OBJECTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = objects.find((o) => o.id === selectedId) ?? null

  function updateSelected(patch: Partial<SceneObject>) {
    if (!selectedId) return
    setObjects((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, ...patch } : o))
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 bg-canvas">
          <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 8, 5]} intensity={1} />
            <Environment preset="studio" />
            <Grid infiniteGrid fadeDistance={20} cellColor="#333" sectionColor="#555" />
            <OrbitControls makeDefault />
            {objects.map((obj) => (
              <SceneMesh
                key={obj.id}
                object={obj}
                selected={obj.id === selectedId}
                onSelect={() => setSelectedId(obj.id)}
              />
            ))}
          </Canvas>
        </div>

        <Panel position="right">
          {selected ? (
            <>
              <Pane>
                <PaneHeader>
                  <PaneLabel>Position</PaneLabel>
                </PaneHeader>
                <PaneContent>
                  <div className="grid grid-cols-3 gap-2">
                    <NumberInput label="X" value={selected.position[0]} step={0.1} onChange={(v) => updateSelected({ position: [v, selected.position[1], selected.position[2]] })} />
                    <NumberInput label="Y" value={selected.position[1]} step={0.1} onChange={(v) => updateSelected({ position: [selected.position[0], v, selected.position[2]] })} />
                    <NumberInput label="Z" value={selected.position[2]} step={0.1} onChange={(v) => updateSelected({ position: [selected.position[0], selected.position[1], v] })} />
                  </div>
                </PaneContent>
              </Pane>
              <Pane>
                <PaneHeader>
                  <PaneLabel>Material</PaneLabel>
                </PaneHeader>
                <PaneContent className="space-y-3">
                  <ColourPicker value={selected.colour} onChange={(c) => updateSelected({ colour: c })} />
                  <Slider label="Roughness" min={0} max={1} step={0.01} value={[selected.roughness]} onValueChange={([v]) => updateSelected({ roughness: v })} />
                </PaneContent>
              </Pane>
            </>
          ) : (
            <Pane>
              <PaneContent>
                <p className="text-sm text-muted-foreground">Click an object to inspect</p>
              </PaneContent>
            </Pane>
          )}
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup value={mode} onValueChange={setMode}>
          <ToolbarToggle value="select" tooltip="Select" shortcut="V">
            <RiCursorLine className="size-4" />
          </ToolbarToggle>
          <ToolbarSeparator />
          <ToolbarToggle value="translate" tooltip="Translate" shortcut="G">
            <RiDragMoveLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="rotate" tooltip="Rotate" shortcut="R">
            <RiRefreshLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="scale" tooltip="Scale" shortcut="S">
            <RiExpandDiagonal2Line className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem label="Mode" value={mode} />
          {selected && <StatusBarItem label="Selected" value={selected.id} />}
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
}
