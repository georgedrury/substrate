"use client"

import { useEffect, useCallback, useRef } from "react"

type UseClipboardOptions<T> = {
	/** Return the items to copy from the current selection */
	onCopy: () => T[]
	/** Called when pasting – receives the deserialized items */
	onPaste: (items: T[]) => void
	/** Called when cutting – return items to copy, then they'll be removed */
	onCut?: () => T[]
	/** Custom serialization (defaults to JSON) */
	serialize?: (items: T[]) => string
	/** Custom deserialization (defaults to JSON) */
	deserialize?: (data: string) => T[]
	/** Clipboard data type key */
	dataType?: string
	/** Disable the hook */
	disabled?: boolean
}

function useClipboard<T>({
	onCopy,
	onPaste,
	onCut,
	serialize = (items) => JSON.stringify(items),
	deserialize = (data) => JSON.parse(data) as T[],
	dataType = "application/x-substrate-clipboard",
	disabled,
}: UseClipboardOptions<T>) {
	const clipboardRef = useRef<string | null>(null)

	const copy = useCallback(() => {
		const items = onCopy()
		if (items.length === 0) return
		clipboardRef.current = serialize(items)

		// Also write to system clipboard if possible
		try {
			navigator.clipboard.writeText(clipboardRef.current)
		} catch {
			// Fallback: internal clipboard only
		}
	}, [onCopy, serialize])

	const cut = useCallback(() => {
		const items = onCut ? onCut() : onCopy()
		if (items.length === 0) return
		clipboardRef.current = serialize(items)

		try {
			navigator.clipboard.writeText(clipboardRef.current)
		} catch {
			// Fallback: internal clipboard only
		}
	}, [onCopy, onCut, serialize])

	const paste = useCallback(async () => {
		let data = clipboardRef.current

		// Try reading from system clipboard first
		try {
			const text = await navigator.clipboard.readText()
			if (text) data = text
		} catch {
			// Use internal clipboard
		}

		if (!data) return

		try {
			const items = deserialize(data)
			onPaste(items)
		} catch {
			// Invalid data format – ignore
		}
	}, [deserialize, onPaste])

	useEffect(() => {
		if (disabled) return

		const handler = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

			const meta = e.metaKey || e.ctrlKey
			if (!meta) return

			switch (e.key.toLowerCase()) {
				case "c":
					e.preventDefault()
					copy()
					break
				case "x":
					e.preventDefault()
					cut()
					break
				case "v":
					e.preventDefault()
					paste()
					break
			}
		}

		document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	}, [copy, cut, paste, disabled])

	return { copy, cut, paste }
}

export { useClipboard, type UseClipboardOptions }
