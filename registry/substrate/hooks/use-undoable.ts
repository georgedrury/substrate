"use client"

import { useCallback, useRef, useState } from "react"

type UseUndoableOptions = {
	maxHistory?: number
}

type UseUndoableReturn<T> = {
	/** Push the current state onto the undo stack. Call before mutations. */
	pushSnapshot: (state: T) => void
	/** Undo: returns the previous state, or null if nothing to undo */
	undo: () => T | null
	/** Redo: returns the next state, or null if nothing to redo */
	redo: () => T | null
	/** Whether there are states to undo to */
	canUndo: boolean
	/** Whether there are states to redo to */
	canRedo: boolean
	/** Number of undo states available */
	undoCount: number
	/** Number of redo states available */
	redoCount: number
	/** Clear all history */
	clear: () => void
}

function useUndoable<T>(options?: UseUndoableOptions): UseUndoableReturn<T> {
	const maxHistory = options?.maxHistory ?? 50
	const pastRef = useRef<T[]>([])
	const futureRef = useRef<T[]>([])
	const [, forceUpdate] = useState(0)

	const rerender = useCallback(() => forceUpdate((n) => n + 1), [])

	const pushSnapshot = useCallback(
		(state: T) => {
			pastRef.current = [...pastRef.current.slice(-(maxHistory - 1)), state]
			futureRef.current = []
			rerender()
		},
		[maxHistory, rerender],
	)

	const undo = useCallback((): T | null => {
		if (pastRef.current.length === 0) return null
		const previous = pastRef.current[pastRef.current.length - 1]
		pastRef.current = pastRef.current.slice(0, -1)
		// The caller should pass current state to futureRef via the return value pattern
		// This is a lightweight approach – caller saves current before restoring
		rerender()
		return previous
	}, [rerender])

	const redo = useCallback((): T | null => {
		if (futureRef.current.length === 0) return null
		const next = futureRef.current[0]
		futureRef.current = futureRef.current.slice(1)
		rerender()
		return next
	}, [rerender])

	const clear = useCallback(() => {
		pastRef.current = []
		futureRef.current = []
		rerender()
	}, [rerender])

	return {
		pushSnapshot,
		undo,
		redo,
		canUndo: pastRef.current.length > 0,
		canRedo: futureRef.current.length > 0,
		undoCount: pastRef.current.length,
		redoCount: futureRef.current.length,
		clear,
	}
}

export { useUndoable, type UseUndoableOptions, type UseUndoableReturn }
