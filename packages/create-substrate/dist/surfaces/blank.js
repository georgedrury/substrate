export const blank = {
    components: [
        "toolbar",
        "panel",
        "pane",
        "surface",
        "empty-state",
        "status-bar",
    ],
    app: () => `import { useState } from "react"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
  ToolbarSeparator,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import { Surface } from "@/components/substrate/surface"
import { EmptyState } from "@/components/substrate/empty-state"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import { RiCursorLine, RiHand } from "@remixicon/react"

export default function App() {
  const [tool, setTool] = useState("select")

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        <Panel position="left">
          <EmptyState
            title="Left panel"
            description="Add layers, assets, or navigation here"
          />
        </Panel>

        <Surface className="flex-1">
          <EmptyState
            title="Your surface here"
            description="Replace this with your rendering engine — canvas, Three.js, timeline, or anything else"
          />
        </Surface>

        <Panel position="right">
          <EmptyState
            title="Right panel"
            description="Add property controls and inspectors here"
          />
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup value={tool} onValueChange={setTool}>
          <ToolbarToggle value="select" tooltip="Select" shortcut="V">
            <RiCursorLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="hand" tooltip="Hand" shortcut="H">
            <RiHand className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem label="Tool" value={tool} />
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
};
//# sourceMappingURL=blank.js.map