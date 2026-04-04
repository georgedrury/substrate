"use client"

import { useEffect, useState, useCallback } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Dialog as DialogPrimitive } from "radix-ui"
import { RiSearchLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── CommandPalette ──

type CommandPaletteProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
} & React.ComponentProps<"div">

function CommandPalette({
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	className,
	children,
	...props
}: CommandPaletteProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const open = controlledOpen ?? internalOpen
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen

	// Cmd+K / Ctrl+K listener
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				onOpenChange(!open)
			}
		}
		document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	}, [open, onOpenChange])

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay
					data-slot="command-palette-overlay"
					className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
				/>
				<DialogPrimitive.Content
					data-slot="command-palette"
					className={cn(
						"fixed top-[20%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2",
						"bg-popover text-popover-foreground",
						"rounded-xl shadow-2xl ring-1 ring-foreground/10 overflow-hidden",
						"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-top-2",
						"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				>
					<CommandPrimitive
						className="flex flex-col"
						loop
					>
						{children}
					</CommandPrimitive>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}

// ── CommandInput ──

function CommandInput({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
	return (
		<div
			data-slot="command-input-wrapper"
			className="flex items-center gap-2 border-b px-3"
		>
			<RiSearchLine className="size-4 shrink-0 text-muted-foreground" />
			<CommandPrimitive.Input
				data-slot="command-input"
				className={cn(
					"flex-1 h-10 bg-transparent text-sm outline-none",
					"placeholder:text-muted-foreground",
					className,
				)}
				{...props}
			/>
		</div>
	)
}

// ── CommandList ──

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn("max-h-72 overflow-y-auto p-1", className)}
			{...props}
		/>
	)
}

// ── CommandEmpty ──

function CommandEmpty({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className={cn("py-6 text-center text-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}

// ── CommandGroup ──

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn(
				"[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	)
}

// ── CommandItem ──

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				"relative flex min-h-8 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none select-none",
				"data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
				"data-disabled:opacity-40 data-disabled:pointer-events-none",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
				className,
			)}
			{...props}
		/>
	)
}

// ── CommandShortcut ──

function CommandShortcut({
	className,
	...props
}: React.ComponentProps<"kbd">) {
	return (
		<kbd
			data-slot="command-shortcut"
			className={cn(
				"ml-auto text-[11px] tracking-wide text-muted-foreground",
				className,
			)}
			{...props}
		/>
	)
}

// ── CommandSeparator ──

function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	)
}

export {
	CommandPalette,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
}
