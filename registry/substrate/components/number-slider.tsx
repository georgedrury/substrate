"use client"

import { useCallback } from "react"
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
} & Omit<
	React.ComponentProps<"div">,
	"value" | "onChange" | "defaultValue"
>

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
	const handleSliderChange = useCallback(
		(values: number[]) => {
			onChange(values[0])
		},
		[onChange],
	)

	const handleSliderCommit = useCallback(
		(_values: number[]) => {
			// onStart fires at the beginning of a drag gesture
		},
		[],
	)

	return (
		<div
			data-slot="number-slider"
			className={cn(
				"flex items-center gap-2",
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
