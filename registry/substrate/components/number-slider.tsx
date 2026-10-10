"use client"

import { useCallback, useRef } from "react"
import { Slider } from "@/registry/substrate/components/slider"
import { NumberInput } from "@/registry/substrate/components/number-input"
import { cn } from "@/lib/utils"

type NumberSliderProps = {
	value: number
	onChange: (value: number) => void
	onStart?: () => void
	min?: number
	max?: number
	step?: number
	shiftStep?: number
	precision?: number
	label?: string
	suffix?: string
	disabled?: boolean
} & Omit<React.ComponentProps<"div">, "value" | "onChange" | "defaultValue">

function NumberSlider({
	value,
	onChange,
	onStart,
	min = 0,
	max = 100,
	step = 1,
	shiftStep = 10,
	precision = 2,
	label,
	suffix,
	disabled,
	className,
	...props
}: NumberSliderProps) {
	// Radix has no gesture-start event, so the first change after a commit marks the start
	const gestureActive = useRef(false)

	const handleSliderChange = useCallback(
		(values: number[]) => {
			if (!gestureActive.current) {
				gestureActive.current = true
				onStart?.()
			}
			onChange(values[0])
		},
		[onChange, onStart],
	)

	const handleSliderCommit = useCallback(() => {
		gestureActive.current = false
	}, [])

	return (
		<div
			data-slot="number-slider"
			className={cn(
				"flex items-center gap-2 w-full",
				disabled && "opacity-50 pointer-events-none",
				className,
			)}
			{...props}
		>
			<Slider
				value={[value]}
				onValueChange={handleSliderChange}
				onValueCommit={handleSliderCommit}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				className="flex-1"
			/>
			<NumberInput
				value={value}
				onChange={onChange}
				onStart={onStart}
				min={min}
				max={max}
				step={step}
				shiftStep={shiftStep}
				precision={precision}
				label={label}
				suffix={suffix}
				disabled={disabled}
				className="w-18"
			/>
		</div>
	)
}

export { NumberSlider, type NumberSliderProps }
