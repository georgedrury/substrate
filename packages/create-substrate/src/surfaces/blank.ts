import type { SurfaceConfig } from "./types.js"

export const blank: SurfaceConfig = {
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
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import { Surface } from "@/components/substrate/surface"
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/substrate/empty-state"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import { RiCursorLine, RiHand } from "@remixicon/react"

export default function App() {
  const [tool, setTool] = useState("select")

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        <Panel position="left">
          <EmptyState>
            <EmptyStateTitle>Left panel</EmptyStateTitle>
            <EmptyStateDescription>
              Add layers, assets, or navigation here
            </EmptyStateDescription>
          </EmptyState>
        </Panel>

        {/* Surface fills its nearest positioned parent */}
        <div className="relative flex-1">
          <Surface>
            <EmptyState>
              <EmptyStateTitle>Your surface here</EmptyStateTitle>
              <EmptyStateDescription>
                Replace this with your rendering engine — canvas, Three.js, timeline, or anything else
              </EmptyStateDescription>
            </EmptyState>
          </Surface>
        </div>

        <Panel position="right">
          <EmptyState>
            <EmptyStateTitle>Right panel</EmptyStateTitle>
            <EmptyStateDescription>
              Add property controls and inspectors here
            </EmptyStateDescription>
          </EmptyState>
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
          <StatusBarItem>Tool: {tool}</StatusBarItem>
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
}
