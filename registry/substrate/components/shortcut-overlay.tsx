"use client"

import { useEffect, useState } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// ── Types ──

type ShortcutEntry = {
	key: string
	label: string
}

type ShortcutGroup = {
	heading: string
	shortcuts: ShortcutEntry[]
}

// ── ShortcutOverlay ──

type ShortcutOverlayProps = {
	groups: ShortcutGroup[]
	open?: boolean
	onOpenChange?: (open: boolean) => void
	trigger?: string
} & React.ComponentProps<"div">

function ShortcutOverlay({
	groups,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	trigger = "?",
	className,
	...props
}: ShortcutOverlayProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const open = controlledOpen ?? internalOpen
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen

	// Listen for trigger key
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return
			if (e.key === trigger && !e.metaKey && !e.ctrlKey && !e.altKey) {
				e.preventDefault()
				onOpenChange(!open)
			}
		}
		document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	}, [trigger, open, onOpenChange])

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay
					data-slot="shortcut-overlay-backdrop"
					className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
				/>
				<DialogPrimitive.Content
					data-slot="shortcut-overlay"
					className={cn(
						"fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2",
						"bg-popover text-popover-foreground",
						"rounded-xl shadow-2xl ring-1 ring-foreground/10 overflow-hidden",
						"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
						"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				>
					<div className="px-5 py-4 border-b">
						<DialogPrimitive.Title className="text-sm font-medium">
							Keyboard shortcuts
						</DialogPrimitive.Title>
					</div>
					<div className="p-5 max-h-[60vh] overflow-y-auto">
						<div className="grid grid-cols-2 gap-x-8 gap-y-6">
							{groups.map((group) => (
								<ShortcutGroupSection key={group.heading} group={group} />
							))}
						</div>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}

// ── ShortcutGroupSection ──

function ShortcutGroupSection({ group }: { group: ShortcutGroup }) {
	return (
		<div data-slot="shortcut-group">
			<h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
				{group.heading}
			</h3>
			<div className="space-y-1">
				{group.shortcuts.map((shortcut) => (
					<div
						key={shortcut.key}
						data-slot="shortcut-entry"
						className="flex items-center justify-between py-1"
					>
						<span className="text-xs">{shortcut.label}</span>
						<ShortcutKey keys={shortcut.key} />
					</div>
				))}
			</div>
		</div>
	)
}

// ── ShortcutKey ──

function ShortcutKey({
	keys,
	className,
}: {
	keys: string
	className?: string
}) {
	const parts = keys.split("+").map((k) => k.trim())

	return (
		<span className={cn("inline-flex items-center gap-0.5", className)}>
			{parts.map((part, i) => (
				<kbd
					key={i}
					data-slot="shortcut-key"
					className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded text-[11px] font-mono bg-muted text-muted-foreground"
				>
					{part}
				</kbd>
			))}
		</span>
	)
}

export {
	ShortcutOverlay,
	ShortcutKey,
	type ShortcutEntry,
	type ShortcutGroup,
	type ShortcutOverlayProps,
}
