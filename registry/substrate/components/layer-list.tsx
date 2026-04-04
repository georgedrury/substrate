"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
	RiEyeLine,
	RiEyeOffLine,
	RiLockLine,
	RiLockUnlockLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── LayerList ──

function LayerList({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="layer-list"
			className={cn("flex flex-col", className)}
			{...props}
		/>
	)
}

// ── LayerItem ──

type LayerItemProps = {
	selected?: boolean
	hovered?: boolean
	depth?: number
} & React.ComponentProps<"div">

function LayerItem({
	selected,
	hovered,
	depth = 0,
	className,
	...props
}: LayerItemProps) {
	return (
		<div
			data-slot="layer-item"
			data-selected={selected || undefined}
			data-hovered={hovered || undefined}
			className={cn(
				"group/layer flex items-center h-7 px-2 gap-2 text-xs cursor-default select-none transition-colors",
				"hover:bg-muted/50",
				selected && "bg-accent/10 text-accent-foreground",
				hovered && !selected && "bg-muted/30",
				className,
			)}
			style={{ paddingLeft: `${8 + depth * 12}px` }}
			{...props}
		/>
	)
}

// ── LayerIcon ──

type LayerIconProps = {
	colour?: string
} & React.ComponentProps<"span">

function LayerIcon({
	colour,
	className,
	children,
	...props
}: LayerIconProps) {
	return (
		<span
			data-slot="layer-icon"
			className={cn(
				"size-3.5 rounded-sm shrink-0 flex items-center justify-center",
				!colour && !children && "border border-muted-foreground/30",
				className,
			)}
			style={colour ? { backgroundColor: colour } : undefined}
			{...props}
		>
			{children}
		</span>
	)
}

// ── LayerName ──

type LayerNameProps = {
	editable?: boolean
	onRename?: (name: string) => void
} & Omit<React.ComponentProps<"span">, "children"> & {
	children: string
}

function LayerName({
	editable = true,
	onRename,
	children,
	className,
	...props
}: LayerNameProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState(children)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus()
			inputRef.current?.select()
		}
	}, [isEditing])

	const commit = useCallback(() => {
		const trimmed = editValue.trim()
		if (trimmed && trimmed !== children) {
			onRename?.(trimmed)
		}
		setIsEditing(false)
	}, [editValue, children, onRename])

	const handleDoubleClick = useCallback(() => {
		if (!editable) return
		setEditValue(children)
		setIsEditing(true)
	}, [editable, children])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") commit()
			if (e.key === "Escape") setIsEditing(false)
		},
		[commit],
	)

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				type="text"
				value={editValue}
				onChange={(e) => setEditValue(e.target.value)}
				onBlur={commit}
				onKeyDown={handleKeyDown}
				className={cn(
					"flex-1 min-w-0 bg-transparent text-xs outline-none px-0.5 -mx-0.5 rounded-sm",
					"ring-1 ring-ring",
					className,
				)}
			/>
		)
	}

	return (
		<span
			data-slot="layer-name"
			className={cn(
				"flex-1 min-w-0 truncate text-xs",
				editable && "cursor-text",
				className,
			)}
			onDoubleClick={handleDoubleClick}
			{...props}
		>
			{children}
		</span>
	)
}

// ── LayerActions ──

function LayerActions({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="layer-actions"
			className={cn(
				"flex items-center gap-0.5 opacity-0 group-hover/layer:opacity-100 transition-opacity",
				"data-[slot=layer-item][data-selected]:opacity-100",
				className,
			)}
			{...props}
		/>
	)
}

// ── LayerToggle ──

type LayerToggleProps = {
	pressed?: boolean
	onPressedChange?: (pressed: boolean) => void
} & Omit<React.ComponentProps<"button">, "onClick">

function LayerToggle({
	pressed,
	onPressedChange,
	className,
	children,
	...props
}: LayerToggleProps) {
	return (
		<button
			type="button"
			data-slot="layer-toggle"
			data-state={pressed ? "on" : "off"}
			onClick={(e) => {
				e.stopPropagation()
				onPressedChange?.(!pressed)
			}}
			className={cn(
				"size-5 flex items-center justify-center rounded-sm transition-colors",
				"text-muted-foreground hover:text-foreground hover:bg-muted",
				"[&_svg]:size-3",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	)
}

// ── Convenience: visibility and lock toggles ──

function LayerVisibilityToggle({
	visible,
	onVisibleChange,
	...props
}: {
	visible: boolean
	onVisibleChange: (visible: boolean) => void
} & Omit<React.ComponentProps<typeof LayerToggle>, "pressed" | "onPressedChange" | "children">) {
	return (
		<LayerToggle
			pressed={visible}
			onPressedChange={onVisibleChange}
			aria-label={visible ? "Hide layer" : "Show layer"}
			{...props}
		>
			{visible ? <RiEyeLine /> : <RiEyeOffLine />}
		</LayerToggle>
	)
}

function LayerLockToggle({
	locked,
	onLockedChange,
	...props
}: {
	locked: boolean
	onLockedChange: (locked: boolean) => void
} & Omit<React.ComponentProps<typeof LayerToggle>, "pressed" | "onPressedChange" | "children">) {
	return (
		<LayerToggle
			pressed={locked}
			onPressedChange={onLockedChange}
			aria-label={locked ? "Unlock layer" : "Lock layer"}
			{...props}
		>
			{locked ? <RiLockLine /> : <RiLockUnlockLine />}
		</LayerToggle>
	)
}

export {
	LayerList,
	LayerItem,
	LayerIcon,
	LayerName,
	LayerActions,
	LayerToggle,
	LayerVisibilityToggle,
	LayerLockToggle,
}
