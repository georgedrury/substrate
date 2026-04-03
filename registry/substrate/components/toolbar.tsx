"use client"

import { type ReactNode } from "react"
import {
	Separator as SeparatorPrimitive,
	ToggleGroup as ToggleGroupPrimitive,
	Tooltip as TooltipPrimitive,
	DropdownMenu as DropdownMenuPrimitive,
} from "radix-ui"
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── Toolbar ──

type ToolbarProps = {
	position?: "bottom" | "top"
	orientation?: "vertical" | "horizontal"
}

function Toolbar({
	position,
	orientation,
	className,
	...props
}: ToolbarProps & React.ComponentProps<"div">) {
	return (
		<TooltipPrimitive.Provider delayDuration={300}>
			<div
				role="toolbar"
				data-slot="toolbar"
				data-position={position}
				data-orientation={orientation}
				className={cn(
					"group/toolbar fixed z-50 flex items-center p-2 bg-background border rounded-xl shadow-lg bottom-12 left-1/2 -translate-x-1/2",
					className,
				)}
				{...props}
			/>
		</TooltipPrimitive.Provider>
	)
}

// ── ToolbarSeparator ──

function ToolbarSeparator({
	className,
	...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
	return (
		<SeparatorPrimitive.Root
			decorative
			orientation="vertical"
			data-slot="toolbar-separator"
			className={cn(
				"shrink-0 bg-border data-vertical:w-px data-vertical:self-stretch mx-1 h-6",
				className,
			)}
			{...props}
		/>
	)
}

// ── ToolbarToggleGroup ──

type ToolbarToggleGroupProps = {
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
	orientation?: "horizontal" | "vertical"
	className?: string
	children?: ReactNode
}

function ToolbarToggleGroup({
	className,
	orientation = "horizontal",
	...props
}: ToolbarToggleGroupProps) {
	return (
		<ToggleGroupPrimitive.Root
			type="single"
			orientation={orientation}
			data-slot="toolbar-toggle-group"
			className={cn("flex items-center gap-1", className)}
			{...props}
		/>
	)
}

// ── ToolbarToggle ──

type ToolbarToggleProps = {
	tooltip?: string
	shortcut?: string
} & React.ComponentProps<typeof ToggleGroupPrimitive.Item>

function ToolbarToggle({
	tooltip,
	shortcut,
	children,
	className,
	...props
}: ToolbarToggleProps) {
	const button = (
		<ToggleGroupPrimitive.Item
			data-slot="toolbar-toggle"
			className={cn(
				"inline-flex items-center justify-center rounded-md transition-all outline-none",
				"h-7 min-w-7 px-2",
				"text-xs font-medium",
				"hover:bg-muted hover:text-foreground",
				"focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"disabled:pointer-events-none disabled:opacity-50",
				"aria-checked:bg-accent aria-checked:text-accent-foreground",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
		</ToggleGroupPrimitive.Item>
	)

	if (!tooltip) return button

	return (
		<TooltipPrimitive.Root>
			<TooltipPrimitive.Trigger asChild>{button}</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content
					side="top"
					sideOffset={8}
					className="z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
				>
					{tooltip}{" "}
					{shortcut && (
						<kbd className="text-[10px] text-background/60">{shortcut}</kbd>
					)}
					<TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-xs bg-foreground fill-foreground" />
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	)
}

type ToolbarDropdownItem = {
	value: string
	icon: ReactNode
	label: string
	shortcut?: string
}

type ToolbarDropdownProps = {
	value: string
	active?: boolean
	onSelect: (value: string) => void
	tooltip?: string
	shortcut?: string
	children: ReactNode
	items: ToolbarDropdownItem[]
	className?: string
}

function ToolbarDropdown({
	value,
	active,
	onSelect,
	tooltip,
	shortcut,
	children,
	items,
	className,
}: ToolbarDropdownProps) {
	const buttonEl = (
		<button
			type="button"
			data-slot="toolbar-dropdown"
			data-active={active || undefined}
			className={cn(
				"inline-flex items-center justify-center gap-1 rounded-md transition-all outline-none",
				"h-7 min-w-7 px-2",
				"text-xs font-medium",
				"hover:bg-muted hover:text-foreground",
				"focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"data-active:bg-accent data-active:text-accent-foreground",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
		>
			{children}
			<RiArrowDownSLine className="size-3 opacity-50" />
		</button>
	)

	return (
		<DropdownMenuPrimitive.Root>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					<DropdownMenuPrimitive.Trigger asChild>
						{buttonEl}
					</DropdownMenuPrimitive.Trigger>
				</TooltipPrimitive.Trigger>
				{tooltip && (
					<TooltipPrimitive.Portal>
						<TooltipPrimitive.Content
							side="top"
							sideOffset={8}
							className="z-100 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
						>
							{tooltip}{" "}
							{shortcut && (
								<kbd className="text-[10px] text-background/60">{shortcut}</kbd>
							)}
							<TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-xs bg-foreground fill-foreground" />
						</TooltipPrimitive.Content>
					</TooltipPrimitive.Portal>
				)}
			</TooltipPrimitive.Root>
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					side="top"
					align="start"
					sideOffset={12}
					className="z-100 min-w-36 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=top]:slide-in-from-bottom-2"
				>
					<DropdownMenuPrimitive.RadioGroup
						value={value}
						onValueChange={onSelect}
					>
						{items.map((item) => (
							<DropdownMenuPrimitive.RadioItem
								key={item.value}
								value={item.value}
								className="relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
							>
								<span className="pointer-events-none absolute right-2 flex items-center justify-center">
									<DropdownMenuPrimitive.ItemIndicator>
										<RiCheckLine />
									</DropdownMenuPrimitive.ItemIndicator>
								</span>
								<span className="flex items-center gap-2">
									{item.icon}
									{item.label}
								</span>
								{item.shortcut && (
									<kbd className="ml-auto text-[10px] text-muted-foreground">
										{item.shortcut}
									</kbd>
								)}
							</DropdownMenuPrimitive.RadioItem>
						))}
					</DropdownMenuPrimitive.RadioGroup>
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</DropdownMenuPrimitive.Root>
	)
}

export {
	Toolbar,
	ToolbarSeparator,
	ToolbarToggleGroup,
	ToolbarToggle,
	ToolbarDropdown,
	type ToolbarDropdownItem,
}
