"use client"

import { Slider } from "@/registry/substrate/components/slider"

export default function SliderDemo() {
	return (
		<div className="w-[260px]">
			<Slider defaultValue={[50]} max={100} step={1} />
		</div>
	)
}
