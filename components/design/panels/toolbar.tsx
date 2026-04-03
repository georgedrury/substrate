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

export function Toolbar() {
	const { activeTool, setTool } = useTool()
	const { state: panelState, setLeftPanel } = usePanel()
	const layersOpen = panelState.leftPanel === "layers"

	return (
		<Panel
			position="left"
			variant="tool"
			className="w-12 flex flex-col justify-between items-center "
		>
			<ToggleGroup
				type="single"
				value={activeTool}
				onValueChange={(value) => {
					if (value) setTool(value as ToolType)
				}}
				orientation="vertical"
				spacing={1}
				className="flex flex-col"
			>
				{TOOLS.map((tool) => (
					<Tooltip key={tool.id}>
						<TooltipTrigger asChild>
							<ToggleGroupItem value={tool.id} aria-label={tool.label}>
								<tool.icon className="size-4" />
							</ToggleGroupItem>
						</TooltipTrigger>
						<TooltipContent side="right" sideOffset={8}>
							{tool.label}{" "}
							<kbd className="ml-1 text-[10px] text-muted-foreground">
								{tool.shortcut}
							</kbd>
						</TooltipContent>
					</Tooltip>
				))}

				<Separator className="my-1 w-6" />

				{SHAPE_TOOLS.map((tool) => (
					<Tooltip key={tool.id}>
						<TooltipTrigger asChild>
							<ToggleGroupItem value={tool.id} aria-label={tool.label}>
								<tool.icon className="size-4" />
							</ToggleGroupItem>
						</TooltipTrigger>
						<TooltipContent side="right" sideOffset={8}>
							{tool.label}{" "}
							<kbd className="ml-1 text-[10px] text-muted-foreground">
								{tool.shortcut}
							</kbd>
						</TooltipContent>
					</Tooltip>
				))}
			</ToggleGroup>

			<div className="mt-auto">
				<Tooltip>
					<TooltipTrigger asChild>
						<Toggle
							pressed={layersOpen}
							onPressedChange={(pressed) =>
								setLeftPanel(pressed ? "layers" : "tools")
							}
							aria-label="Layers"
						>
							<RiStackLine className="size-4" />
						</Toggle>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={8}>
						Layers
					</TooltipContent>
				</Tooltip>
			</div>
		</Panel>
	)
}
