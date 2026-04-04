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
import NumberSliderDemo from "./number-slider-demo"
import ActionColour from "./action-colour"
import PaneHistory from "./pane-history"
import LayerListDemo from "./layer-list-demo"
import ContextMenuDemo from "./context-menu-demo"
import CommandPaletteDemo from "./command-palette-demo"
import StatusBarDemo from "./status-bar-demo"
import DocumentTabsDemo from "./document-tabs-demo"
import AlignmentControlsDemo from "./alignment-controls-demo"
import BreadcrumbsDemo from "./breadcrumbs-demo"
import ToastDemo from "./toast-demo"
import SwatchPaletteDemo from "./swatch-palette-demo"
import ShortcutOverlayDemo from "./shortcut-overlay-demo"
import TreeListDemo from "./tree-list-demo"
import NodeDemo from "./node-demo"
import NodePortTypes from "./node-port-types"
import SelectDemo from "./select-demo"
import ToggleDemo from "./toggle-demo"
import TextAreaDemo from "./text-area-demo"
import ProgressBarDemo from "./progress-bar-demo"
import BadgeDemo from "./badge-demo"
import EmptyStateDemo from "./empty-state-demo"
import ResizerDemo from "./resizer-demo"
import PopoverDemo from "./popover-demo"
import CollapsiblePaneDemo from "./collapsible-pane-demo"

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
	"number-slider-demo": {
		component: NumberSliderDemo,
		filePath: "registry/examples/number-slider-demo.tsx",
	},
	"action-colour": {
		component: ActionColour,
		filePath: "registry/examples/action-colour.tsx",
	},
	"pane-history": {
		component: PaneHistory,
		filePath: "registry/examples/pane-history.tsx",
	},
	"layer-list-demo": {
		component: LayerListDemo,
		filePath: "registry/examples/layer-list-demo.tsx",
	},
	"context-menu-demo": {
		component: ContextMenuDemo,
		filePath: "registry/examples/context-menu-demo.tsx",
	},
	"command-palette-demo": {
		component: CommandPaletteDemo,
		filePath: "registry/examples/command-palette-demo.tsx",
	},
	"status-bar-demo": {
		component: StatusBarDemo,
		filePath: "registry/examples/status-bar-demo.tsx",
	},
	"document-tabs-demo": {
		component: DocumentTabsDemo,
		filePath: "registry/examples/document-tabs-demo.tsx",
	},
	"alignment-controls-demo": {
		component: AlignmentControlsDemo,
		filePath: "registry/examples/alignment-controls-demo.tsx",
	},
	"breadcrumbs-demo": {
		component: BreadcrumbsDemo,
		filePath: "registry/examples/breadcrumbs-demo.tsx",
	},
	"toast-demo": {
		component: ToastDemo,
		filePath: "registry/examples/toast-demo.tsx",
	},
	"swatch-palette-demo": {
		component: SwatchPaletteDemo,
		filePath: "registry/examples/swatch-palette-demo.tsx",
	},
	"shortcut-overlay-demo": {
		component: ShortcutOverlayDemo,
		filePath: "registry/examples/shortcut-overlay-demo.tsx",
	},
	"tree-list-demo": {
		component: TreeListDemo,
		filePath: "registry/examples/tree-list-demo.tsx",
	},
	"node-demo": {
		component: NodeDemo,
		filePath: "registry/examples/node-demo.tsx",
	},
	"node-port-types": {
		component: NodePortTypes,
		filePath: "registry/examples/node-port-types.tsx",
	},
	"select-demo": {
		component: SelectDemo,
		filePath: "registry/examples/select-demo.tsx",
	},
	"toggle-demo": {
		component: ToggleDemo,
		filePath: "registry/examples/toggle-demo.tsx",
	},
	"text-area-demo": {
		component: TextAreaDemo,
		filePath: "registry/examples/text-area-demo.tsx",
	},
	"progress-bar-demo": {
		component: ProgressBarDemo,
		filePath: "registry/examples/progress-bar-demo.tsx",
	},
	"badge-demo": {
		component: BadgeDemo,
		filePath: "registry/examples/badge-demo.tsx",
	},
	"empty-state-demo": {
		component: EmptyStateDemo,
		filePath: "registry/examples/empty-state-demo.tsx",
	},
	"resizer-demo": {
		component: ResizerDemo,
		filePath: "registry/examples/resizer-demo.tsx",
	},
	"popover-demo": {
		component: PopoverDemo,
		filePath: "registry/examples/popover-demo.tsx",
	},
	"collapsible-pane-demo": {
		component: CollapsiblePaneDemo,
		filePath: "registry/examples/collapsible-pane-demo.tsx",
	},
}
