export const canvas2d = {
    components: [
        "design-canvas",
        "toolbar",
        "panel",
        "pane",
        "slider",
        "layer-list",
        "number-input",
        "colour-picker",
        "history-controls",
        "status-bar",
        "zoom-controls",
    ],
    app: () => `import { useState } from "react"
import { DesignCanvas } from "@/components/substrate/design-canvas"
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
import { LayerList, LayerItem, LayerIcon, LayerName } from "@/components/substrate/layer-list"
import { NumberInput } from "@/components/substrate/number-input"
import { ColourPicker } from "@/components/substrate/colour-picker"
import { HistoryControls } from "@/components/substrate/history-controls"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import { ZoomControls } from "@/components/substrate/zoom-controls"
import {
  RiCursorLine,
  RiHand,
  RiSquareLine,
  RiCircleLine,
  RiSubtractLine,
  RiText,
  RiArtboard2Line,
} from "@remixicon/react"

const TOOLS = [
  { value: "select", icon: RiCursorLine, label: "Select", shortcut: "V" },
  { value: "hand", icon: RiHand, label: "Hand", shortcut: "H" },
  "separator",
  { value: "rectangle", icon: RiSquareLine, label: "Rectangle", shortcut: "R" },
  { value: "ellipse", icon: RiCircleLine, label: "Ellipse", shortcut: "O" },
  { value: "line", icon: RiSubtractLine, label: "Line", shortcut: "L" },
  { value: "text", icon: RiText, label: "Text", shortcut: "T" },
  { value: "frame", icon: RiArtboard2Line, label: "Frame", shortcut: "F" },
] as const

export default function App() {
  const [tool, setTool] = useState("select")
  const [zoom, setZoom] = useState(1)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [w, setW] = useState(100)
  const [h, setH] = useState(100)
  const [fill, setFill] = useState("#6366f1")

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        <Panel position="left">
          <Pane>
            <PaneHeader>
              <PaneLabel>Layers</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <LayerList>
                <LayerItem>
                  <LayerIcon><RiSquareLine className="size-3.5" /></LayerIcon>
                  <LayerName>Rectangle 1</LayerName>
                </LayerItem>
                <LayerItem>
                  <LayerIcon><RiCircleLine className="size-3.5" /></LayerIcon>
                  <LayerName>Ellipse 1</LayerName>
                </LayerItem>
              </LayerList>
            </PaneContent>
          </Pane>
        </Panel>

        <DesignCanvas />

        <Panel position="right">
          <Pane>
            <PaneHeader>
              <PaneLabel>Transform</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="X" value={x} onChange={setX} />
                <NumberInput label="Y" value={y} onChange={setY} />
                <NumberInput label="W" value={w} onChange={setW} />
                <NumberInput label="H" value={h} onChange={setH} />
              </div>
            </PaneContent>
          </Pane>
          <Pane>
            <PaneHeader>
              <PaneLabel>Fill</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <ColourPicker value={fill} onChange={setFill} />
            </PaneContent>
          </Pane>
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup value={tool} onValueChange={setTool}>
          {TOOLS.map((t, i) =>
            t === "separator" ? (
              <ToolbarSeparator key={i} />
            ) : (
              <ToolbarToggle key={t.value} value={t.value} tooltip={t.label} shortcut={t.shortcut}>
                <t.icon className="size-4" />
              </ToolbarToggle>
            )
          )}
        </ToolbarToggleGroup>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem>Tool: {tool}</StatusBarItem>
        </StatusBarSection>
        <StatusBarSection>
          <HistoryControls size="sm" />
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
};
//# sourceMappingURL=canvas-2d.js.map