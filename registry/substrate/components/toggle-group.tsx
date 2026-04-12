"use client"

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// ── ToggleGroup ──

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root>

function ToggleGroup({
	className,
	orientation = "horizontal",
	...props
}: ToggleGroupProps) {
	return (
		<ToggleGroupPrimitive.Root
			data-slot="toggle-group"
			orientation={orientation}
			className={cn(
				"inline-flex items-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
				className,
			)}
			{...props}
		/>
	)
}

// ── ToggleGroupItem ──

type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item>

function ToggleGroupItem({
	className,
	...props
}: ToggleGroupItemProps) {
	return (
		<ToggleGroupPrimitive.Item
			data-slot="toggle-group-item"
			className={cn(
				"inline-flex items-center justify-center rounded-md transition-colors outline-none",
				"h-7 min-w-7 px-2 gap-1.5",
				"text-xs text-muted-foreground",
				"hover:bg-muted hover:text-foreground",
				"focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:z-10",
				"disabled:pointer-events-none disabled:opacity-50",
				"data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
				"aria-checked:bg-accent aria-checked:text-accent-foreground",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3.5",
				className,
			)}
			{...props}
		/>
	)
}

export {
	ToggleGroup,
	ToggleGroupItem,
	type ToggleGroupProps,
	type ToggleGroupItemProps,
}
