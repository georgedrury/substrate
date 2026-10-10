export const dataVis = {
    components: [
        "toolbar",
        "panel",
        "pane",
        "action",
        "select",
        "number-slider",
        "colour-picker",
        "toggle-group",
        "status-bar",
    ],
    extraDeps: {
        recharts: "^3.2.0",
    },
    app: () => `import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Toolbar,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import { Pane, PaneHeader, PaneLabel } from "@/components/substrate/pane"
import {
  Action,
  ActionControls,
  ActionLabel,
} from "@/components/substrate/action"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/substrate/select"
import { NumberSlider } from "@/components/substrate/number-slider"
import { ColourPicker } from "@/components/substrate/colour-picker"
import { ToggleGroup, ToggleGroupItem } from "@/components/substrate/toggle-group"
import {
  StatusBar,
  StatusBarItem,
  StatusBarSection,
  StatusBarSeparator,
} from "@/components/substrate/status-bar"
import {
  RiBarChartLine,
  RiLineChartLine,
  RiLineChartFill,
} from "@remixicon/react"

const SAMPLE_DATA = [
  { month: "Jan", revenue: 4200, users: 1800, orders: 320 },
  { month: "Feb", revenue: 3800, users: 2200, orders: 290 },
  { month: "Mar", revenue: 5100, users: 2800, orders: 410 },
  { month: "Apr", revenue: 4600, users: 3100, orders: 380 },
  { month: "May", revenue: 6200, users: 3600, orders: 520 },
  { month: "Jun", revenue: 5800, users: 4200, orders: 480 },
  { month: "Jul", revenue: 7100, users: 4800, orders: 610 },
  { month: "Aug", revenue: 6500, users: 5100, orders: 560 },
  { month: "Sep", revenue: 7800, users: 5600, orders: 690 },
  { month: "Oct", revenue: 8200, users: 6200, orders: 740 },
  { month: "Nov", revenue: 7600, users: 6800, orders: 680 },
  { month: "Dec", revenue: 9100, users: 7400, orders: 830 },
]

const METRICS = [
  { value: "revenue", label: "Revenue" },
  { value: "users", label: "Users" },
  { value: "orders", label: "Orders" },
] as const

const CHART_TYPES = ["line", "area", "bar"] as const

type Metric = (typeof METRICS)[number]["value"]
type ChartType = (typeof CHART_TYPES)[number]

function isMetric(value: string): value is Metric {
  return METRICS.some((metric) => metric.value === value)
}

function isChartType(value: string): value is ChartType {
  return CHART_TYPES.some((type) => type === value)
}

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 }
const CHART_MARGIN = { top: 8, right: 16, bottom: 0, left: 0 }
const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
}

export default function App() {
  const [chartType, setChartType] = useState<ChartType>("line")
  const [metric, setMetric] = useState<Metric>("revenue")
  const [months, setMonths] = useState(12)
  const [colour, setColour] = useState("#6366f1")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fillOpacity, setFillOpacity] = useState(30)
  const [grid, setGrid] = useState("on")

  const data = SAMPLE_DATA.slice(0, months)
  const values = data.map((row) => row[metric])
  const total = values.reduce((sum, value) => sum + value, 0)
  const metricLabel = METRICS.find((item) => item.value === metric)?.label ?? metric

  const axes = (
    <>
      {grid === "on" && (
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
      )}
      <XAxis dataKey="month" tick={AXIS_TICK} stroke="var(--border)" tickLine={false} />
      <YAxis tick={AXIS_TICK} stroke="var(--border)" tickLine={false} width={48} />
      <Tooltip
        contentStyle={TOOLTIP_STYLE}
        labelStyle={{ color: "var(--muted-foreground)" }}
        itemStyle={{ color: "var(--foreground)" }}
        cursor={{ stroke: "var(--border)", fill: "var(--muted)", fillOpacity: 0.4 }}
        isAnimationActive={false}
      />
    </>
  )

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1">
        <Panel position="left" className="shrink-0">
          <Pane>
            <PaneHeader>
              <PaneLabel>Data</PaneLabel>
            </PaneHeader>
            <Action>
              <ActionLabel>Metric</ActionLabel>
              <ActionControls>
                <Select
                  value={metric}
                  onValueChange={(value) => {
                    if (isMetric(value)) setMetric(value)
                  }}
                >
                  <SelectTrigger aria-label="Metric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METRICS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ActionControls>
            </Action>
            <Action>
              <ActionLabel>Months</ActionLabel>
              <ActionControls>
                <NumberSlider
                  value={months}
                  onChange={(value) => setMonths(Math.round(value))}
                  min={3}
                  max={SAMPLE_DATA.length}
                  step={1}
                  precision={0}
                />
              </ActionControls>
            </Action>
          </Pane>
        </Panel>

        {/* Chart surface */}
        <main className="flex min-w-0 flex-1 flex-col bg-canvas p-8 pb-28">
          <h1 className="text-sm font-medium">{metricLabel} by month</h1>
          <p className="text-xs text-muted-foreground">
            Sample data, first {months} months
          </p>
          <div className="mt-6 h-[420px] min-h-[240px] w-full min-w-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 640, height: 420 }}
            >
              {chartType === "bar" ? (
                <BarChart data={data} margin={CHART_MARGIN}>
                  {axes}
                  <Bar
                    dataKey={metric}
                    name={metricLabel}
                    fill={colour}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : chartType === "area" ? (
                <AreaChart data={data} margin={CHART_MARGIN}>
                  {axes}
                  <Area
                    type="monotone"
                    dataKey={metric}
                    name={metricLabel}
                    stroke={colour}
                    strokeWidth={strokeWidth}
                    fill={colour}
                    fillOpacity={fillOpacity / 100}
                    isAnimationActive={false}
                  />
                </AreaChart>
              ) : (
                <LineChart data={data} margin={CHART_MARGIN}>
                  {axes}
                  <Line
                    type="monotone"
                    dataKey={metric}
                    name={metricLabel}
                    stroke={colour}
                    strokeWidth={strokeWidth}
                    dot={{ fill: colour, r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </main>

        <Panel position="right" className="shrink-0">
          <Pane>
            <PaneHeader>
              <PaneLabel>Style</PaneLabel>
            </PaneHeader>
            <Action>
              <ActionLabel>Colour</ActionLabel>
              <ActionControls>
                <ColourPicker value={colour} onChange={setColour} />
                <span className="font-mono text-xs text-muted-foreground">{colour}</span>
              </ActionControls>
            </Action>
            {chartType !== "bar" && (
              <Action>
                <ActionLabel>Stroke</ActionLabel>
                <ActionControls>
                  <NumberSlider
                    value={strokeWidth}
                    onChange={setStrokeWidth}
                    min={1}
                    max={6}
                    step={0.5}
                    suffix="px"
                  />
                </ActionControls>
              </Action>
            )}
            {chartType === "area" && (
              <Action>
                <ActionLabel>Fill</ActionLabel>
                <ActionControls>
                  <NumberSlider
                    value={fillOpacity}
                    onChange={setFillOpacity}
                    min={0}
                    max={100}
                    step={1}
                    precision={0}
                    suffix="%"
                  />
                </ActionControls>
              </Action>
            )}
            <Action>
              <ActionLabel>Grid</ActionLabel>
              <ActionControls>
                <ToggleGroup
                  type="single"
                  value={grid}
                  onValueChange={(value) => {
                    if (value) setGrid(value)
                  }}
                  aria-label="Grid lines"
                >
                  <ToggleGroupItem value="on">On</ToggleGroupItem>
                  <ToggleGroupItem value="off">Off</ToggleGroupItem>
                </ToggleGroup>
              </ActionControls>
            </Action>
          </Pane>
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup
          value={chartType}
          onValueChange={(value) => {
            if (isChartType(value)) setChartType(value)
          }}
        >
          <ToolbarToggle value="line" tooltip="Line chart" aria-label="Line chart">
            <RiLineChartLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="area" tooltip="Area chart" aria-label="Area chart">
            <RiLineChartFill className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="bar" tooltip="Bar chart" aria-label="Bar chart">
            <RiBarChartLine className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem>{metricLabel}</StatusBarItem>
          <StatusBarSeparator />
          <StatusBarItem>{data.length} points</StatusBarItem>
        </StatusBarSection>
        <StatusBarSection align="right">
          <StatusBarItem>Min {Math.min(...values).toLocaleString()}</StatusBarItem>
          <StatusBarItem>Max {Math.max(...values).toLocaleString()}</StatusBarItem>
          <StatusBarItem>Total {total.toLocaleString()}</StatusBarItem>
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
};
//# sourceMappingURL=data-vis.js.map