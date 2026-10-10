import type {
  Bounds,
  RectangleElement,
  EllipseElement,
  TextElement,
  LineElement,
  FrameElement,
} from "@/lib/substrate/types"
import { generateId } from "./id"

const counters: Record<string, number> = {}

function nextName(base: string): string {
  counters[base] = (counters[base] ?? 0) + 1
  return `${base} ${counters[base]}`
}

const DEFAULT_FILL = { type: "solid" as const, color: "oklch(0.85 0 0)", opacity: 1 }

export function createRectangle(bounds: Bounds): RectangleElement {
  return {
    id: generateId(),
    type: "rectangle",
    name: nextName("Rectangle"),
    ...bounds,
    rotation: 0,
    opacity: 1,
    fill: { ...DEFAULT_FILL },
    stroke: null,
    locked: false,
    visible: true,
    cornerRadius: 0,
  }
}

export function createEllipse(bounds: Bounds): EllipseElement {
  return {
    id: generateId(),
    type: "ellipse",
    name: nextName("Ellipse"),
    ...bounds,
    rotation: 0,
    opacity: 1,
    fill: { ...DEFAULT_FILL },
    stroke: null,
    locked: false,
    visible: true,
  }
}

export function createText(bounds: Bounds): TextElement {
  return {
    id: generateId(),
    type: "text",
    name: nextName("Text"),
    ...bounds,
    rotation: 0,
    opacity: 1,
    fill: { type: "solid", color: "oklch(0.145 0 0)", opacity: 1 },
    stroke: null,
    locked: false,
    visible: true,
    textStyle: {
      content: "Text",
      fontSize: 16,
      fontFamily: "sans-serif",
      fontWeight: 400,
      textAlign: "left",
      lineHeight: 1.4,
    },
  }
}

export function createLine(bounds: Bounds): LineElement {
  return {
    id: generateId(),
    type: "line",
    name: nextName("Line"),
    ...bounds,
    rotation: 0,
    opacity: 1,
    fill: null,
    stroke: { color: "oklch(0.145 0 0)", width: 2, opacity: 1 },
    locked: false,
    visible: true,
  }
}

export function createFrame(bounds: Bounds): FrameElement {
  return {
    id: generateId(),
    type: "frame",
    name: nextName("Frame"),
    ...bounds,
    rotation: 0,
    opacity: 1,
    fill: { type: "solid", color: "oklch(1 0 0)", opacity: 1 },
    stroke: null,
    locked: false,
    visible: true,
    children: [],
    clipContent: true,
    cornerRadius: 0,
  }
}
