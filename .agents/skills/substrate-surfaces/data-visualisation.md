# Data visualisation

Guide to building interactive data exploration tools with Substrate — charts, graphs, dashboards, and visual analytics playgrounds.

## When to use this surface

Use a data visualisation surface when the app involves exploring, filtering, and presenting data visually: dashboard builders, chart editors, data exploration tools, analytics playgrounds, or any tool where users interact with visual representations of datasets.

## Surface setup

Data visualisation tools combine a **chart surface** (where visualisations render) with **data controls** (filters, axis selectors, aggregation options). The rendering engine is typically a charting library layered over SVG or Canvas.

### Dependencies

```bash
npm install recharts d3
npm install -D @types/d3
```

Recharts handles the common chart types (line, bar, area, pie, scatter) with a React-friendly API. D3 provides lower-level control for custom visualisations. Use both — Recharts for standard charts, D3 for anything bespoke.

### Layout

Data visualisation tools often work best with a flexible layout:

```
┌──────────┬────────────────────────┬──────────┐
│          │                        │          │
│  Left    │   Chart surface        │  Right   │
│  panel   │   (visualisation)      │  panel   │
│          │                        │          │
│  Data    │                        │  Chart   │
│  sources │                        │  config  │
│  Filters │                        │  Style   │
│          │                        │          │
└──────────┴────────────────────────┴──────────┘
                 [ Toolbar ]
```

For dashboard builders, the surface area might contain multiple chart tiles arranged in a grid — in that case, the surface acts more like a 2D canvas where chart widgets are the "elements".

## Store architecture

### Data store

```ts
interface DataState {
  datasets: Record<string, Dataset>
  activeDatasetId: string | null
  filters: Filter[]
  computedData: Record[] | null  // Filtered + transformed data
}

interface Dataset {
  id: string
  name: string
  source: "upload" | "url" | "inline"
  rawData: Record<string, unknown>[]
  columns: ColumnDef[]
}

interface ColumnDef {
  key: string
  label: string
  type: "number" | "string" | "date" | "boolean"
}

interface Filter {
  id: string
  column: string
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "contains" | "between"
  value: unknown
}
```

### Chart store

```ts
interface ChartState {
  charts: ChartConfig[]
  selectedChartId: string | null
}

interface ChartConfig {
  id: string
  type: "line" | "bar" | "area" | "pie" | "scatter" | "radar" | "custom"
  title: string
  xAxis: string           // Column key
  yAxis: string[]         // One or more column keys
  groupBy?: string        // Column key for series grouping
  aggregation?: "sum" | "avg" | "count" | "min" | "max"
  colorScheme: string[]
  position?: { x: number; y: number; width: number; height: number }  // For dashboard layout
}
```

## Chart surface

### Single chart mode

For a focused exploration tool, the chart fills the surface area:

```tsx
"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function ChartSurface() {
  const data = useDataStore((s) => s.computedData)
  const chart = useChartStore((s) => s.charts[0])

  if (!data || !chart) return <EmptyState />

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas p-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chart.xAxis} />
          <YAxis />
          <Tooltip />
          {chart.yAxis.map((key, i) => (
            <Line key={key} dataKey={key} stroke={chart.colorScheme[i]} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Dashboard mode

For a dashboard builder, the surface contains a grid of chart tiles. Each tile is a chart config rendered at a specific position. Use the 2D canvas interaction patterns (drag to move, resize handles) for layout editing, but render each tile as a React component with Recharts inside.

## Wiring to Substrate scaffold

### Toolbar

| Tool | Purpose | Shortcut |
|---|---|---|
| Select | Select chart tiles (dashboard mode) | V |
| Add chart | Insert a new chart widget | A |
| Pan | Pan the dashboard canvas | H |
| Zoom | Zoom to fit / zoom level | Cmd+0 |
| Export | Export as PNG/SVG/PDF | Cmd+E |

In single-chart mode, the toolbar might switch between chart types instead.

### Left panel — data

- **Dataset pane** — list loaded datasets, import CSV/JSON, paste data
- **Columns pane** — show available columns with type badges, drag to assign axes
- **Filters pane** — active filter list, add/remove filters with operator dropdowns and value inputs

### Right panel — chart configuration

- **Chart type pane** — visual selector for chart type (icons for line, bar, area, pie, etc.)
- **Axes pane** — X axis column, Y axis columns (multi-select), group-by column
- **Aggregation pane** — how to aggregate grouped data (sum, average, count)
- **Style pane** — colour scheme selector, show/hide grid, legend position, label formatting

## Data loading

### CSV upload

Use the HTML file input to accept CSVs, parse with PapaParse or a simple parser:

```ts
import Papa from "papaparse"

function handleFileUpload(file: File) {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: (results) => {
      dataStore.addDataset({
        name: file.name,
        rawData: results.data,
        columns: inferColumns(results.data),
      })
    },
  })
}
```

### Column type inference

Scan the first N rows to infer column types (number, string, date). Store these on the `ColumnDef` so the UI can offer appropriate filter operators and chart axis options.

## Interaction patterns

### Axis assignment

Let users drag column names from the data panel onto drop zones on the chart (X axis, Y axis, colour/group). This is a drag-and-drop interaction between panels and the surface.

### Brushing and linking

In dashboard mode, selecting a data range on one chart can filter the data for all other charts. This is managed through the filter store — a brush interaction adds a temporary filter that all charts respond to.

### Tooltip and crosshair

Recharts provides built-in tooltips. For custom tooltips, read the active data point and render a positioned DOM element over the chart surface.

## Theming

Charts should read from CSS variables for consistency with the Substrate theme:

- Chart background → `bg-canvas`
- Grid lines → derive from `--border` or `--canvas-foreground`
- Text/labels → `--foreground` or `--muted-foreground`
- Colour schemes → define as an array of CSS variables or provide sensible defaults

## What to build

Some examples of what this surface enables:

- **Data explorer** — upload a CSV, choose chart type, filter and group interactively
- **Dashboard builder** — multiple chart widgets on a grid, drag to rearrange, shared filters
- **Analytics playground** — connect to a live data source, real-time updating charts
- **Comparison tool** — side-by-side charts with linked brushing
- **Chart editor** — design a single publication-quality chart with fine-grained style controls
