"use client"

import {
	RiCursorLine,
	RiHand,
	RiSquareLine,
	RiCircleLine,
	RiSubtractLine,
	RiText,
	RiArtboardLine,
	RiStackLine,
} from "@remixicon/react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { useTool } from "../contexts/tool-context"
import { usePanel } from "../contexts/panel-context"
import type { ToolType } from "../types"
import { Panel } from "./panel"

const TOOLS: {
	id: ToolType
	icon: React.ElementType
	label: string
	shortcut: string
}[] = [
	{ id: "select", icon: RiCursorLine, label: "Select", shortcut: "V" },
	{ id: "hand", icon: RiHand, label: "Hand", shortcut: "H" },
]

const SHAPE_TOOLS: {
	id: ToolType
	icon: React.ElementType
	label: string
	shortcut: string
}[] = [
	{ id: "rectangle", icon: RiSquareLine, label: "Rectangle", shortcut: "R" },
	{ id: "ellipse", icon: RiCircleLine, label: "Ellipse", shortcut: "O" },
	{ id: "line", icon: RiSubtractLine, label: "Line", shortcut: "L" },
	{ id: "text", icon: RiText, label: "Text", shortcut: "T" },
	{ id: "frame", icon: RiArtboardLine, label: "Frame", shortcut: "F" },
]

export function Tools() {
	const { activeTool, setTool } = useTool()
	const { state: panelState, setLeftPanel } = usePanel()
	const layersOpen = panelState.leftPanel === "layers"

	return (
		<div className="fixed z-99 p-2 bg-background border rounded-xl shadow-lg bottom-12 left-1/2 -translate-x-1/2">
			<ToggleGroup
				type="single"
				value={activeTool}
				onValueChange={(value) => {
					if (value) setTool(value as ToolType)
				}}
				orientation="horizontal"
				spacing={1}
				className="flex"
			>
				{TOOLS.map((tool) => (
					<Tooltip key={tool.id}>
						<TooltipTrigger asChild>
							<ToggleGroupItem value={tool.id} aria-label={tool.label}>
								<tool.icon className="size-6 stroke-1" />
							</ToggleGroupItem>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={8}>
							{tool.label}{" "}
							<kbd className="ml-1 text-[10px] text-muted-foreground">
								{tool.shortcut}
							</kbd>
						</TooltipContent>
					</Tooltip>
				))}

				{SHAPE_TOOLS.map((tool) => (
					<Tooltip key={tool.id}>
						<TooltipTrigger asChild>
							<ToggleGroupItem value={tool.id} aria-label={tool.label}>
								<tool.icon className="size-6 stroke-1" />
							</ToggleGroupItem>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={8}>
							{tool.label}{" "}
							<kbd className="ml-1 text-[10px] text-muted-foreground">
								{tool.shortcut}
							</kbd>
						</TooltipContent>
					</Tooltip>
				))}
			</ToggleGroup>
		</div>
	)
}
