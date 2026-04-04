"use client"

import { Select as SelectPrimitive } from "radix-ui"
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── Select ──

function Select({ children, ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
}

// ── SelectTrigger ──

function SelectTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				"flex items-center justify-between h-7 w-full rounded-md border border-input bg-input/40 px-2 text-xs",
				"placeholder:text-muted-foreground",
				"outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
				"disabled:opacity-50 disabled:pointer-events-none",
				"[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
				className,
			)}
			{...props}
		>
			<span className="truncate">{children}</span>
			<SelectPrimitive.Icon asChild>
				<RiArrowDownSLine />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	)
}

// ── SelectContent ──

function SelectContent({
	className,
	position = "popper",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				position={position}
				className={cn(
					"z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg p-1",
					"bg-popover text-popover-foreground",
					"shadow-md ring-1 ring-foreground/10",
					"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
					"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					position === "popper" && "max-h-72",
					className,
				)}
				{...props}
			>
				<SelectPrimitive.Viewport
					className={cn(
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
					)}
				>
					{props.children}
				</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	)
}

// ── SelectItem ──

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex min-h-7 cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-xs outline-none select-none",
				"focus:bg-accent focus:text-accent-foreground",
				"data-disabled:opacity-40 data-disabled:pointer-events-none",
				className,
			)}
			{...props}
		>
			<span className="absolute right-2 flex items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<RiCheckLine className="size-3.5" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	)
}

// ── SelectGroup ──

function SelectGroup({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return (
		<SelectPrimitive.Group
			data-slot="select-group"
			className={cn("", className)}
			{...props}
		/>
	)
}

// ── SelectLabel ──

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn("px-2 py-1.5 text-[11px] font-medium text-muted-foreground", className)}
			{...props}
		/>
	)
}

// ── SelectSeparator ──

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	)
}

// ── SelectValue ──

const SelectValue = SelectPrimitive.Value

export {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectGroup,
	SelectLabel,
	SelectSeparator,
	SelectValue,
}
