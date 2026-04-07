export const nodeEditor = {
    components: [
        "toolbar",
        "panel",
        "pane",
        "node",
        "number-input",
        "colour-picker",
        "status-bar",
        "zoom-controls",
        "command-palette",
    ],
    cssVars: `  /* Node port colours */
  --node-port-number: oklch(0.7 0.15 250);
  --node-port-string: oklch(0.7 0.15 150);
  --node-port-boolean: oklch(0.7 0.15 30);
  --node-port-colour: oklch(0.7 0.15 330);
  --node-port-vector: oklch(0.7 0.15 200);
  --node-port-image: oklch(0.7 0.15 100);
  --node-port-any: oklch(0.6 0 0);`,
    app: () => `import { useState, useCallback } from "react"
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
  Node,
  NodeHeader,
  NodeTitle,
  NodeContent,
  NodePort,
  NodeDivider,
} from "@/components/substrate/node"
import { NumberInput } from "@/components/substrate/number-input"
import { ColourPicker } from "@/components/substrate/colour-picker"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import { ZoomControls } from "@/components/substrate/zoom-controls"
import { RiCursorLine, RiHand } from "@remixicon/react"

interface NodeData {
  id: string
  type: "math" | "colour"
  label: string
  x: number
  y: number
}

const INITIAL_NODES: NodeData[] = [
  { id: "math-1", type: "math", label: "Add", x: 80, y: 100 },
  { id: "colour-1", type: "colour", label: "Mix Colour", x: 400, y: 80 },
]

function MathNode({ node, selected, onSelect }: { node: NodeData; selected: boolean; onSelect: () => void }) {
  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y }}
      onClick={onSelect}
    >
      <Node data-selected={selected || undefined}>
        <NodeHeader>
          <NodeTitle>{node.label}</NodeTitle>
        </NodeHeader>
        <NodeContent>
          <NodePort type="number" direction="input" label="A" />
          <NodePort type="number" direction="input" label="B" />
          <NodeDivider />
          <NodePort type="number" direction="output" label="Result" />
        </NodeContent>
      </Node>
    </div>
  )
}

function ColourNode({ node, selected, onSelect }: { node: NodeData; selected: boolean; onSelect: () => void }) {
  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y }}
      onClick={onSelect}
    >
      <Node data-selected={selected || undefined}>
        <NodeHeader>
          <NodeTitle>{node.label}</NodeTitle>
        </NodeHeader>
        <NodeContent>
          <NodePort type="colour" direction="input" label="Colour A" />
          <NodePort type="colour" direction="input" label="Colour B" />
          <NodePort type="number" direction="input" label="Factor" />
          <NodeDivider />
          <NodePort type="colour" direction="output" label="Result" />
        </NodeContent>
      </Node>
    </div>
  )
}

export default function App() {
  const [tool, setTool] = useState("select")
  const [zoom, setZoom] = useState(1)
  const [nodes] = useState(INITIAL_NODES)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = nodes.find((n) => n.id === selectedId) ?? null

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        {/* Node canvas */}
        <div
          className="relative flex-1 bg-canvas"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(0 0% 30%) 1px, transparent 1px)",
            backgroundSize: \`\${20 * zoom}px \${20 * zoom}px\`,
          }}
          onClick={() => setSelectedId(null)}
        >
          <div style={{ transform: \`scale(\${zoom})\`, transformOrigin: "0 0" }}>
            {nodes.map((node) =>
              node.type === "math" ? (
                <MathNode
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  onSelect={() => setSelectedId(node.id)}
                />
              ) : (
                <ColourNode
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  onSelect={() => setSelectedId(node.id)}
                />
              )
            )}

            {/* Sample SVG wire between nodes */}
            <svg className="pointer-events-none absolute inset-0 size-full">
              <path
                d="M 270 155 C 335 155, 335 135, 400 135"
                fill="none"
                stroke="hsl(0 0% 40%)"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>

        <Panel position="right">
          {selected ? (
            <Pane>
              <PaneHeader>
                <PaneLabel>{selected.label}</PaneLabel>
              </PaneHeader>
              <PaneContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium">X</label>
                    <NumberInput value={selected.x} onChange={() => {}} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Y</label>
                    <NumberInput value={selected.y} onChange={() => {}} />
                  </div>
                </div>
              </PaneContent>
            </Pane>
          ) : (
            <Pane>
              <PaneContent>
                <p className="text-sm text-muted-foreground">Click a node to inspect</p>
              </PaneContent>
            </Pane>
          )}
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup value={tool} onValueChange={setTool}>
          <ToolbarToggle value="select" tooltip="Select" shortcut="V">
            <RiCursorLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="hand" tooltip="Pan" shortcut="H">
            <RiHand className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem>Tool: {tool}</StatusBarItem>
          {selected && <StatusBarItem>Node: {selected.label}</StatusBarItem>}
        </StatusBarSection>
        <StatusBarSection>
          <ZoomControls
            zoom={zoom}
            onZoomChange={setZoom}
          />
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
};
//# sourceMappingURL=node-editor.js.map