"use client"

import { useState } from "react"
import { ImagePicker } from "@/registry/substrate/components/image-picker"

// Inline gradients so the demo needs no network
const swatch = (from: string, to: string) =>
	`data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="4" height="4" fill="url(#g)"/></svg>`,
	)}`

const options = [
	{ value: swatch("#f97316", "#facc15"), label: "Sunrise" },
	{ value: swatch("#0ea5e9", "#a78bfa"), label: "Dusk" },
	{ value: swatch("#22c55e", "#14b8a6"), label: "Moss" },
]

export default function ImagePickerDemo() {
	const [image, setImage] = useState(options[0].value)

	return (
		<div className="w-64">
			<ImagePicker value={image} onChange={setImage} options={options} />
		</div>
	)
}
