"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			className={cn(
				"relative flex border-[0.5px] rounded-md w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className="h-7  relative grow overflow-hidden rounded-md bg-background data-horizontal:h-7 data-horizontal:w-full data-vertical:h-full data-vertical:w-7"
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className="absolute bg-muted select-none data-horizontal:h-full data-vertical:w-full"
				/>
			</SliderPrimitive.Track>
		</SliderPrimitive.Root>
	)
}

export { Slider }
