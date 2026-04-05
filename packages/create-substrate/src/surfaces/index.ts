import type { SurfaceType, SurfaceConfig } from "./types.js"
import { blank } from "./blank.js"
import { canvas2d } from "./canvas-2d.js"
import { scene3d } from "./3d-scene.js"
import { animation } from "./animation.js"
import { nodeEditor } from "./node-editor.js"
import { dataVis } from "./data-vis.js"
import { imageGen } from "./image-gen.js"

export const surfaces: Record<SurfaceType, SurfaceConfig> = {
  "canvas-2d": canvas2d,
  "3d-scene": scene3d,
  animation,
  "node-editor": nodeEditor,
  "data-vis": dataVis,
  "image-gen": imageGen,
  blank,
}

export type { SurfaceType, SurfaceConfig } from "./types.js"
