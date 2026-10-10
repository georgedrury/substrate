import type { SurfaceConfig } from "./types.js"

export const canvas2d: SurfaceConfig = {
  components: [
    "types",
    "document-store",
    "tool-store",
    "element-factory",
    "design-canvas",
    "toolbar",
    "panel",
    "pane",
    "layer-list",
    "number-input",
    "colour-picker",
    "history-controls",
    "status-bar",
    "zoom-controls",
  ],
  app: () => `import type { ElementType } from "react"
import { DesignCanvas } from "@/components/substrate/design-canvas"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
  ToolbarSeparator,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import { Pane, PaneHeader, PaneLabel, PaneContent } from "@/components/substrate/pane"
import {
  LayerList,
  LayerItem,
  LayerIcon,
  LayerName,
  LayerActions,
  LayerVisibilityToggle,
  LayerLockToggle,
} from "@/components/substrate/layer-list"
import { NumberInput } from "@/components/substrate/number-input"
import { ColourPicker, ColourSwatch } from "@/components/substrate/colour-picker"
import { HistoryControls } from "@/components/substrate/history-controls"
import {
  StatusBar,
  StatusBarSection,
  StatusBarItem,
  StatusBarSeparator,
} from "@/components/substrate/status-bar"
import { ZoomControls } from "@/components/substrate/zoom-controls"
import { useDocumentStore } from "@/stores/substrate/document-store"
import { useToolStore } from "@/stores/substrate/tool-store"
import { createRectangle, createEllipse } from "@/lib/substrate/element-factory"
import type { DesignElement, ToolType } from "@/lib/substrate/types"
import {
  RiCursorLine,
  RiHand,
  RiSquareLine,
  RiCircleLine,
  RiSubtractLine,
  RiText,
  RiArtboardLine,
  RiGridLine,
  RiDeleteBinLine,
} from "@remixicon/react"

type ToolDefinition = {
  value: ToolType
  icon: ElementType
  label: string
  shortcut: string
}

const POINTER_TOOLS: ToolDefinition[] = [
  { value: "select", icon: RiCursorLine, label: "Select", shortcut: "V" },
  { value: "hand", icon: RiHand, label: "Hand", shortcut: "H" },
]

const SHAPE_TOOLS: ToolDefinition[] = [
  { value: "rectangle", icon: RiSquareLine, label: "Rectangle", shortcut: "R" },
  { value: "ellipse", icon: RiCircleLine, label: "Ellipse", shortcut: "O" },
  { value: "line", icon: RiSubtractLine, label: "Line", shortcut: "L" },
  { value: "text", icon: RiText, label: "Text", shortcut: "T" },
  { value: "frame", icon: RiArtboardLine, label: "Frame", shortcut: "F" },
]

const TOOLS = [...POINTER_TOOLS, ...SHAPE_TOOLS]

// The colour picker edits hex values. Shapes drawn with the tools start with
// an oklch fill, so the picker opens on this grey until a colour is chosen.
const PICKER_FALLBACK = "#d4d4d4"
const ACTION_BUTTON =
  "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 outline-none transition-all hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent data-active:text-accent-foreground"

// Seed the document with a couple of shapes so the canvas is not empty.
// Everything on the canvas lives in the document store; replace this with
// your own starting document (or load one from storage).
if (useDocumentStore.getState().elementOrder.length === 0) {
  const seed: DesignElement[] = [
    {
      ...createRectangle({ x: 120, y: 120, width: 220, height: 140 }),
      fill: { type: "solid", color: "#6366f1", opacity: 1 },
      cornerRadius: 12,
    },
    {
      ...createEllipse({ x: 280, y: 200, width: 160, height: 160 }),
      fill: { type: "solid", color: "#f59e0b", opacity: 1 },
    },
  ]
  for (const element of seed) useDocumentStore.getState().addElement(element)
}

function Tools() {
  const activeTool = useToolStore((s) => s.activeTool)
  const setTool = useToolStore((s) => s.setTool)
  const showGrid = useDocumentStore((s) => s.showGrid)
  const toggleGrid = useDocumentStore((s) => s.toggleGrid)
  const selectedIds = useDocumentStore((s) => s.selectedIds)
  const deleteElements = useDocumentStore((s) => s.deleteElements)
  const deselectAll = useDocumentStore((s) => s.deselectAll)
  const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

  const deleteSelection = () => {
    pushSnapshot()
    deleteElements([...selectedIds])
    deselectAll()
  }

  const renderTool = (tool: ToolDefinition) => (
    <ToolbarToggle
      key={tool.value}
      value={tool.value}
      tooltip={tool.label}
      shortcut={tool.shortcut}
      aria-label={tool.label}
    >
      <tool.icon className="size-4" />
    </ToolbarToggle>
  )

  return (
    <Toolbar className="gap-1">
      <ToolbarToggleGroup
        value={activeTool}
        onValueChange={(value) => {
          // Radix sends "" when the active item is clicked again; keep the tool
          const next = TOOLS.find((tool) => tool.value === value)
          if (next) setTool(next.value)
        }}
      >
        {POINTER_TOOLS.map(renderTool)}
        <ToolbarSeparator />
        {SHAPE_TOOLS.map(renderTool)}
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <button
        type="button"
        aria-label="Toggle grid"
        title="Toggle grid"
        data-active={showGrid || undefined}
        className={ACTION_BUTTON}
        onClick={toggleGrid}
      >
        <RiGridLine className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Delete selection"
        title="Delete selection"
        disabled={selectedIds.size === 0}
        className={ACTION_BUTTON}
        onClick={deleteSelection}
      >
        <RiDeleteBinLine className="size-4" />
      </button>
    </Toolbar>
  )
}

function LayersPanel() {
  const elements = useDocumentStore((s) => s.elements)
  const elementOrder = useDocumentStore((s) => s.elementOrder)
  const selectedIds = useDocumentStore((s) => s.selectedIds)
  const hoveredId = useDocumentStore((s) => s.hoveredId)
  const select = useDocumentStore((s) => s.select)
  const toggleSelection = useDocumentStore((s) => s.toggleSelection)
  const setHovered = useDocumentStore((s) => s.setHovered)
  const updateElement = useDocumentStore((s) => s.updateElement)
  const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

  // Topmost element first, like every other layer list
  const layers = [...elementOrder].reverse()

  return (
    <Panel position="left" className="shrink-0">
      <Pane>
        <PaneHeader>
          <PaneLabel>Layers</PaneLabel>
        </PaneHeader>
        <PaneContent className="-mx-3">
          {layers.length === 0 ? (
            <p className="px-3 text-xs text-muted-foreground">
              Pick a shape tool and drag on the canvas.
            </p>
          ) : (
            <LayerList>
              {layers.map((id) => {
                const element = elements[id]
                if (!element) return null
                return (
                  <LayerItem
                    key={id}
                    selected={selectedIds.has(id)}
                    hovered={hoveredId === id}
                    onClick={(e) => {
                      if (e.shiftKey || e.metaKey || e.ctrlKey) toggleSelection(id)
                      else select([id])
                    }}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <LayerIcon colour={element.fill?.color} />
                    <LayerName
                      onRename={(name) => {
                        pushSnapshot()
                        updateElement(id, { name })
                      }}
                    >
                      {element.name}
                    </LayerName>
                    <LayerActions>
                      <LayerVisibilityToggle
                        visible={element.visible}
                        onVisibleChange={(visible) => {
                          pushSnapshot()
                          updateElement(id, { visible })
                        }}
                      />
                      <LayerLockToggle
                        locked={element.locked}
                        onLockedChange={(locked) => {
                          pushSnapshot()
                          updateElement(id, { locked })
                        }}
                      />
                    </LayerActions>
                  </LayerItem>
                )
              })}
            </LayerList>
          )}
        </PaneContent>
      </Pane>
    </Panel>
  )
}

function PropertiesPanel() {
  const elements = useDocumentStore((s) => s.elements)
  const selectedIds = useDocumentStore((s) => s.selectedIds)
  const updateElement = useDocumentStore((s) => s.updateElement)
  const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

  const selected = [...selectedIds].map((id) => elements[id]).filter(Boolean)
  const element = selected[0]

  if (!element) {
    return (
      <Panel position="right" className="shrink-0">
        <Pane>
          <PaneHeader>
            <PaneLabel>Properties</PaneLabel>
          </PaneHeader>
          <PaneContent>
            <p className="text-xs text-muted-foreground">
              Select an element to edit its properties.
            </p>
          </PaneContent>
        </Pane>
      </Panel>
    )
  }

  const id = element.id
  const fill = element.fill
  const fillHex = fill && fill.color.startsWith("#") ? fill.color : PICKER_FALLBACK

  return (
    <Panel position="right" className="shrink-0">
      <Pane>
        <PaneHeader>
          <PaneLabel>Transform</PaneLabel>
          <HistoryControls size="sm" />
        </PaneHeader>
        <PaneContent>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="X"
              value={element.x}
              onStart={pushSnapshot}
              onChange={(x) => updateElement(id, { x })}
            />
            <NumberInput
              label="Y"
              value={element.y}
              onStart={pushSnapshot}
              onChange={(y) => updateElement(id, { y })}
            />
            <NumberInput
              label="W"
              value={element.width}
              min={1}
              onStart={pushSnapshot}
              onChange={(width) => updateElement(id, { width })}
            />
            <NumberInput
              label="H"
              value={element.height}
              min={1}
              onStart={pushSnapshot}
              onChange={(height) => updateElement(id, { height })}
            />
            <NumberInput
              label="R"
              suffix="°"
              value={element.rotation}
              onStart={pushSnapshot}
              onChange={(rotation) => updateElement(id, { rotation })}
            />
            <NumberInput
              label="O"
              suffix="%"
              min={0}
              max={100}
              value={element.opacity * 100}
              onStart={pushSnapshot}
              onChange={(opacity) => updateElement(id, { opacity: opacity / 100 })}
            />
          </div>
        </PaneContent>
      </Pane>
      <Pane>
        <PaneHeader>
          <PaneLabel>Fill</PaneLabel>
        </PaneHeader>
        <PaneContent className="flex items-center gap-2">
          {/* One undo step per drag: snapshot when the picker is pressed */}
          <ColourPicker
            value={fillHex}
            onPointerDown={pushSnapshot}
            onChange={(color) =>
              updateElement(id, {
                fill: { type: "solid", color, opacity: fill?.opacity ?? 1 },
              })
            }
          >
            <ColourSwatch
              colour={fill ? fill.color : "transparent"}
              className="cursor-pointer"
            />
          </ColourPicker>
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {fill ? fill.color : "No fill"}
          </span>
        </PaneContent>
      </Pane>
    </Panel>
  )
}

function EditorStatusBar() {
  const activeTool = useToolStore((s) => s.activeTool)
  const zoom = useDocumentStore((s) => s.camera.zoom)
  const setCamera = useDocumentStore((s) => s.setCamera)
  const selectedCount = useDocumentStore((s) => s.selectedIds.size)
  const elementCount = useDocumentStore((s) => s.elementOrder.length)

  const tool = TOOLS.find((t) => t.value === activeTool)

  return (
    <StatusBar>
      <StatusBarSection align="left">
        <StatusBarItem>{tool ? tool.label : activeTool}</StatusBarItem>
        <StatusBarSeparator />
        <StatusBarItem>
          {selectedCount > 0
            ? \`\${selectedCount} selected\`
            : \`\${elementCount} element\${elementCount === 1 ? "" : "s"}\`}
        </StatusBarItem>
      </StatusBarSection>
      <StatusBarSection align="center">
        <HistoryControls size="sm" />
      </StatusBarSection>
      <StatusBarSection align="right">
        <ZoomControls
          zoom={zoom}
          onZoomChange={(next) => setCamera({ zoom: next })}
          onZoomToFit={() => setCamera({ x: 0, y: 0, zoom: 1 })}
          min={0.1}
          max={10}
          step={0.1}
        />
      </StatusBarSection>
    </StatusBar>
  )
}

export default function App() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        <LayersPanel />
        <div className="relative min-w-0 flex-1">
          <DesignCanvas />
        </div>
        <PropertiesPanel />
      </div>
      <Tools />
      <EditorStatusBar />
    </div>
  )
}
`,
}
