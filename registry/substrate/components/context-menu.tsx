"use client"

import { ContextMenu as ContextMenuPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// ── ContextMenu ──

function ContextMenu({ children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
	return <ContextMenuPrimitive.Root {...props}>{children}</ContextMenuPrimitive.Root>
}

// ── ContextMenuTrigger ──

function ContextMenuTrigger({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
	return (
		<ContextMenuPrimitive.Trigger
			data-slot="context-menu-trigger"
			className={cn("outline-none", className)}
			{...props}
		/>
	)
}

// ── ContextMenuContent ──

function ContextMenuContent({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Content
				data-slot="context-menu-content"
				className={cn(
					"z-50 min-w-44 overflow-hidden rounded-lg p-1",
					"bg-popover text-popover-foreground",
					"shadow-md ring-1 ring-foreground/10",
					"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
					"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					className,
				)}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	)
}

// ── ContextMenuItem ──

function ContextMenuItem({
	className,
	disabled,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item>) {
	return (
		<ContextMenuPrimitive.Item
			data-slot="context-menu-item"
			disabled={disabled}
			className={cn(
				"relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none select-none",
				"focus:bg-accent focus:text-accent-foreground",
				"data-disabled:opacity-40 data-disabled:pointer-events-none",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3.5",
				className,
			)}
			{...props}
		/>
	)
}

// ── ContextMenuSeparator ──

function ContextMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
	return (
		<ContextMenuPrimitive.Separator
			data-slot="context-menu-separator"
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	)
}

// ── ContextMenuLabel ──

function ContextMenuLabel({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label>) {
	return (
		<ContextMenuPrimitive.Label
			data-slot="context-menu-label"
			className={cn(
				"px-2 py-1.5 text-[11px] font-medium text-muted-foreground",
				className,
			)}
			{...props}
		/>
	)
}

// ── ContextMenuShortcut ──

function ContextMenuShortcut({
	className,
	...props
}: React.ComponentProps<"kbd">) {
	return (
		<kbd
			data-slot="context-menu-shortcut"
			className={cn(
				"ml-auto text-[11px] tracking-wide text-muted-foreground",
				className,
			)}
			{...props}
		/>
	)
}

// ── ContextMenuSub ──

function ContextMenuSub({ children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
	return <ContextMenuPrimitive.Sub {...props}>{children}</ContextMenuPrimitive.Sub>
}

function ContextMenuSubTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger>) {
	return (
		<ContextMenuPrimitive.SubTrigger
			data-slot="context-menu-sub-trigger"
			className={cn(
				"relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none select-none",
				"focus:bg-accent focus:text-accent-foreground",
				"data-open:bg-accent data-open:text-accent-foreground",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3.5",
				className,
			)}
			{...props}
		>
			{children}
			<svg
				className="ml-auto size-3 text-muted-foreground"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path d="m9 18 6-6-6-6" />
			</svg>
		</ContextMenuPrimitive.SubTrigger>
	)
}

function ContextMenuSubContent({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.SubContent
				data-slot="context-menu-sub-content"
				className={cn(
					"z-50 min-w-36 overflow-hidden rounded-lg p-1",
					"bg-popover text-popover-foreground",
					"shadow-md ring-1 ring-foreground/10",
					"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
					"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					className,
				)}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	)
}

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuLabel,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubTrigger,
	ContextMenuSubContent,
}
