"use client"

import { Toggle as TogglePrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// ── Toggle ──

type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root>

function Toggle({
	className,
	...props
}: ToggleProps) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			className={cn(
				"inline-flex items-center justify-center rounded-md transition-colors outline-none",
				"h-7 min-w-7 px-2 gap-1.5",
				"text-xs text-muted-foreground",
				"hover:bg-muted hover:text-foreground",
				"focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"disabled:pointer-events-none disabled:opacity-50",
				"data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3.5",
				className,
			)}
			{...props}
		/>
	)
}

export { Toggle, type ToggleProps }
