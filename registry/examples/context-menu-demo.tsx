"use client"

import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubTrigger,
	ContextMenuSubContent,
} from "@/registry/substrate/components/context-menu"

export default function ContextMenuDemo() {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div className="flex items-center justify-center w-[300px] h-32 rounded-lg border border-dashed text-xs text-muted-foreground select-none">
					Right-click here
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>
					Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Paste <ContextMenuShortcut>⌘V</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuSub>
					<ContextMenuSubTrigger>Arrange</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem>
							Bring to front <ContextMenuShortcut>⌘]</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem>
							Send to back <ContextMenuShortcut>⌘[</ContextMenuShortcut>
						</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSeparator />
				<ContextMenuItem>
					Delete <ContextMenuShortcut>⌫</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
