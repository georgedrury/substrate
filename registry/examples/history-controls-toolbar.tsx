"use client"

import { useState } from "react"
import {
	Toolbar,
	ToolbarToggleGroup,
	ToolbarToggle,
	ToolbarSeparator,
} from "@/registry/substrate/components/toolbar"
import { HistoryControls } from "@/registry/substrate/components/history-controls"
import { RiCursorLine, RiSquareLine } from "@remixicon/react"

export default function HistoryControlsToolbar() {
	const [tool, setTool] = useState("select")

	return (
		<div className="relative h-20 w-full flex items-center justify-center">
			<Toolbar className="absolute bottom-4">
				<HistoryControls size="sm" />
				<ToolbarSeparator />
				<ToolbarToggleGroup value={tool} onValueChange={setTool}>
					<ToolbarToggle value="select" tooltip="Select" shortcut="V">
						<RiCursorLine className="size-4" />
					</ToolbarToggle>
					<ToolbarToggle value="rectangle" tooltip="Rectangle" shortcut="R">
						<RiSquareLine className="size-4" />
					</ToolbarToggle>
				</ToolbarToggleGroup>
			</Toolbar>
		</div>
	)
}
