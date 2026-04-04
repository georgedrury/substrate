"use client"

import { useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

type TextAreaProps = {
	autoResize?: boolean
	minRows?: number
	maxRows?: number
} & React.ComponentProps<"textarea">

function TextArea({
	autoResize = true,
	minRows = 2,
	maxRows = 10,
	className,
	onChange,
	value,
	...props
}: TextAreaProps) {
	const ref = useRef<HTMLTextAreaElement>(null)

	const resize = useCallback(() => {
		const el = ref.current
		if (!el || !autoResize) return
		el.style.height = "auto"
		const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 16
		const minHeight = lineHeight * minRows + 16 // 16 for padding
		const maxHeight = lineHeight * maxRows + 16
		el.style.height = `${Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)}px`
	}, [autoResize, minRows, maxRows])

	useEffect(() => {
		resize()
	}, [value, resize])

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChange?.(e)
			resize()
		},
		[onChange, resize],
	)

	return (
		<textarea
			ref={ref}
			data-slot="text-area"
			value={value}
			onChange={handleChange}
			className={cn(
				"w-full rounded-md border border-input bg-input/40 px-2 py-1.5 text-xs",
				"outline-none resize-none",
				"placeholder:text-muted-foreground",
				"focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
				"disabled:opacity-50 disabled:pointer-events-none",
				className,
			)}
			rows={minRows}
			{...props}
		/>
	)
}

export { TextArea, type TextAreaProps }
