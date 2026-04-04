"use client"

import { useState, useCallback } from "react"
import { RiArrowRightSLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── TreeList ──

function TreeList({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="tree-list"
			role="tree"
			className={cn("flex flex-col", className)}
			{...props}
		/>
	)
}

// ── TreeItem ──

type TreeItemProps = {
	selected?: boolean
	hovered?: boolean
	depth?: number
	expandable?: boolean
	expanded?: boolean
	onExpandedChange?: (expanded: boolean) => void
} & React.ComponentProps<"div">

function TreeItem({
	selected,
	hovered,
	depth = 0,
	expandable,
	expanded,
	onExpandedChange,
	className,
	children,
	...props
}: TreeItemProps) {
	return (
		<div
			data-slot="tree-item"
			data-selected={selected || undefined}
			data-hovered={hovered || undefined}
			data-expanded={expanded || undefined}
			role="treeitem"
			aria-expanded={expandable ? expanded : undefined}
			className={cn(
				"group/tree-item flex items-center h-7 px-2 gap-1 text-xs cursor-default select-none transition-colors",
				"hover:bg-muted/50",
				selected && "bg-accent/10 text-accent-foreground",
				hovered && !selected && "bg-muted/30",
				className,
			)}
			style={{ paddingLeft: `${4 + depth * 16}px` }}
			{...props}
		>
			{expandable ? (
				<TreeExpandButton
					expanded={expanded}
					onClick={(e) => {
						e.stopPropagation()
						onExpandedChange?.(!expanded)
					}}
				/>
			) : (
				<span className="size-4 shrink-0" />
			)}
			{children}
		</div>
	)
}

// ── TreeExpandButton ──

function TreeExpandButton({
	expanded,
	className,
	...props
}: { expanded?: boolean } & React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="tree-expand"
			className={cn(
				"size-4 inline-flex items-center justify-center rounded-sm shrink-0",
				"text-muted-foreground hover:text-foreground transition-transform",
				expanded && "rotate-90",
				className,
			)}
			{...props}
		>
			<RiArrowRightSLine className="size-3.5" />
		</button>
	)
}

// ── TreeItemContent ──

function TreeItemContent({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="tree-item-content"
			className={cn("flex-1 min-w-0 truncate", className)}
			{...props}
		/>
	)
}

// ── TreeItemIcon ──

function TreeItemIcon({
	colour,
	className,
	children,
	...props
}: { colour?: string } & React.ComponentProps<"span">) {
	return (
		<span
			data-slot="tree-item-icon"
			className={cn(
				"size-3.5 rounded-sm shrink-0 flex items-center justify-center",
				!colour && !children && "border border-muted-foreground/30",
				"[&_svg]:size-3",
				className,
			)}
			style={colour ? { backgroundColor: colour } : undefined}
			{...props}
		>
			{children}
		</span>
	)
}

// ── TreeItemActions ──

function TreeItemActions({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="tree-item-actions"
			className={cn(
				"flex items-center gap-0.5 opacity-0 group-hover/tree-item:opacity-100 transition-opacity",
				className,
			)}
			{...props}
		/>
	)
}

// ── Convenience: useTreeExpansion hook ──

function useTreeExpansion(initialExpanded?: string[]) {
	const [expandedIds, setExpandedIds] = useState<Set<string>>(
		new Set(initialExpanded),
	)

	const toggle = useCallback((id: string) => {
		setExpandedIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}, [])

	const isExpanded = useCallback(
		(id: string) => expandedIds.has(id),
		[expandedIds],
	)

	const expandAll = useCallback((ids: string[]) => {
		setExpandedIds(new Set(ids))
	}, [])

	const collapseAll = useCallback(() => {
		setExpandedIds(new Set())
	}, [])

	return { expandedIds, toggle, isExpanded, expandAll, collapseAll }
}

export {
	TreeList,
	TreeItem,
	TreeExpandButton,
	TreeItemContent,
	TreeItemIcon,
	TreeItemActions,
	useTreeExpansion,
}
