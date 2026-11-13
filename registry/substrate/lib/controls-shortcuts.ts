import {
	DialStore,
	type ControlMeta,
	type ShortcutConfig,
} from "dialkit/store"

// Keyboard shortcuts for useControls panels, following DialKit's behaviour
// (MIT, © Josh Puckett): hold a slider's key and scroll, drag or move the
// pointer to adjust it, or use the arrow keys; press a toggle's key to flip it.
// One window listener serves every mounted <Controls />.

type Modifier = NonNullable<ShortcutConfig["modifier"]>
type Interaction = NonNullable<ShortcutConfig["interaction"]>

type Target = {
	panelId: string
	path: string
	control: ControlMeta
	shortcut: ShortcutConfig
}

type ActiveShortcut = { panelId: string; path: string } | null

/** Pixels of pointer travel per slider step when dragging or moving */
const DRAG_SENSITIVITY = 4

// ── Active shortcut, for highlighting the row being adjusted ──

let active: ActiveShortcut = null
const activeListeners = new Set<() => void>()

function setActive(next: ActiveShortcut) {
	if (active?.panelId === next?.panelId && active?.path === next?.path) return
	active = next
	activeListeners.forEach((listener) => listener())
}

function subscribeActiveShortcut(listener: () => void) {
	activeListeners.add(listener)
	return () => {
		activeListeners.delete(listener)
	}
}

function getActiveShortcut(): ActiveShortcut {
	return active
}

// ── Labels ──

function formatModifier(modifier: ShortcutConfig["modifier"]): string {
	return modifier === "alt" ? "⌥" : modifier === "shift" ? "⇧" : modifier === "meta" ? "⌘" : ""
}

/** "R+Scroll" for a slider, "V" for a toggle */
function formatShortcut(control: ControlMeta, shortcut: ShortcutConfig): string {
	const key = shortcut.key ? `${formatModifier(shortcut.modifier)}${shortcut.key.toUpperCase()}` : ""
	if (control.type === "toggle") return key || "Press"
	const interaction = shortcut.interaction ?? "scroll"
	const verb = interaction === "drag" ? "Drag" : interaction === "move" ? "Move" : "Scroll"
	return key ? `${key}+${verb}` : verb
}

// ── Slider maths ──

function effectiveStep(control: ControlMeta, shortcut: ShortcutConfig): number {
	const range = (control.max ?? 1) - (control.min ?? 0)
	const mode = shortcut.mode ?? "normal"
	if (mode === "fine") return range * 0.01
	if (mode === "coarse") return range * 0.1
	return control.step ?? 1
}

function roundToStep(value: number, step: number, min: number, max: number): number {
	const clamped = Math.max(min, Math.min(max, value))
	if (clamped === min || clamped === max || !(step > 0)) return clamped
	const snapped = min + Math.round((clamped - min) / step) * step
	return Math.max(min, Math.min(max, Number(snapped.toPrecision(14))))
}

function nudge(target: Target, steps: number) {
	const current = DialStore.getValue(target.panelId, target.path)
	if (typeof current !== "number") return
	const step = effectiveStep(target.control, target.shortcut)
	const min = target.control.min ?? 0
	const max = target.control.max ?? 1
	DialStore.updateValue(
		target.panelId,
		target.path,
		roundToStep(current + steps * step, step, min, max),
	)
}

// ── Resolution ──

function findControl(controls: ControlMeta[], path: string): ControlMeta | null {
	for (const control of controls) {
		if (control.path === path) return control
		if (control.children) {
			const found = findControl(control.children, path)
			if (found) return found
		}
	}
	return null
}

function modifierOf(event: KeyboardEvent | MouseEvent | WheelEvent): Modifier | undefined {
	if (event.altKey) return "alt"
	if (event.shiftKey) return "shift"
	if (event.metaKey) return "meta"
	return undefined
}

function resolveKey(key: string, modifier: Modifier | undefined): Target | null {
	for (const panel of DialStore.getPanels("panel")) {
		for (const [path, shortcut] of Object.entries(panel.shortcuts)) {
			if (shortcut.key?.toLowerCase() !== key) continue
			if (shortcut.modifier !== modifier) continue
			const control = findControl(panel.controls, path)
			if (control) return { panelId: panel.id, path, control, shortcut }
		}
	}
	return null
}

/** A held key's slider that uses the given interaction */
function resolveHeldSlider(held: Set<string>, interaction: Interaction): Target | null {
	for (const key of held) {
		for (const panel of DialStore.getPanels("panel")) {
			for (const [path, shortcut] of Object.entries(panel.shortcuts)) {
				if (shortcut.key?.toLowerCase() !== key) continue
				if ((shortcut.interaction ?? "scroll") !== interaction) continue
				const control = findControl(panel.controls, path)
				if (control?.type === "slider") {
					return { panelId: panel.id, path, control, shortcut }
				}
			}
		}
	}
	return null
}

function resolveScrollOnly(): Target | null {
	for (const panel of DialStore.getPanels("panel")) {
		for (const [path, shortcut] of Object.entries(panel.shortcuts)) {
			if (shortcut.interaction !== "scroll-only") continue
			const control = findControl(panel.controls, path)
			if (control?.type === "slider") {
				return { panelId: panel.id, path, control, shortcut }
			}
		}
	}
	return null
}

