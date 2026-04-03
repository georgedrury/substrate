"use client"

import {
	RiCursorLine,
	RiHand,
	RiSquareLine,
	RiCircleLine,
	RiSubtractLine,
	RiText,
	RiArtboardLine,
} from "@remixicon/react"
import { useToolStore } from "../stores/tool-store"
import type { ToolType } from "../types"
import {
	Toolbar,
	ToolbarToggleGroup,
	ToolbarToggle,
	ToolbarSeparator,
	ToolbarDropdown,
	type ToolbarDropdownItem,
} from "../components/toolbar"

const POINTER_TOOLS: ToolbarDropdownItem[] = [
	{ value: "select", icon: <RiCursorLine className="size-4" />, label: "Select", shortcut: "V" },
	{ value: "hand", icon: <RiHand className="size-4" />, label: "Hand", shortcut: "H" },
]

const POINTER_ICONS: Record<string, React.ElementType> = {
	select: RiCursorLine,
	hand: RiHand,
}

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
	const activeTool = useToolStore((s) => s.activeTool)
	const setTool = useToolStore((s) => s.setTool)

	const pointerTool = activeTool === "select" || activeTool === "hand" ? activeTool : "select"
	const PointerIcon = POINTER_ICONS[pointerTool]

	return (
		<Toolbar>
			<ToolbarToggleGroup
				value={activeTool}
				onValueChange={(value) => {
					if (value) setTool(value as ToolType)
				}}
			>
				<ToolbarDropdown
					value={pointerTool}
					active={activeTool === "select" || activeTool === "hand"}
					onSelect={(v) => setTool(v as ToolType)}
					tooltip={pointerTool === "select" ? "Select" : "Hand"}
					shortcut={pointerTool === "select" ? "V" : "H"}
					items={POINTER_TOOLS}
				>
					<PointerIcon className="size-6 stroke-1" />
				</ToolbarDropdown>

				<ToolbarSeparator />

				{SHAPE_TOOLS.map((tool) => (
					<ToolbarToggle
						key={tool.id}
						value={tool.id}
						tooltip={tool.label}
						shortcut={tool.shortcut}
						aria-label={tool.label}
					>
						<tool.icon className="size-6 stroke-1" />
					</ToolbarToggle>
				))}
			</ToolbarToggleGroup>
		</Toolbar>
	)
}
