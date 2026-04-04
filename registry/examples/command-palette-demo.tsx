"use client"

import { useState } from "react"
import {
	RiCursorLine,
	RiDragMoveLine,
	RiSquareLine,
	RiCircleLine,
	RiTextBlock,
	RiSubtractLine,
	RiArtboardLine,
	RiDeleteBinLine,
	RiArrowGoBackLine,
	RiArrowGoForwardLine,
	RiGridLine,
} from "@remixicon/react"
import {
	CommandPalette,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
} from "@/registry/substrate/components/command-palette"

export default function CommandPaletteDemo() {
	const [open, setOpen] = useState(false)

	return (
		<div className="flex flex-col items-center gap-3">
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="h-8 px-4 rounded-md border text-xs text-muted-foreground hover:bg-muted transition-colors"
			>
				Open command palette <kbd className="ml-2 text-[11px]">⌘K</kbd>
			</button>
			<CommandPalette open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search commands..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Tools">
						<CommandItem onSelect={() => setOpen(false)}>
							<RiCursorLine /> Select <CommandShortcut>V</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiDragMoveLine /> Hand <CommandShortcut>H</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiSquareLine /> Rectangle <CommandShortcut>R</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiCircleLine /> Ellipse <CommandShortcut>O</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiSubtractLine /> Line <CommandShortcut>L</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiTextBlock /> Text <CommandShortcut>T</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiArtboardLine /> Frame <CommandShortcut>F</CommandShortcut>
						</CommandItem>
					</CommandGroup>
					<CommandGroup heading="Actions">
						<CommandItem onSelect={() => setOpen(false)}>
							<RiArrowGoBackLine /> Undo <CommandShortcut>⌘Z</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiArrowGoForwardLine /> Redo <CommandShortcut>⌘⇧Z</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiDeleteBinLine /> Delete selected <CommandShortcut>⌫</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setOpen(false)}>
							<RiGridLine /> Toggle grid <CommandShortcut>⌘&apos;</CommandShortcut>
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandPalette>
		</div>
	)
}
