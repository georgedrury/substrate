"use client"

import { useMemo } from "react"
import { HexColorPicker, HexColorInput } from "react-colorful"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// The picker works in hex. Values can be any CSS colour (oklch, rgb, named),
// so paint one pixel and read it back to let the browser do the conversion.
function toHex(colour: string): string {
	if (/^#[0-9a-f]{6}$/i.test(colour)) return colour
	if (typeof document === "undefined") return "#000000"

	const ctx = document.createElement("canvas").getContext("2d")
	if (!ctx) return "#000000"
	ctx.fillStyle = colour
	ctx.fillRect(0, 0, 1, 1)
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
	return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

// ── ColourSwatch ──

type ColourSwatchProps = {
	colour: string
	size?: "sm" | "md"
} & React.ComponentProps<"div">

function ColourSwatch({
	colour,
	size = "sm",
	className,
	...props
}: ColourSwatchProps) {
	return (
		<div
			data-slot="colour-swatch"
			data-size={size}
			className={cn(
				"rounded-md border transition-all",
				size === "sm" && "size-5",
				size === "md" && "size-7",
				className,
			)}
			style={{ backgroundColor: colour }}
			{...props}
		/>
	)
}

// ── ColourInput ──

type ColourInputProps = {
	value: string
	onChange: (colour: string) => void
} & Omit<React.ComponentProps<"div">, "onChange">

function ColourInput({
	value,
	onChange,
	className,
	...props
}: ColourInputProps) {
	return (
		<div
			data-slot="colour-input"
			className={cn("flex items-center", className)}
			{...props}
		>
			<HexColorInput
				color={value}
				onChange={onChange}
				className={cn(
					"text-xs font-mono bg-transparent border rounded-md px-2 h-7 w-full",
					"placeholder:text-muted-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
				)}
				placeholder="#000000"
			/>
		</div>
	)
}

// ── ColourPickerContent ──

type ColourPickerContentProps = {
	/** Any CSS colour */
	value: string
	/** Called with a hex colour */
	onChange: (colour: string) => void
	/** Called once when a drag or edit begins. Useful for undo snapshots. */
	onStart?: () => void
} & Omit<React.ComponentProps<"div">, "onChange">

function ColourPickerContent({
	value,
	onChange,
	onStart,
	className,
	...props
}: ColourPickerContentProps) {
	const hex = useMemo(() => toHex(value), [value])

	return (
		<div
			data-slot="colour-picker-content"
			className={cn("space-y-3", className)}
			onPointerDownCapture={onStart}
			{...props}
		>
			<style>{`
				.colour-picker .react-colorful {
					width: 100% !important;
					height: 160px !important;
				}
			`}</style>
			<div className="colour-picker">
				<HexColorPicker color={hex} onChange={onChange} />
			</div>
			<div className="flex items-center gap-2">
				<ColourInput value={hex} onChange={onChange} />
				<ColourSwatch colour={hex} size="sm" />
			</div>
		</div>
	)
}

// ── ColourPicker ──

type ColourPickerProps = {
	/** Any CSS colour */
	value: string
	/** Called with a hex colour */
	onChange: (colour: string) => void
	/** Called once when a drag or edit begins. Useful for undo snapshots. */
	onStart?: () => void
	children?: React.ReactNode
} & Omit<React.ComponentProps<"div">, "onChange">

function ColourPicker({
	value,
	onChange,
	onStart,
	children,
	className,
	...props
}: ColourPickerProps) {
	return (
		<PopoverPrimitive.Root>
			<PopoverPrimitive.Trigger asChild>
				{children ? <div>{children}</div> : <ColourSwatch colour={value} />}
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					side="top"
					align="start"
					sideOffset={8}
					data-slot="colour-picker"
					className={cn(
						"w-55 p-3 z-50",
						"bg-popover text-popover-foreground",
						"border rounded-lg shadow-md",
						"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
						"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				>
					<ColourPickerContent value={value} onChange={onChange} onStart={onStart} />
					<PopoverPrimitive.Arrow className="fill-popover" />
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	)
}

export {
	ColourPicker,
	ColourPickerContent,
	ColourSwatch,
	ColourInput,
	type ColourSwatchProps,
	type ColourInputProps,
	type ColourPickerContentProps,
	type ColourPickerProps,
}