/**
 * Shortcuts pause while letter keys mean something else: typing in a field, or
 * type-ahead in a list or menu. Unlike DialKit, a focused button doesn't pause
 * them, since clicking any control would otherwise switch shortcuts off.
 */
function isEditing(): boolean {
	const element = document.activeElement
	if (!(element instanceof HTMLElement)) return false
	if (element.isContentEditable) return true
	if (element instanceof HTMLInputElement) {
		return !["button", "checkbox", "radio", "range", "reset", "submit", "color", "file"].includes(element.type)
	}
	return Boolean(
		element.closest(
			'textarea, select, [role="listbox"], [role="menu"], [role="combobox"], [role="textbox"]',
		),
	)
}

// ── Listener ──

function createListener() {
	const held = new Set<string>()
	let dragging = false
	let lastX: number | null = null
	let accumulated = 0

	const resetPointer = () => {
		dragging = false
		lastX = null
		accumulated = 0
	}

	const applyTravel = (target: Target, clientX: number) => {
		if (lastX === null) {
			lastX = clientX
			return
		}
		accumulated += clientX - lastX
		lastX = clientX
		const steps = Math.trunc(accumulated / DRAG_SENSITIVITY)
		if (steps === 0) return
		accumulated -= steps * DRAG_SENSITIVITY
		nudge(target, steps)
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (isEditing()) return
		const key = event.key.toLowerCase()

		if (key.startsWith("arrow") && held.size > 0) {
			const target =
				resolveHeldSlider(held, "scroll") ??
				resolveHeldSlider(held, "drag") ??
				resolveHeldSlider(held, "move")
			if (target) {
				event.preventDefault()
				nudge(target, key === "arrowright" || key === "arrowup" ? 1 : -1)
				return
			}
		}

		const repeated = held.has(key)
		held.add(key)
		const target = resolveKey(key, modifierOf(event))
		if (!target) return
		setActive({ panelId: target.panelId, path: target.path })
		if (!repeated) {
			resetPointer()
			if (target.control.type === "toggle") {
				const current = DialStore.getValue(target.panelId, target.path)
				DialStore.updateValue(target.panelId, target.path, current !== true)
			}
		}
	}

	const handleKeyUp = (event: KeyboardEvent) => {
		held.delete(event.key.toLowerCase())
		resetPointer()
		let next: ActiveShortcut = null
		for (const key of held) {
			const target = resolveKey(key, modifierOf(event))
			if (target) {
				next = { panelId: target.panelId, path: target.path }
				break
			}
		}
		setActive(next)
	}

	const handleWheel = (event: WheelEvent) => {
		if (isEditing()) return
		const modifier = modifierOf(event)
		let target: Target | null = null
		for (const key of held) {
			const candidate = resolveKey(key, modifier)
			if (
				candidate?.control.type === "slider" &&
				(candidate.shortcut.interaction ?? "scroll") === "scroll"
			) {
				target = candidate
				break
			}
		}
		target ??= resolveScrollOnly()
		if (!target) return
		event.preventDefault()
		nudge(target, event.deltaY > 0 ? -1 : 1)
	}

	const handleMouseDown = (event: MouseEvent) => {
		if (isEditing() || held.size === 0) return
		if (!resolveHeldSlider(held, "drag")) return
		event.preventDefault()
		dragging = true
		lastX = event.clientX
		accumulated = 0
	}

	const handleMouseMove = (event: MouseEvent) => {
		if (isEditing() || held.size === 0) return
		const target = dragging
			? resolveHeldSlider(held, "drag")
			: resolveHeldSlider(held, "move")
		if (target) applyTravel(target, event.clientX)
	}

	const handleBlur = () => {
		held.clear()
		resetPointer()
		setActive(null)
	}

	window.addEventListener("keydown", handleKeyDown)
	window.addEventListener("keyup", handleKeyUp)
	window.addEventListener("wheel", handleWheel, { passive: false })
	window.addEventListener("mousedown", handleMouseDown)
	window.addEventListener("mouseup", resetPointer)
	window.addEventListener("mousemove", handleMouseMove)
	window.addEventListener("blur", handleBlur)

	return () => {
		window.removeEventListener("keydown", handleKeyDown)
		window.removeEventListener("keyup", handleKeyUp)
		window.removeEventListener("wheel", handleWheel)
		window.removeEventListener("mousedown", handleMouseDown)
		window.removeEventListener("mouseup", resetPointer)
		window.removeEventListener("mousemove", handleMouseMove)
		window.removeEventListener("blur", handleBlur)
		setActive(null)
	}
}

let users = 0
let stop: (() => void) | null = null

/** Start listening while at least one caller holds the returned release */
function retainShortcutListener(): () => void {
	users += 1
	if (users === 1) stop = createListener()
	return () => {
		users -= 1
		if (users === 0) {
			stop?.()
			stop = null
		}
	}
}

export {
	formatShortcut,
	getActiveShortcut,
	retainShortcutListener,
	subscribeActiveShortcut,
	type ActiveShortcut,
}
