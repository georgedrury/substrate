"use client"

import { useState, useCallback, useRef } from "react"

type UseSelectionOptions<T extends string = string> = {
	/** All item IDs in display order – needed for shift-click range selection */
	items: T[]
	/** Called when selection changes */
	onSelectionChange?: (ids: Set<T>) => void
}

type UseSelectionReturn<T extends string = string> = {
	selectedIds: Set<T>
	/** Handle a click on an item – supports cmd-click toggle and shift-click range */
	select: (id: T, event?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => void
	/** Select specific IDs, replacing the current selection */
	setSelection: (ids: T[]) => void
	/** Select all items */
	selectAll: () => void
	/** Clear the selection */
	deselectAll: () => void
	/** Check if an item is selected */
	isSelected: (id: T) => boolean
}

function useSelection<T extends string = string>({
	items,
	onSelectionChange,
}: UseSelectionOptions<T>): UseSelectionReturn<T> {
	const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set())
	const lastSelectedRef = useRef<T | null>(null)

	const updateSelection = useCallback(
		(next: Set<T>) => {
			setSelectedIds(next)
			onSelectionChange?.(next)
		},
		[onSelectionChange],
	)

	const select = useCallback(
		(id: T, event?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
			const meta = event?.metaKey || event?.ctrlKey

			// Shift-click: range selection
			if (event?.shiftKey && lastSelectedRef.current) {
				const startIndex = items.indexOf(lastSelectedRef.current)
				const endIndex = items.indexOf(id)
				if (startIndex !== -1 && endIndex !== -1) {
					const from = Math.min(startIndex, endIndex)
					const to = Math.max(startIndex, endIndex)
					const range = items.slice(from, to + 1)
					const next = meta ? new Set(selectedIds) : new Set<T>()
					for (const item of range) next.add(item)
					updateSelection(next)
					return
				}
			}

			// Cmd/Ctrl-click: toggle
			if (meta) {
				const next = new Set(selectedIds)
				if (next.has(id)) next.delete(id)
				else next.add(id)
				lastSelectedRef.current = id
				updateSelection(next)
				return
			}

			// Plain click: single select
			lastSelectedRef.current = id
			updateSelection(new Set([id]))
		},
		[items, selectedIds, updateSelection],
	)

	const setSelection = useCallback(
		(ids: T[]) => {
			lastSelectedRef.current = ids[ids.length - 1] ?? null
			updateSelection(new Set(ids))
		},
		[updateSelection],
	)

	const selectAll = useCallback(() => {
		updateSelection(new Set(items))
	}, [items, updateSelection])

	const deselectAll = useCallback(() => {
		lastSelectedRef.current = null
		updateSelection(new Set())
	}, [updateSelection])

	const isSelected = useCallback(
		(id: T) => selectedIds.has(id),
		[selectedIds],
	)

	return { selectedIds, select, setSelection, selectAll, deselectAll, isSelected }
}

export { useSelection, type UseSelectionOptions, type UseSelectionReturn }
