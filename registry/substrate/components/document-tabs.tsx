"use client"

import { Tabs as TabsPrimitive } from "radix-ui"
import { RiCloseLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── DocumentTabs ──

function DocumentTabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="document-tabs"
			className={cn("flex flex-col", className)}
			{...props}
		/>
	)
}

// ── DocumentTabList ──

function DocumentTabList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="document-tab-list"
			className={cn(
				"flex items-end h-9 bg-background border-b px-1 gap-0 overflow-x-auto",
				"scrollbar-none",
				className,
			)}
			{...props}
		/>
	)
}

// ── DocumentTab ──

type DocumentTabProps = {
	onClose?: () => void
} & React.ComponentProps<typeof TabsPrimitive.Trigger>

function DocumentTab({
	onClose,
	className,
	children,
	...props
}: DocumentTabProps) {
	return (
		<TabsPrimitive.Trigger
			data-slot="document-tab"
			className={cn(
				"group/tab relative flex items-center gap-1.5 h-8 px-3 text-xs cursor-default select-none transition-colors",
				"text-muted-foreground hover:text-foreground",
				"border border-transparent border-b-0 rounded-t-md",
				"data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border-border",
				"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		>
			<span className="truncate max-w-32">{children}</span>
			{onClose && (
				<span
					role="button"
					tabIndex={-1}
					data-slot="document-tab-close"
					onClick={(e) => {
						e.stopPropagation()
						e.preventDefault()
						onClose()
					}}
					onPointerDown={(e) => e.stopPropagation()}
					className={cn(
						"size-4 inline-flex items-center justify-center rounded-sm shrink-0",
						"opacity-0 group-hover/tab:opacity-100 data-[state=active]:opacity-60",
						"hover:bg-muted hover:opacity-100 transition-all cursor-pointer",
						"[&_svg]:size-3",
					)}
				>
					<RiCloseLine />
				</span>
			)}
		</TabsPrimitive.Trigger>
	)
}

// ── DocumentTabContent ──

function DocumentTabContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="document-tab-content"
			className={cn("flex-1 relative outline-none", className)}
			{...props}
		/>
	)
}

export {
	DocumentTabs,
	DocumentTabList,
	DocumentTab,
	DocumentTabContent,
}
