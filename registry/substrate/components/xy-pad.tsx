"use client"

import { cn } from "@/lib/utils"

// ── Types ──

type XYPadValue = {
	x: number
	y: number
}

type XYPadAxis = {
	min: number
	max: number
	step?: number
}

const DEFAULT_AXIS: XYPadAxis = { min: -1, max: 1, step: 0.01 }
const GRID_DIVISIONS = 6

function snap(value: number, { min, max, step }: XYPadAxis): number {
	const clamped = Math.min(max, Math.max(min, value))
	if (!step || step <= 0) return clamped
	const snapped = min + Math.round((clamped - min) / step) * step
	// Trim floating point noise from the step multiplication
	const places = String(step).split(".")[1]?.length ?? 0
	return Math.min(max, Number(snapped.toFixed(places)))
}

// ── XYPad ──

type XYPadProps = {
	value: XYPadValue
	onChange: (value: XYPadValue) => void
	/** Fires once when a drag or key press begins, for grouping undo steps */
	onStart?: () => void
	/** Horizontal axis; defaults to -1 to 1 in steps of 0.01 */
	x?: XYPadAxis
	/** Vertical axis, positive upwards; defaults to -1 to 1 in steps of 0.01 */
	y?: XYPadAxis
	disabled?: boolean
}

function XYPad({
	value,
	onChange,
	onStart,
	x: xAxis = DEFAULT_AXIS,
	y: yAxis = DEFAULT_AXIS,
	disabled,
	className,
	...props
}: XYPadProps & Omit<React.ComponentProps<"div">, "onChange" | "defaultValue">) {
	const xRange = xAxis.max - xAxis.min || 1
	const yRange = yAxis.max - yAxis.min || 1

	const fromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect()
		const px = (event.clientX - rect.left) / rect.width
		const py = (event.clientY - rect.top) / rect.height
		onChange({
			x: snap(xAxis.min + px * xRange, xAxis),
			y: snap(yAxis.max - py * yRange, yAxis),
		})
	}

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (disabled || event.button !== 0) return
		event.currentTarget.setPointerCapture(event.pointerId)
		event.currentTarget.focus()
		onStart?.()
		fromPointer(event)
	}

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
		fromPointer(event)
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return
		const factor = event.shiftKey ? 10 : 1
		const xStep = (xAxis.step || xRange / 100) * factor
		const yStep = (yAxis.step || yRange / 100) * factor
		let next: XYPadValue | undefined
		switch (event.key) {
			case "ArrowLeft":
				next = { x: snap(value.x - xStep, xAxis), y: value.y }
				break
			case "ArrowRight":
				next = { x: snap(value.x + xStep, xAxis), y: value.y }
				break
			case "ArrowUp":
				next = { x: value.x, y: snap(value.y + yStep, yAxis) }
				break
			case "ArrowDown":
				next = { x: value.x, y: snap(value.y - yStep, yAxis) }
				break
		}
		if (!next) return
		event.preventDefault()
		if (!event.repeat) onStart?.()
		onChange(next)
	}

	const left = ((value.x - xAxis.min) / xRange) * 100
	const top = ((yAxis.max - value.y) / yRange) * 100
	// Emphasise the zero lines when the range crosses zero
	const zeroX = xAxis.min < 0 && xAxis.max > 0 ? (-xAxis.min / xRange) * 100 : undefined
	const zeroY = yAxis.min < 0 && yAxis.max > 0 ? (yAxis.max / yRange) * 100 : undefined

	return (
		<div
			data-slot="xy-pad"
			role="slider"
			tabIndex={disabled ? -1 : 0}
			aria-disabled={disabled || undefined}
			aria-valuenow={value.x}
			aria-valuemin={xAxis.min}
			aria-valuemax={xAxis.max}
			aria-valuetext={`x ${value.x}, y ${value.y}`}
			className={cn(
				"relative h-40 w-full touch-none select-none overflow-hidden rounded-md bg-muted/50 text-foreground outline-none",
				"cursor-crosshair focus-visible:ring-[3px] focus-visible:ring-ring/50",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onKeyDown={handleKeyDown}
			{...props}
		>
			<svg
				aria-hidden="true"
				className="absolute inset-0 size-full"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				{Array.from({ length: GRID_DIVISIONS - 1 }, (_, i) => {
					const at = ((i + 1) / GRID_DIVISIONS) * 100
					return (
						<g key={i} stroke="currentColor" strokeOpacity={0.08}>
							<line x1={at} x2={at} y1={0} y2={100} vectorEffect="non-scaling-stroke" />
							<line x1={0} x2={100} y1={at} y2={at} vectorEffect="non-scaling-stroke" />
						</g>
					)
				})}
				<g stroke="currentColor" strokeOpacity={0.2}>
					{zeroX !== undefined && (
						<line x1={zeroX} x2={zeroX} y1={0} y2={100} vectorEffect="non-scaling-stroke" />
					)}
					{zeroY !== undefined && (
						<line x1={0} x2={100} y1={zeroY} y2={zeroY} vectorEffect="non-scaling-stroke" />
					)}
				</g>
				<g stroke="var(--xy-pad-handle, currentColor)" strokeOpacity={0.35}>
					<line x1={left} x2={left} y1={0} y2={100} vectorEffect="non-scaling-stroke" />
					<line x1={0} x2={100} y1={top} y2={top} vectorEffect="non-scaling-stroke" />
				</g>
			</svg>
			<span
				data-slot="xy-pad-handle"
				aria-hidden="true"
				className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-sm"
				style={{
					left: `${left}%`,
					top: `${top}%`,
					background: "var(--xy-pad-handle, currentColor)",
				}}
			/>
		</div>
	)
}

export { XYPad, type XYPadProps, type XYPadValue, type XYPadAxis }
