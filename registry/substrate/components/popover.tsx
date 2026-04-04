"use client"

import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// ── Popover ──

function Popover({ children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
}

// ── PopoverTrigger ──

function PopoverTrigger({
	className,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return (
		<PopoverPrimitive.Trigger
			data-slot="popover-trigger"
			className={cn("outline-none", className)}
			{...props}
		/>
	)
}

// ── PopoverContent ──

type PopoverContentProps = {
	showArrow?: boolean
} & React.ComponentProps<typeof PopoverPrimitive.Content>

function PopoverContent({
	showArrow,
	className,
	sideOffset = 6,
	children,
	...props
}: PopoverContentProps) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				sideOffset={sideOffset}
				className={cn(
					"z-50 w-56 p-3",
					"bg-popover text-popover-foreground",
					"rounded-lg shadow-md ring-1 ring-foreground/10",
					"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
					"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					"data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
					"data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
					className,
				)}
				{...props}
			>
				{children}
				{showArrow && (
					<PopoverPrimitive.Arrow className="fill-popover drop-shadow-sm" />
				)}
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	)
}

// ── PopoverClose ──

function PopoverClose({
	className,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
	return (
		<PopoverPrimitive.Close
			data-slot="popover-close"
			className={cn(
				"absolute top-2 right-2 size-6 inline-flex items-center justify-center rounded-md",
				"text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
				"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		/>
	)
}

export {
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverClose,
	type PopoverContentProps,
}
