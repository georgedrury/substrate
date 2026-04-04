"use client"

import { RiSettings3Line } from "@remixicon/react"
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/registry/substrate/components/popover"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { Slider } from "@/registry/substrate/components/slider"
import { Toggle } from "@/registry/substrate/components/toggle"
import { RiGridLine } from "@remixicon/react"

export default function PopoverDemo() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="h-7 px-3 rounded-md border text-xs text-muted-foreground hover:bg-muted transition-colors inline-flex items-center gap-1.5"
				>
					<RiSettings3Line className="size-3.5" /> View settings
				</button>
			</PopoverTrigger>
			<PopoverContent showArrow className="w-64 space-y-3">
				<span className="text-xs font-medium">View settings</span>
				<Action>
					<ActionLabel>Zoom</ActionLabel>
					<ActionControls>
						<Slider defaultValue={[100]} max={400} min={10} step={10} />
					</ActionControls>
				</Action>
				<div className="flex gap-1">
					<Toggle defaultPressed aria-label="Show grid">
						<RiGridLine /> Grid
					</Toggle>
				</div>
			</PopoverContent>
		</Popover>
	)
}
