"use client"

import { cn } from "@/lib/utils"

// ── SwatchPalette ──

type SwatchPaletteProps = {
	colours: string[]
	value?: string
	onSelect: (colour: string) => void
	columns?: number
} & Omit<React.ComponentProps<"div">, "onSelect">

function SwatchPalette({
	colours,
	value,
	onSelect,
	columns = 8,
	className,
	...props
}: SwatchPaletteProps) {
	return (
		<div
			data-slot="swatch-palette"
			className={cn("grid gap-1", className)}
			style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
			{...props}
		>
			{colours.map((colour) => (
				<Swatch
					key={colour}
					colour={colour}
					selected={value === colour}
					onClick={() => onSelect(colour)}
				/>
			))}
		</div>
	)
}

// ── Swatch ──

type SwatchProps = {
	colour: string
	selected?: boolean
} & Omit<React.ComponentProps<"button">, "color">

function Swatch({
	colour,
	selected,
	className,
	...props
}: SwatchProps) {
	return (
		<button
			type="button"
			data-slot="swatch"
			data-selected={selected || undefined}
			className={cn(
				"size-6 rounded-md border transition-all outline-none",
				"hover:scale-110 hover:z-10",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
				selected && "ring-2 ring-ring ring-offset-1 scale-110 z-10",
				className,
			)}
			style={{ backgroundColor: colour }}
			aria-label={colour}
			{...props}
		/>
	)
}

// ── Presets ──

const MATERIAL_COLOURS = [
	"#f44336", "#e91e63", "#9c27b0", "#673ab7",
	"#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
	"#009688", "#4caf50", "#8bc34a", "#cddc39",
	"#ffeb3b", "#ffc107", "#ff9800", "#ff5722",
	"#795548", "#9e9e9e", "#607d8b", "#000000",
	"#ffffff", "#f5f5f5", "#e0e0e0", "#bdbdbd",
]

const TAILWIND_COLOURS = [
	"#ef4444", "#f97316", "#eab308", "#22c55e",
	"#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
	"#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
	"#f43f5e", "#64748b", "#1e293b", "#0f172a",
]

export {
	SwatchPalette,
	Swatch,
	MATERIAL_COLOURS,
	TAILWIND_COLOURS,
	type SwatchPaletteProps,
}
