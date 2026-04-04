"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

type NumberInputProps = {
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
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "type">

function NumberInput({
	value,
	onChange,
	onStart,
	min,
	max,
	step = 1,
	shiftStep = 10,
	precision = 2,
	label,
	suffix,
	className,
	disabled,
	...props
}: NumberInputProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const dragState = useRef({
		isDragging: false,
		startX: 0,
		startValue: 0,
		hasMoved: false,
		hasCalledOnStart: false,
	})

	const clamp = useCallback(
		(v: number) => {
			if (min !== undefined) v = Math.max(min, v)
			if (max !== undefined) v = Math.min(max, v)
			return v
		},
		[min, max],
	)

	const format = useCallback(
		(v: number) => {
			const rounded = Math.round(v * 10 ** precision) / 10 ** precision
			return Number.isInteger(rounded)
				? String(rounded)
				: rounded.toFixed(precision)
		},
		[precision],
	)

	// ── Drag-to-scrub on label ──

	const handleLabelPointerDown = useCallback(
		(e: React.PointerEvent<HTMLSpanElement>) => {
			if (disabled) return
			e.preventDefault()
			;(e.target as HTMLElement).setPointerCapture(e.pointerId)

			dragState.current = {
				isDragging: true,
				startX: e.clientX,
				startValue: value,
				hasMoved: false,
				hasCalledOnStart: false,
			}
		},
		[value, disabled],
	)

	const handleLabelPointerMove = useCallback(
		(e: React.PointerEvent<HTMLSpanElement>) => {
			const state = dragState.current
			if (!state.isDragging) return

			const dx = e.clientX - state.startX
			if (!state.hasMoved && Math.abs(dx) < 3) return

			state.hasMoved = true

			if (!state.hasCalledOnStart) {
				state.hasCalledOnStart = true
				onStart?.()
			}

			const increment = e.shiftKey ? shiftStep : step
			const newValue = clamp(state.startValue + dx * increment)
			onChange(newValue)
		},
		[step, shiftStep, clamp, onChange, onStart],
	)

	const handleLabelPointerUp = useCallback(
		(e: React.PointerEvent<HTMLSpanElement>) => {
			const state = dragState.current
			;(e.target as HTMLElement).releasePointerCapture(e.pointerId)

			if (!state.hasMoved) {
				inputRef.current?.focus()
				inputRef.current?.select()
			}

			dragState.current = {
				isDragging: false,
				startX: 0,
				startValue: 0,
				hasMoved: false,
				hasCalledOnStart: false,
			}
		},
		[],
	)

	// ── Keyboard step on input ──

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				e.preventDefault()
				const direction = e.key === "ArrowUp" ? 1 : -1
				const increment = e.shiftKey ? shiftStep : step
				const newValue = clamp(value + direction * increment)
				onStart?.()
				onChange(newValue)
			}
			if (e.key === "Enter") {
				commitEdit()
			}
			if (e.key === "Escape") {
				setIsEditing(false)
				inputRef.current?.blur()
			}
		},
		[value, step, shiftStep, clamp, onChange, onStart],
	)

	// ── Direct editing ──

	const handleFocus = useCallback(() => {
		setIsEditing(true)
		setEditValue(format(value))
	}, [value, format])

	const commitEdit = useCallback(() => {
		const num = parseFloat(editValue)
		if (!isNaN(num)) {
			onStart?.()
			onChange(clamp(num))
		}
		setIsEditing(false)
	}, [editValue, clamp, onChange, onStart])

	const handleBlur = useCallback(() => {
		if (isEditing) commitEdit()
	}, [isEditing, commitEdit])

	// Keep edit value in sync when value changes externally during editing
	useEffect(() => {
		if (!isEditing) return
		setEditValue(format(value))
	}, [value, isEditing, format])

	return (
		<div
			data-slot="number-input"
			className={cn(
				"flex items-center h-7 rounded-md  bg-input/40 transition-colors",
				"has-focus-visible:border-ring has-focus-visible:ring-2 has-focus-visible:ring-ring/30",
				disabled && "opacity-50 pointer-events-none",
				className,
			)}
		>
			{label && (
				<span
					data-slot="number-input-label"
					className={cn(
						"select-none px-2 text-xs text-muted-foreground shrink-0",
						!disabled && "cursor-ew-resize",
					)}
					onPointerDown={handleLabelPointerDown}
					onPointerMove={handleLabelPointerMove}
					onPointerUp={handleLabelPointerUp}
				>
					{label}
				</span>
			)}
			<input
				ref={inputRef}
				type="text"
				inputMode="decimal"
				value={isEditing ? editValue : format(value)}
				onChange={(e) => setEditValue(e.target.value)}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				disabled={disabled}
				className={cn(
					"flex-1 min-w-0 bg-transparent text-xs outline-none",
					"px-2 py-0.5 tabular-nums",
					label && "pl-0",
				)}
				{...props}
			/>
			{suffix && (
				<span
					data-slot="number-input-suffix"
					className="pr-2 text-xs text-muted-foreground flex-shrink-0 select-none"
				>
					{suffix}
				</span>
			)}
		</div>
	)
}

export { NumberInput, type NumberInputProps }
