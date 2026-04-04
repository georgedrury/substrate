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
import ColourPickerInline from "./colour-picker-inline"
import ColourPickerCustomTrigger from "./colour-picker-custom-trigger"
import GalleryEmpty from "./gallery-empty"
import EasingCurveCanvasOnly from "./easing-curve-canvas-only"
import NumberInputDemo from "./number-input-demo"
import NumberInputLabels from "./number-input-labels"
import HistoryControlsDemo from "./history-controls-demo"
import HistoryControlsToolbar from "./history-controls-toolbar"
import SliderRange from "./slider-range"

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
	"colour-picker-inline": {
		component: ColourPickerInline,
		filePath: "registry/examples/colour-picker-inline.tsx",
	},
	"colour-picker-custom-trigger": {
		component: ColourPickerCustomTrigger,
		filePath: "registry/examples/colour-picker-custom-trigger.tsx",
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
	"number-input-demo": {
		component: NumberInputDemo,
		filePath: "registry/examples/number-input-demo.tsx",
	},
	"number-input-labels": {
		component: NumberInputLabels,
		filePath: "registry/examples/number-input-labels.tsx",
	},
	"gallery-empty": {
		component: GalleryEmpty,
		filePath: "registry/examples/gallery-empty.tsx",
	},
	"easing-curve-canvas-only": {
		component: EasingCurveCanvasOnly,
		filePath: "registry/examples/easing-curve-canvas-only.tsx",
	},
	"history-controls-demo": {
		component: HistoryControlsDemo,
		filePath: "registry/examples/history-controls-demo.tsx",
	},
	"history-controls-toolbar": {
		component: HistoryControlsToolbar,
		filePath: "registry/examples/history-controls-toolbar.tsx",
	},
	"slider-range": {
		component: SliderRange,
		filePath: "registry/examples/slider-range.tsx",
	},
}
