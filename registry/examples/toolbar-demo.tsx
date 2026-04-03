"use client"

import { useState } from "react"
import {
	Toolbar,
	ToolbarToggleGroup,
	ToolbarToggle,
	ToolbarSeparator,
} from "@/registry/substrate/components/toolbar"
import {
	RiCursorLine,
	RiSquareLine,
	RiCircleLine,
	RiPencilLine,
} from "@remixicon/react"

export default function ToolbarDemo() {
	const [tool, setTool] = useState("select")

	return (
		<div className="relative h-20 w-full flex items-center justify-center">
			<Toolbar className="absolute bottom-4">
				<ToolbarToggleGroup value={tool} onValueChange={setTool}>
					<ToolbarToggle value="select" tooltip="Select" shortcut="V">
						<RiCursorLine className="size-4" />
					</ToolbarToggle>
					<ToolbarSeparator />
					<ToolbarToggle value="rectangle" tooltip="Rectangle" shortcut="R">
						<RiSquareLine className="size-4" />
					</ToolbarToggle>
					<ToolbarToggle value="ellipse" tooltip="Ellipse" shortcut="O">
						<RiCircleLine className="size-4" />
					</ToolbarToggle>
					<ToolbarToggle value="pen" tooltip="Pen" shortcut="P">
						<RiPencilLine className="size-4" />
					</ToolbarToggle>
				</ToolbarToggleGroup>
			</Toolbar>
		</div>
	)
}
