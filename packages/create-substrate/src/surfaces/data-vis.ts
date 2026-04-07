import type { SurfaceConfig } from "./types.js"

export const dataVis: SurfaceConfig = {
  components: [
    "toolbar",
    "panel",
    "pane",
    "select",
    "slider",
    "colour-picker",
    "number-input",
    "status-bar",
  ],
  extraDeps: {
    recharts: "^2.15.0",
  },
  app: () => `import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import {
  Pane,
  PaneHeader,
  PaneLabel,
  PaneContent,
} from "@/components/substrate/pane"
import { Select } from "@/components/substrate/select"
import { Slider } from "@/components/substrate/slider"
import { ColourPicker } from "@/components/substrate/colour-picker"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import {
  RiLineChartLine,
  RiBarChartLine,
} from "@remixicon/react"

const SAMPLE_DATA = [
  { month: "Jan", revenue: 4200, users: 1800 },
  { month: "Feb", revenue: 3800, users: 2200 },
  { month: "Mar", revenue: 5100, users: 2800 },
  { month: "Apr", revenue: 4600, users: 3100 },
  { month: "May", revenue: 6200, users: 3600 },
  { month: "Jun", revenue: 5800, users: 4200 },
  { month: "Jul", revenue: 7100, users: 4800 },
  { month: "Aug", revenue: 6500, users: 5100 },
  { month: "Sep", revenue: 7800, users: 5600 },
  { month: "Oct", revenue: 8200, users: 6200 },
  { month: "Nov", revenue: 7600, users: 6800 },
  { month: "Dec", revenue: 9100, users: 7400 },
]

const METRICS = [
  { value: "revenue", label: "Revenue" },
  { value: "users", label: "Users" },
]

type ChartType = "line" | "bar"

export default function App() {
  const [chartType, setChartType] = useState<ChartType>("line")
  const [metric, setMetric] = useState("revenue")
  const [colour, setColour] = useState("#6366f1")
  const [strokeWidth, setStrokeWidth] = useState(2)

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        <Panel position="left">
          <Pane>
            <PaneHeader>
              <PaneLabel>Dataset</PaneLabel>
            </PaneHeader>
            <PaneContent className="space-y-3">
              <Select
                label="Metric"
                value={metric}
                onValueChange={setMetric}
                options={METRICS}
              />
            </PaneContent>
          </Pane>
        </Panel>

        {/* Chart surface */}
        <div className="flex flex-1 items-center justify-center bg-canvas p-8">
          <ResponsiveContainer width="100%" height="80%">
            {chartType === "line" ? (
              <LineChart data={SAMPLE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                <XAxis dataKey="month" stroke="hsl(0 0% 50%)" />
                <YAxis stroke="hsl(0 0% 50%)" />
                <Tooltip
                  contentStyle={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 20%)", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(0 0% 80%)" }}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={colour}
                  strokeWidth={strokeWidth}
                  dot={{ fill: colour, r: 3 }}
                />
              </LineChart>
            ) : (
              <BarChart data={SAMPLE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                <XAxis dataKey="month" stroke="hsl(0 0% 50%)" />
                <YAxis stroke="hsl(0 0% 50%)" />
                <Tooltip
                  contentStyle={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 20%)", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(0 0% 80%)" }}
                />
                <Bar dataKey={metric} fill={colour} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <Panel position="right">
          <Pane>
            <PaneHeader>
              <PaneLabel>Style</PaneLabel>
            </PaneHeader>
            <PaneContent className="space-y-3">
              <ColourPicker value={colour} onChange={setColour} />
              {chartType === "line" && (
                <Slider
                  label="Stroke width"
                  min={1}
                  max={6}
                  step={0.5}
                  value={[strokeWidth]}
                  onValueChange={([v]) => setStrokeWidth(v)}
                />
              )}
            </PaneContent>
          </Pane>
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
          <ToolbarToggle value="line" tooltip="Line chart">
            <RiLineChartLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="bar" tooltip="Bar chart">
            <RiBarChartLine className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem>Chart: {chartType}</StatusBarItem>
          <StatusBarItem>Metric: {metric}</StatusBarItem>
          <StatusBarItem>Points: {SAMPLE_DATA.length}</StatusBarItem>
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
}
