export type SurfaceType =
  | "canvas-2d"
  | "3d-scene"
  | "animation"
  | "node-editor"
  | "data-vis"
  | "image-gen"
  | "blank"

export interface SurfaceOption {
  value: SurfaceType
  label: string
  description: string
}

export const SURFACE_OPTIONS: SurfaceOption[] = [
  { value: "canvas-2d", label: "2D canvas", description: "Shape editors, whiteboards, diagram tools" },
  { value: "3d-scene", label: "3D scene", description: "Product viewers, architectural tools, shader playgrounds" },
  { value: "animation", label: "Animation", description: "Keyframe editors, motion graphics, easing explorers" },
  { value: "node-editor", label: "Node editor", description: "Visual programming, shader graphs, data pipelines" },
  { value: "data-vis", label: "Data vis", description: "Charts, dashboards, analytics explorers" },
  { value: "image-gen", label: "Image generation", description: "AI image tools, prompt-driven workflows" },
  { value: "blank", label: "Blank", description: "Scaffold only — bring your own surface" },
]

export interface SurfaceConfig {
  /** Registry components to install via shadcn */
  components: string[]
  /** Additional npm dependencies beyond the base */
  extraDeps?: Record<string, string>
  /** Additional npm devDependencies */
  extraDevDeps?: Record<string, string>
  /** Extra CSS variable block appended to globals.css */
  cssVars?: string
  /** The main App.tsx content */
  app: () => string
  /** Additional files to write (path relative to project root → content) */
  files?: Record<string, () => string>
}
