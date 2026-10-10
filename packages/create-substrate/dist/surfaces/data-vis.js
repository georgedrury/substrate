export const dataVis = {
    components: [
        "toolbar",
        "panel",
        "controls",
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
import { Controls } from "@/components/substrate/controls"
import { useControls } from "@/hooks/substrate/use-controls"
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

const CHART_TYPES = ["line", "area", "bar"] as const

type Metric = "revenue" | "users" | "orders"
type ChartType = (typeof CHART_TYPES)[number]

const METRICS: { value: Metric; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "users", label: "Users" },
  { value: "orders", label: "Orders" },
]

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

  // Each useControls call is one panel; <Controls panel="..." /> renders it.
  // Edit these objects to add, remove or retune a control.
  const dataControls = useControls("Data", {
    metric: { type: "select", options: METRICS, default: "revenue" },
    months: [12, 3, SAMPLE_DATA.length, 1],
  })
  const style = useControls("Style", {
    colour: "#6366f1",
    stroke: [2, 1, 6, 0.5],
    fill: [0.3, 0, 1, 0.05],
    grid: true,
  })

  const metric = isMetric(dataControls.metric) ? dataControls.metric : "revenue"
  const { months } = dataControls

  const data = SAMPLE_DATA.slice(0, months)
  const values = data.map((row) => row[metric])
  const total = values.reduce((sum, value) => sum + value, 0)
  const metricLabel = METRICS.find((item) => item.value === metric)?.label ?? metric

  const axes = (
    <>
      {style.grid && (
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
          <Controls panel="Data" />
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
                    fill={style.colour}
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
                    stroke={style.colour}
                    strokeWidth={style.stroke}
                    fill={style.colour}
                    fillOpacity={style.fill}
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
                    stroke={style.colour}
                    strokeWidth={style.stroke}
                    dot={{ fill: style.colour, r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </main>

        <Panel position="right" className="shrink-0">
          <Controls panel="Style" />
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