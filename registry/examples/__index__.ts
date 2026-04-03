import type { ComponentType } from "react"

import SurfaceDemo from "./surface-demo"
import TimelineDemo from "./timeline-demo"
import GalleryDemo from "./gallery-demo"
import ColourPickerDemo from "./colour-picker-demo"
import EasingCurveEditorDemo from "./easing-curve-editor-demo"
import PanelDemo from "./panel-demo"
import PaneDemo from "./pane-demo"
import ToolbarDemo from "./toolbar-demo"
import SliderDemo from "./slider-demo"
import ActionDemo from "./action-demo"

interface ExampleEntry {
	component: ComponentType
	filePath: string
}

export const Index: Record<string, ExampleEntry> = {
	"surface-demo": {
		component: SurfaceDemo,
		filePath: "registry/examples/surface-demo.tsx",
	},
	"timeline-demo": {
		component: TimelineDemo,
		filePath: "registry/examples/timeline-demo.tsx",
	},
	"gallery-demo": {
		component: GalleryDemo,
		filePath: "registry/examples/gallery-demo.tsx",
	},
	"colour-picker-demo": {
		component: ColourPickerDemo,
		filePath: "registry/examples/colour-picker-demo.tsx",
	},
	"easing-curve-editor-demo": {
		component: EasingCurveEditorDemo,
		filePath: "registry/examples/easing-curve-editor-demo.tsx",
	},
	"panel-demo": {
		component: PanelDemo,
		filePath: "registry/examples/panel-demo.tsx",
	},
	"pane-demo": {
		component: PaneDemo,
		filePath: "registry/examples/pane-demo.tsx",
	},
	"toolbar-demo": {
		component: ToolbarDemo,
		filePath: "registry/examples/toolbar-demo.tsx",
	},
	"slider-demo": {
		component: SliderDemo,
		filePath: "registry/examples/slider-demo.tsx",
	},
	"action-demo": {
		component: ActionDemo,
		filePath: "registry/examples/action-demo.tsx",
	},
}
