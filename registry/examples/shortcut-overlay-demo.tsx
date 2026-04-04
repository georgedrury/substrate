"use client"

import { useState } from "react"
import {
	ShortcutOverlay,
	type ShortcutGroup,
} from "@/registry/substrate/components/shortcut-overlay"

const groups: ShortcutGroup[] = [
	{
		heading: "Tools",
		shortcuts: [
			{ key: "V", label: "Select" },
			{ key: "H", label: "Hand" },
			{ key: "R", label: "Rectangle" },
			{ key: "O", label: "Ellipse" },
			{ key: "L", label: "Line" },
			{ key: "T", label: "Text" },
			{ key: "F", label: "Frame" },
		],
	},
	{
		heading: "Edit",
		shortcuts: [
			{ key: "⌘ + Z", label: "Undo" },
			{ key: "⌘ + ⇧ + Z", label: "Redo" },
			{ key: "⌘ + D", label: "Duplicate" },
			{ key: "⌘ + A", label: "Select all" },
			{ key: "⌫", label: "Delete" },
		],
	},
	{
		heading: "View",
		shortcuts: [
			{ key: "+", label: "Zoom in" },
			{ key: "-", label: "Zoom out" },
			{ key: "⌘ + 0", label: "Reset zoom" },
			{ key: "⌘ + K", label: "Command palette" },
		],
	},
]

export default function ShortcutOverlayDemo() {
	const [open, setOpen] = useState(false)

	return (
		<div className="flex flex-col items-center gap-3">
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="h-8 px-4 rounded-md border text-xs text-muted-foreground hover:bg-muted transition-colors"
			>
				Show shortcuts <kbd className="ml-2 text-[11px]">?</kbd>
			</button>
			<ShortcutOverlay
				groups={groups}
				open={open}
				onOpenChange={setOpen}
			/>
		</div>
	)
}
