"use client"

import { useState, useRef, useCallback } from "react"

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

type UseDragReorderReturn<T> = {
	/** Spread these props on each draggable item */
	getDragItemProps: (index: number) => DragItemProps
	/** Index of the item currently being dragged, or null */
	dragIndex: number | null
	/** Index where the item would be dropped, or null */
	dropIndex: number | null
	/** Whether a drag is in progress */
	isDragging: boolean
}

function useDragReorder<T>({
	items,
	onReorder,
	threshold = 3,
}: UseDragReorderOptions<T>): UseDragReorderReturn<T> {
	const [dragIndex, setDragIndex] = useState<number | null>(null)
	const [dropIndex, setDropIndex] = useState<number | null>(null)
	const [isDragging, setIsDragging] = useState(false)

	const stateRef = useRef({
		startY: 0,
		itemHeight: 0,
		startIndex: 0,
		hasMoved: false,
	})

	const handlePointerDown = useCallback(
		(index: number) => (e: React.PointerEvent) => {
			e.preventDefault()
			const target = e.currentTarget as HTMLElement
			;(target).setPointerCapture(e.pointerId)

			stateRef.current = {
				startY: e.clientY,
				itemHeight: target.getBoundingClientRect().height,
				startIndex: index,
				hasMoved: false,
			}

			const handleMove = (moveEvent: PointerEvent) => {
				const state = stateRef.current
				const dy = moveEvent.clientY - state.startY

				if (!state.hasMoved && Math.abs(dy) < threshold) return

				if (!state.hasMoved) {
					state.hasMoved = true
					setDragIndex(index)
					setIsDragging(true)
				}

				const offset = Math.round(dy / state.itemHeight)
				const newIndex = Math.max(0, Math.min(items.length - 1, state.startIndex + offset))
				setDropIndex(newIndex)
			}

			const handleUp = () => {
				const state = stateRef.current
				target.releasePointerCapture(e.pointerId)
				target.removeEventListener("pointermove", handleMove)
				target.removeEventListener("pointerup", handleUp)

				if (state.hasMoved && dragIndex !== null) {
					const from = state.startIndex
					const to = dropIndex ?? from
					if (from !== to) {
						const reordered = [...items]
						const [moved] = reordered.splice(from, 1)
						reordered.splice(to, 0, moved)
						onReorder(reordered)
					}
				}

				setDragIndex(null)
				setDropIndex(null)
				setIsDragging(false)
			}

			target.addEventListener("pointermove", handleMove)
			target.addEventListener("pointerup", handleUp)
		},
		[items, onReorder, threshold, dragIndex, dropIndex],
	)

	const getDragItemProps = useCallback(
		(index: number): DragItemProps => ({
			onPointerDown: handlePointerDown(index),
			style: {
				opacity: dragIndex === index ? 0.5 : 1,
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
