"use client"

import { useState, useRef, useCallback, useEffect } from "react"

type UseDragReorderOptions<T> = {
	items: T[]
	onReorder: (items: T[]) => void
	/** Pixels to move before a drag starts */
	threshold?: number
}

type DragItemProps = {
	onPointerDown: (e: React.PointerEvent) => void
	style: React.CSSProperties
	"data-dragging"?: boolean
}

type UseDragReorderReturn = {
	/** Spread these props on each draggable item */
	getDragItemProps: (index: number) => DragItemProps
	/** Index of the item currently being dragged, or null */
	dragIndex: number | null
	/** Index where the item would be dropped, or null */
	dropIndex: number | null
	/** Whether a drag is in progress */
	isDragging: boolean
}

// Controls inside a row (visibility toggles, rename inputs) must keep working,
// so a drag never starts on them. Add data-no-drag to opt other elements out.
const INTERACTIVE = "button, input, textarea, select, a, [contenteditable='true'], [data-no-drag]"

function useDragReorder<T>({
	items,
	onReorder,
	threshold = 3,
}: UseDragReorderOptions<T>): UseDragReorderReturn {
	const [dragIndex, setDragIndex] = useState<number | null>(null)
	const [dropIndex, setDropIndex] = useState<number | null>(null)
	const [isDragging, setIsDragging] = useState(false)

	// Pointer listeners outlive the render that created them, so they read the
	// latest values from refs instead of closing over state
	const latest = useRef({ items, onReorder, threshold })
	useEffect(() => {
		latest.current = { items, onReorder, threshold }
	})

	const cleanup = useRef<(() => void) | null>(null)
	useEffect(() => () => cleanup.current?.(), [])

	const handlePointerDown = useCallback(
		(index: number) => (e: React.PointerEvent) => {
			if (e.button !== 0 || (e.target as HTMLElement).closest(INTERACTIVE)) return

			cleanup.current?.()
			const startY = e.clientY
			const itemHeight = (e.currentTarget as HTMLElement).getBoundingClientRect().height
			let hasMoved = false
			let drop = index

			const handleMove = (moveEvent: PointerEvent) => {
				const dy = moveEvent.clientY - startY
				if (!hasMoved && Math.abs(dy) < latest.current.threshold) return

				if (!hasMoved) {
					hasMoved = true
					setDragIndex(index)
					setIsDragging(true)
				}

				const offset = Math.round(dy / itemHeight)
				drop = Math.max(0, Math.min(latest.current.items.length - 1, index + offset))
				setDropIndex(drop)
			}

			// A drag that ends over the row would otherwise also click it
			const swallowClick = (clickEvent: MouseEvent) => {
				clickEvent.stopPropagation()
				clickEvent.preventDefault()
			}

			const stop = () => {
				window.removeEventListener("pointermove", handleMove)
				window.removeEventListener("pointerup", handleUp)
				window.removeEventListener("pointercancel", handleCancel)
				cleanup.current = null
			}

			const finish = () => {
				setDragIndex(null)
				setDropIndex(null)
				setIsDragging(false)
			}

			function handleUp() {
				stop()
				if (hasMoved) {
					window.addEventListener("click", swallowClick, { capture: true, once: true })
					// If no click follows (released elsewhere), don't leave the guard armed
					setTimeout(() => window.removeEventListener("click", swallowClick, { capture: true }), 0)
					if (drop !== index) {
						const reordered = [...latest.current.items]
						const [moved] = reordered.splice(index, 1)
						reordered.splice(drop, 0, moved)
						latest.current.onReorder(reordered)
					}
				}
				finish()
			}

			function handleCancel() {
				stop()
				finish()
			}

			window.addEventListener("pointermove", handleMove)
			window.addEventListener("pointerup", handleUp)
			window.addEventListener("pointercancel", handleCancel)
			cleanup.current = () => {
				stop()
				finish()
			}
		},
		[],
	)

	const getDragItemProps = useCallback(
		(index: number): DragItemProps => ({
			onPointerDown: handlePointerDown(index),
			style: {
				opacity: dragIndex === index ? 0.5 : 1,
				userSelect: isDragging ? "none" : undefined,
				transition: isDragging ? "transform 150ms ease" : undefined,
				transform:
					isDragging && dragIndex !== null && dropIndex !== null && dragIndex !== index
						? index > dragIndex && index <= dropIndex
							? "translateY(-100%)"
							: index < dragIndex && index >= dropIndex
								? "translateY(100%)"
								: undefined
						: undefined,
			},
			...(dragIndex === index ? { "data-dragging": true as const } : {}),
		}),
		[handlePointerDown, dragIndex, dropIndex, isDragging],
	)

	return { getDragItemProps, dragIndex, dropIndex, isDragging }
}

export { useDragReorder, type UseDragReorderOptions, type UseDragReorderReturn }
