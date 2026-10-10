import type { SurfaceConfig } from "./types.js"

export const nodeEditor: SurfaceConfig = {
  components: [
    "toolbar",
    "panel",
    "pane",
    "node",
    "number-input",
    "colour-picker",
    "status-bar",
    "zoom-controls",
  ],
  cssVars: `  /* Node port colours */
  --node-port-number: oklch(0.7 0.15 250);
  --node-port-colour: oklch(0.7 0.15 330);
  --node-port-image: oklch(0.7 0.15 100);
  --node-port-geometry: oklch(0.7 0.15 200);
  --node-port-text: oklch(0.7 0.15 150);
  --node-port-boolean: oklch(0.7 0.15 30);
  --node-port-any: oklch(0.6 0 0);`,
  app: () => `import { useEffect, useRef, useState } from "react"
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
import {
  NodeCard,
  NodeHeader,
  NodeTitle,
  NodeBadge,
  NodePorts,
  NodePort,
  NodePreview,
  NodeDivider,
  portColourVar,
  type PortType,
} from "@/components/substrate/node"
import { NumberInput } from "@/components/substrate/number-input"
import { ColourPicker } from "@/components/substrate/colour-picker"
import {
  StatusBar,
  StatusBarSection,
  StatusBarItem,
} from "@/components/substrate/status-bar"
import { ZoomControls } from "@/components/substrate/zoom-controls"
import { RiAddLine, RiCursorLine, RiDeleteBinLine, RiHand } from "@remixicon/react"

// ── Graph model ──

type NodeKind = "number" | "add" | "colour" | "mix" | "output"

interface PortSpec {
  id: string
  label: string
  type: PortType
}

interface KindSpec {
  title: string
  badge: string
  inputs: PortSpec[]
  output: PortSpec | null
}

const KINDS: Record<NodeKind, KindSpec> = {
  number: {
    title: "Number",
    badge: "Input",
    inputs: [],
    output: { id: "out", label: "Value", type: "number" },
  },
  add: {
    title: "Add",
    badge: "Math",
    inputs: [
      { id: "a", label: "A", type: "number" },
      { id: "b", label: "B", type: "number" },
    ],
    output: { id: "out", label: "Result", type: "number" },
  },
  colour: {
    title: "Colour",
    badge: "Input",
    inputs: [],
    output: { id: "out", label: "Colour", type: "colour" },
  },
  mix: {
    title: "Mix",
    badge: "Colour",
    inputs: [
      { id: "a", label: "Colour A", type: "colour" },
      { id: "b", label: "Colour B", type: "colour" },
      { id: "factor", label: "Factor", type: "number" },
    ],
    output: { id: "out", label: "Result", type: "colour" },
  },
  output: {
    title: "Output",
    badge: "Sink",
    inputs: [{ id: "value", label: "Value", type: "any" }],
    output: null,
  },
}

const ADDABLE: NodeKind[] = ["number", "add", "colour", "mix", "output"]

interface GraphNode {
  id: string
  kind: NodeKind
  x: number
  y: number
  /** Used by "number" nodes */
  value: number
  /** Used by "colour" nodes */
  colour: string
}

interface Connection {
  from: string
  to: string
  input: string
}

type Value = number | string | null

const INITIAL_NODES: GraphNode[] = [
  { id: "colour-1", kind: "colour", x: 60, y: 60, value: 0, colour: "#6366f1" },
  { id: "colour-2", kind: "colour", x: 60, y: 180, value: 0, colour: "#f59e0b" },
  { id: "number-1", kind: "number", x: 60, y: 300, value: 0.2, colour: "#ffffff" },
  { id: "number-2", kind: "number", x: 60, y: 420, value: 0.3, colour: "#ffffff" },
  { id: "add-1", kind: "add", x: 360, y: 330, value: 0, colour: "#ffffff" },
  { id: "mix-1", kind: "mix", x: 660, y: 100, value: 0, colour: "#ffffff" },
  { id: "output-1", kind: "output", x: 960, y: 100, value: 0, colour: "#ffffff" },
]

const INITIAL_CONNECTIONS: Connection[] = [
  { from: "colour-1", to: "mix-1", input: "a" },
  { from: "colour-2", to: "mix-1", input: "b" },
  { from: "number-1", to: "add-1", input: "a" },
  { from: "number-2", to: "add-1", input: "b" },
  { from: "add-1", to: "mix-1", input: "factor" },
  { from: "mix-1", to: "output-1", input: "value" },
]

// ── Evaluation ──

function parseHex(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex)
  if (!match) return [0, 0, 0]
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
}

function mixColours(a: string, b: string, factor: number): string {
  const t = Math.min(1, Math.max(0, factor))
  const from = parseHex(a)
  const to = parseHex(b)
  const channels = from.map((channel, i) => Math.round(channel + (to[i] - channel) * t))
  return "#" + channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")
}

function evaluate(id: string, nodes: GraphNode[], connections: Connection[]): Value {
  const node = nodes.find((n) => n.id === id)
  if (!node) return null

  const input = (port: string): Value => {
    const connection = connections.find((c) => c.to === id && c.input === port)
    return connection ? evaluate(connection.from, nodes, connections) : null
  }
  const numberInput = (port: string, fallback: number) => {
    const value = input(port)
    return typeof value === "number" ? value : fallback
  }
  const colourInput = (port: string, fallback: string) => {
    const value = input(port)
    return typeof value === "string" ? value : fallback
  }

  switch (node.kind) {
    case "number":
      return node.value
    case "colour":
      return node.colour
    case "add":
      return numberInput("a", 0) + numberInput("b", 0)
    case "mix":
      return mixColours(colourInput("a", "#000000"), colourInput("b", "#ffffff"), numberInput("factor", 0.5))
    case "output":
      return input("value")
  }
}

function formatValue(value: Value): string {
  if (value === null) return "–"
  if (typeof value === "number") return String(Math.round(value * 100) / 100)
  return value
}

/** True when "id" is "target" or reads from it, so connecting target -> id would loop */
function dependsOn(id: string, target: string, connections: Connection[]): boolean {
  if (id === target) return true
  return connections.some((c) => c.to === id && dependsOn(c.from, target, connections))
}

function compatible(a: PortType, b: PortType): boolean {
  return a === b || a === "any" || b === "any"
}

// ── Layout ──
// Port positions are derived from the NodeCard layout so wires can be drawn
// without measuring the DOM: header, input ports, divider, output port.

const NODE_WIDTH = 224
const BORDER = 1
const HEADER_HEIGHT = 32
const PORT_HEIGHT = 24
const PORT_GAP = 4
const PORTS_PADDING = 8

function inputPosition(node: GraphNode, index: number) {
  return {
    x: node.x,
    y: node.y + BORDER + HEADER_HEIGHT + PORTS_PADDING + index * (PORT_HEIGHT + PORT_GAP) + PORT_HEIGHT / 2,
  }
}

function outputPosition(node: GraphNode) {
  const inputs = KINDS[node.kind].inputs.length
  const inputsHeight =
    inputs > 0 ? PORTS_PADDING * 2 + inputs * PORT_HEIGHT + (inputs - 1) * PORT_GAP + 1 : 0
  return {
    x: node.x + NODE_WIDTH,
    y: node.y + BORDER + HEADER_HEIGHT + inputsHeight + PORTS_PADDING + PORT_HEIGHT / 2,
  }
}

function wirePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const bend = Math.max(40, Math.abs(to.x - from.x) / 2)
  return (
    "M " + from.x + " " + from.y +
    " C " + (from.x + bend) + " " + from.y +
    ", " + (to.x - bend) + " " + to.y +
    ", " + to.x + " " + to.y
  )
}

// ── App ──

type Tool = "select" | "hand"

type Drag =
  | { kind: "node"; id: string; startX: number; startY: number; originX: number; originY: number }
  | { kind: "pan"; startX: number; startY: number; originX: number; originY: number }

const actionButton =
  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium outline-none transition-all hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5"

export default function App() {
  const [tool, setTool] = useState<Tool>("select")
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [nodes, setNodes] = useState(INITIAL_NODES)
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  /** Node whose output port was clicked and is waiting for an input port */
  const [pendingFrom, setPendingFrom] = useState<string | null>(null)
  const drag = useRef<Drag | null>(null)
  const nextId = useRef(INITIAL_NODES.length + 1)

  const selected = nodes.find((n) => n.id === selectedId) ?? null
  const pendingType = (() => {
    const node = nodes.find((n) => n.id === pendingFrom)
    return node ? (KINDS[node.kind].output?.type ?? null) : null
  })()

  const updateNode = (id: string, patch: Partial<GraphNode>) => {
    setNodes((current) => current.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }

  const addNode = (kind: NodeKind) => {
    const id = kind + "-" + nextId.current++
    const offset = (nodes.length % 6) * 24
    const node: GraphNode = {
      id,
      kind,
      x: Math.round((200 + offset - pan.x) / zoom),
      y: Math.round((200 + offset - pan.y) / zoom),
      value: 1,
      colour: "#22c55e",
    }
    setNodes((current) => [...current, node])
    setSelectedId(id)
  }

  const removeNode = (id: string) => {
    setNodes((current) => current.filter((n) => n.id !== id))
    setConnections((current) => current.filter((c) => c.from !== id && c.to !== id))
    setSelectedId((current) => (current === id ? null : current))
    setPendingFrom((current) => (current === id ? null : current))
  }

  const handleOutputClick = (id: string) => {
    setPendingFrom((current) => (current === id ? null : id))
  }

  const handleInputClick = (node: GraphNode, port: PortSpec) => {
    const withoutPort = connections.filter((c) => !(c.to === node.id && c.input === port.id))
    if (pendingFrom === null || pendingType === null) {
      // Clicking a connected input with nothing pending disconnects it
      setConnections(withoutPort)
      return
    }
    if (!compatible(pendingType, port.type)) return
    if (dependsOn(pendingFrom, node.id, connections)) return
    setConnections([...withoutPort, { from: pendingFrom, to: node.id, input: port.id }])
    setPendingFrom(null)
  }

  // ── Pointer: drag nodes, pan the canvas ──

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.target instanceof Element)) return
    if (e.target.closest("[data-slot=node-port]")) return

    const id = e.target.closest<HTMLElement>("[data-node-id]")?.dataset.nodeId
    const node = nodes.find((n) => n.id === id)

    if (tool === "select" && node) {
      setSelectedId(node.id)
      drag.current = {
        kind: "node",
        id: node.id,
        startX: e.clientX,
        startY: e.clientY,
        originX: node.x,
        originY: node.y,
      }
      return
    }

    if (!node) {
      setSelectedId(null)
      setPendingFrom(null)
    }
    drag.current = {
      kind: "pan",
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current) return
    const dx = e.clientX - current.startX
    const dy = e.clientY - current.startY
    if (current.kind === "node") {
      updateNode(current.id, {
        x: Math.round(current.originX + dx / zoom),
        y: Math.round(current.originY + dy / zoom),
      })
    } else {
      setPan({ x: current.originX + dx, y: current.originY + dy })
    }
  }

  const endDrag = () => {
    drag.current = null
  }

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === "v") setTool("select")
      if (e.key === "h") setTool("hand")
      if (e.key === "Escape") setPendingFrom(null)
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setNodes((current) => current.filter((n) => n.id !== selectedId))
        setConnections((current) =>
          current.filter((c) => c.from !== selectedId && c.to !== selectedId),
        )
        setSelectedId(null)
        setPendingFrom(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedId])

  const gridSize = 20 * zoom

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1">
        {/* Node canvas */}
        <div
          className={
            "relative min-w-0 flex-1 touch-none select-none overflow-hidden bg-canvas " +
            (tool === "hand" ? "cursor-grab" : "cursor-default")
          }
          style={{
            backgroundImage: "radial-gradient(circle, oklch(1 0 0 / 12%) 1px, transparent 1px)",
            backgroundSize: gridSize + "px " + gridSize + "px",
            backgroundPosition: pan.x + "px " + pan.y + "px",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              transform: "translate(" + pan.x + "px, " + pan.y + "px) scale(" + zoom + ")",
              transformOrigin: "0 0",
            }}
          >
            {/* Wires */}
            <svg className="pointer-events-none absolute left-0 top-0 size-px overflow-visible">
              {connections.map((connection) => {
                const from = nodes.find((n) => n.id === connection.from)
                const to = nodes.find((n) => n.id === connection.to)
                if (!from || !to) return null
                const output = KINDS[from.kind].output
                const inputIndex = KINDS[to.kind].inputs.findIndex((p) => p.id === connection.input)
                if (!output || inputIndex === -1) return null
                return (
                  <path
                    key={connection.to + ":" + connection.input}
                    d={wirePath(outputPosition(from), inputPosition(to, inputIndex))}
                    fill="none"
                    stroke={portColourVar[output.type]}
                    strokeWidth={2}
                  />
                )
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const spec = KINDS[node.kind]
              const value = evaluate(node.id, nodes, connections)
              return (
                <NodeCard
                  key={node.id}
                  data-node-id={node.id}
                  selected={node.id === selectedId}
                  className="absolute border-border bg-card data-selected:ring-ring"
                  style={{ left: node.x, top: node.y }}
                >
                  <NodeHeader className="bg-muted">
                    <NodeTitle>{spec.title}</NodeTitle>
                    <NodeBadge>{spec.badge}</NodeBadge>
                  </NodeHeader>
                  {spec.inputs.length > 0 && (
                    <>
                      <NodePorts>
                        {spec.inputs.map((port) => {
                          const connected = connections.some(
                            (c) => c.to === node.id && c.input === port.id,
                          )
                          const accepts = pendingType !== null && compatible(pendingType, port.type)
                          return (
                            <NodePort
                              key={port.id}
                              type={port.type}
                              label={port.label}
                              direction="input"
                              connected={connected}
                              className={
                                "cursor-pointer pl-3 " +
                                (pendingType !== null && !accepts ? "opacity-40" : "")
                              }
                              onClick={() => handleInputClick(node, port)}
                            />
                          )
                        })}
                      </NodePorts>
                      {spec.output && <NodeDivider className="mx-0" />}
                    </>
                  )}
                  {spec.output && (
                    <NodePorts>
                      <NodePort
                        type={spec.output.type}
                        label={spec.output.label + "  " + formatValue(value)}
                        direction="output"
                        connected={
                          pendingFrom === node.id || connections.some((c) => c.from === node.id)
                        }
                        className={
                          "cursor-pointer pr-3 " + (pendingFrom === node.id ? "text-foreground" : "")
                        }
                        onClick={() => handleOutputClick(node.id)}
                      />
                    </NodePorts>
                  )}
                  {node.kind === "output" && (
                    <NodePreview
                      className="flex items-center justify-center text-xs tabular-nums"
                      style={typeof value === "string" ? { backgroundColor: value } : undefined}
                    >
                      {typeof value === "string" ? null : formatValue(value)}
                    </NodePreview>
                  )}
                </NodeCard>
              )
            })}
          </div>
        </div>

        <Panel position="right" className="shrink-0">
          {selected ? (
            <>
              <Pane>
                <PaneHeader>
                  <PaneLabel>{KINDS[selected.kind].title}</PaneLabel>
                  <span className="text-xs text-muted-foreground">{selected.id}</span>
                </PaneHeader>
                <PaneContent className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="X"
                    value={selected.x}
                    onChange={(x) => updateNode(selected.id, { x })}
                  />
                  <NumberInput
                    label="Y"
                    value={selected.y}
                    onChange={(y) => updateNode(selected.id, { y })}
                  />
                </PaneContent>
              </Pane>

              {selected.kind === "number" && (
                <Pane>
                  <PaneHeader>
                    <PaneLabel>Value</PaneLabel>
                  </PaneHeader>
                  <PaneContent>
                    <NumberInput
                      label="N"
                      value={selected.value}
                      step={0.05}
                      shiftStep={1}
                      onChange={(value) => updateNode(selected.id, { value })}
                    />
                  </PaneContent>
                </Pane>
              )}

              {selected.kind === "colour" && (
                <Pane>
                  <PaneHeader>
                    <PaneLabel>Colour</PaneLabel>
                  </PaneHeader>
                  <PaneContent>
                    <ColourPicker
                      value={selected.colour}
                      onChange={(colour) => updateNode(selected.id, { colour })}
                    />
                  </PaneContent>
                </Pane>
              )}

              <Pane>
                <PaneHeader>
                  <PaneLabel>Result</PaneLabel>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatValue(evaluate(selected.id, nodes, connections))}
                  </span>
                </PaneHeader>
                <PaneContent>
                  <button
                    type="button"
                    className={actionButton + " -ml-2 text-destructive"}
                    onClick={() => removeNode(selected.id)}
                  >
                    <RiDeleteBinLine />
                    Delete node
                  </button>
                </PaneContent>
              </Pane>
            </>
          ) : (
            <Pane>
              <PaneHeader>
                <PaneLabel>Inspector</PaneLabel>
              </PaneHeader>
              <PaneContent className="space-y-2 text-xs text-muted-foreground">
                <p>Select a node to edit it. Drag a node to move it, drag the background to pan.</p>
                <p>
                  Click an output port, then a matching input port, to connect them. Click a
                  connected input to disconnect it.
                </p>
              </PaneContent>
            </Pane>
          )}
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup
          value={tool}
          onValueChange={(value) => {
            if (value === "select" || value === "hand") setTool(value)
          }}
        >
          <ToolbarToggle value="select" tooltip="Select" shortcut="V" aria-label="Select">
            <RiCursorLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="hand" tooltip="Pan" shortcut="H" aria-label="Pan">
            <RiHand className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        {ADDABLE.map((kind) => (
          <button key={kind} type="button" className={actionButton} onClick={() => addNode(kind)}>
            <RiAddLine />
            {KINDS[kind].title}
          </button>
        ))}
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem>{nodes.length} nodes</StatusBarItem>
          <StatusBarItem>{connections.length} connections</StatusBarItem>
          {pendingType !== null && (
            <StatusBarItem>Connecting: pick a {pendingType} input (Esc to cancel)</StatusBarItem>
          )}
        </StatusBarSection>
        <StatusBarSection align="right">
          <ZoomControls zoom={zoom} onZoomChange={setZoom} min={0.25} max={2} />
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
}
