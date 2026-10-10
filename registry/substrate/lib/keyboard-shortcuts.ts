/**
 * Declarative keyboard shortcut registration.
 *
 * Replaces big switch statements with a structured map:
 * ```ts
 * const dispose = createKeyboardShortcuts([
 *   { key: "z", meta: true, handler: undo },
 *   { key: "z", meta: true, shift: true, handler: redo },
 *   { key: "Delete", handler: deleteSelected },
 *   { key: "a", meta: true, handler: selectAll, preventDefault: true },
 * ])
 * // Later:
 * dispose()
 * ```
 */

type ShortcutEntry = {
	/** The key value (e.g. "z", "Delete", "ArrowUp", " ") */
	key: string
	/** Require Meta (⌘ on Mac) */
	meta?: boolean
	/** Require Ctrl */
	ctrl?: boolean
	/** Require Shift */
	shift?: boolean
	/** Require Alt/Option */
	alt?: boolean
	/** The callback to run when matched */
	handler: (e: KeyboardEvent) => void
	/** Call preventDefault on the event (default: true) */
	preventDefault?: boolean
	/** Only fire when no input/textarea/contenteditable is focused (default: true) */
	ignoreInputs?: boolean
	/** A human-readable label for UI display (e.g. "Undo") */
	label?: string
	/** A group name for UI display (e.g. "Edit") */
	group?: string
}

type KeyboardShortcutsOptions = {
	/** The element to listen on (defaults to document) */
	target?: EventTarget
	/** Disable all shortcuts */
	disabled?: boolean
}

function matchesShortcut(e: KeyboardEvent, shortcut: ShortcutEntry): boolean {
	if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) return false
	if (shortcut.meta && !(e.metaKey || e.ctrlKey)) return false
	if (shortcut.ctrl && !e.ctrlKey) return false
	if (shortcut.shift && !e.shiftKey) return false
	if (shortcut.alt && !e.altKey) return false

	// If modifier not required, ensure it's not pressed (avoid false matches)
	// Exception: meta check already covers ctrl on non-Mac, so skip ctrl inverse check when meta is set
	if (!shortcut.meta && !shortcut.ctrl && (e.metaKey || e.ctrlKey)) return false
	if (!shortcut.shift && e.shiftKey) return false
	if (!shortcut.alt && e.altKey) return false

	return true
}

function isInputElement(target: EventTarget | null): boolean {
	if (!target || !(target instanceof HTMLElement)) return false
	const tag = target.tagName
	return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
}

/**
 * Register a set of keyboard shortcuts. Returns a dispose function.
 */
function createKeyboardShortcuts(
	shortcuts: ShortcutEntry[],
	options?: KeyboardShortcutsOptions,
): () => void {
	const target = options?.target ?? (typeof document !== "undefined" ? document : null)
	if (!target) return () => {}

	const handler = (event: Event) => {
		if (options?.disabled) return
		const e = event as KeyboardEvent

		for (const shortcut of shortcuts) {
			const ignoreInputs = shortcut.ignoreInputs ?? true
			if (ignoreInputs && isInputElement(e.target)) continue
			if (!matchesShortcut(e, shortcut)) continue

			const shouldPrevent = shortcut.preventDefault ?? true
			if (shouldPrevent) e.preventDefault()

			shortcut.handler(e)
			return // First match wins
		}
	}

	target.addEventListener("keydown", handler)
	return () => target.removeEventListener("keydown", handler)
}

/**
 * Format a ShortcutEntry into a human-readable key string.
 * e.g. { key: "z", meta: true, shift: true } → "⌘+Shift+Z"
 */
function formatShortcut(shortcut: Pick<ShortcutEntry, "key" | "meta" | "ctrl" | "shift" | "alt">): string {
	const parts: string[] = []

	if (shortcut.meta) parts.push("⌘")
	if (shortcut.ctrl) parts.push("Ctrl")
	if (shortcut.alt) parts.push("Alt")
	if (shortcut.shift) parts.push("Shift")

	// Capitalise single-character keys, use display names for special keys
	const keyDisplay: Record<string, string> = {
		" ": "Space",
		arrowup: "↑",
		arrowdown: "↓",
		arrowleft: "←",
		arrowright: "→",
		delete: "Del",
		backspace: "⌫",
		enter: "↵",
		escape: "Esc",
		tab: "Tab",
	}

	const lower = shortcut.key.toLowerCase()
	const display = keyDisplay[lower] ?? (shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key)
	parts.push(display)

	return parts.join("+")
}

export {
	createKeyboardShortcuts,
	formatShortcut,
	matchesShortcut,
	type ShortcutEntry,
	type KeyboardShortcutsOptions,
}
