"use client"

import { useState, useCallback } from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { RiArrowRightSLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── CollapsiblePane ──

type CollapsiblePaneProps = {
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
} & React.ComponentProps<"div">

function CollapsiblePane({
	defaultOpen = true,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	className,
	children,
	...props
}: CollapsiblePaneProps) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen)
	const open = controlledOpen ?? internalOpen
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen

	return (
		<CollapsiblePrimitive.Root open={open} onOpenChange={onOpenChange} asChild>
			<div
				data-slot="collapsible-pane"
				className={cn("space-y-0 px-3", className)}
				{...props}
			>
				{children}
			</div>
		</CollapsiblePrimitive.Root>
	)
}

// ── CollapsiblePaneHeader ──

function CollapsiblePaneHeader({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="collapsible-pane-header"
			className={cn(
				"flex items-center gap-1",
				// Same PaneHeader awareness for history controls
				"**:data-[slot=history-controls]:ml-auto **:data-[slot=history-controls]:gap-0",
				"**:data-[slot=history-button]:size-6 **:data-[slot=history-button]:[&_svg]:size-3.5",
				className,
			)}
			{...props}
		>
			<CollapsiblePrimitive.Trigger asChild>
				<button
					type="button"
					data-slot="collapsible-pane-trigger"
					className={cn(
						"flex items-center gap-1 group/collapse",
						"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-sm",
					)}
				>
					<RiArrowRightSLine
						className={cn(
							"size-3.5 text-muted-foreground transition-transform duration-150",
							"group-data-[state=open]/collapse:rotate-90",
						)}
					/>
				</button>
			</CollapsiblePrimitive.Trigger>
			{children}
		</div>
	)
}

// ── CollapsiblePaneLabel ──

function CollapsiblePaneLabel({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="collapsible-pane-label"
			className={cn("text-xs font-medium", className)}
			{...props}
		/>
	)
}

// ── CollapsiblePaneContent ──

function CollapsiblePaneContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<CollapsiblePrimitive.Content
			data-slot="collapsible-pane-content"
			className={cn(
				"space-y-2 overflow-hidden",
				"data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
				className,
			)}
			{...props}
		/>
	)
}

export {
	CollapsiblePane,
	CollapsiblePaneHeader,
	CollapsiblePaneLabel,
	CollapsiblePaneContent,
}
