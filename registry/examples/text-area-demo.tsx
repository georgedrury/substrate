"use client"

import { useState } from "react"
import { TextArea } from "@/registry/substrate/components/text-area"

export default function TextAreaDemo() {
	const [value, setValue] = useState("The quick brown fox jumps over the lazy dog.")

	return (
		<div className="w-[260px]">
			<TextArea
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Enter text content..."
			/>
		</div>
	)
}
