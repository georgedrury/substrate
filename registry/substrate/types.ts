// ── Element Types ──

export type ElementType = "rectangle" | "ellipse" | "text" | "line" | "frame"

export interface Point {
  x: number
  y: number
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface Fill {
  type: "solid"
  color: string
  opacity: number
}

export interface Stroke {
  color: string
  width: number
  opacity: number
}

export interface TextStyle {
  content: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  textAlign: "left" | "center" | "right"
  lineHeight: number
}

export interface BaseElement {
  id: string
  type: ElementType
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  fill: Fill | null
  stroke: Stroke | null
  locked: boolean
  visible: boolean
}

export interface RectangleElement extends BaseElement {
  type: "rectangle"
  cornerRadius: number
}

export interface EllipseElement extends BaseElement {
  type: "ellipse"
}

export interface TextElement extends BaseElement {
  type: "text"
  textStyle: TextStyle
}

export interface LineElement extends BaseElement {
  type: "line"
}

export interface FrameElement extends BaseElement {
  type: "frame"
  children: string[]
  clipContent: boolean
  cornerRadius: number
}

export type DesignElement =
  | RectangleElement
  | EllipseElement
  | TextElement
  | LineElement
  | FrameElement

// ── Camera ──

export interface Camera {
  x: number
  y: number
  zoom: number
}

// ── Tools ──

export type ToolType =
  | "select"
  | "hand"
  | "rectangle"
  | "ellipse"
  | "line"
  | "text"
  | "frame"

// ── Panels ──

export type LeftPanelId = "tools" | "layers"
export type RightPanelId = "properties"

// ── Hit Testing ──

export type HandlePosition = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"

// ── Interaction State ──

export type InteractionMode =
  | "idle"
  | "panning"
  | "creating"
  | "moving"
  | "resizing"
  | "marquee_selecting"
