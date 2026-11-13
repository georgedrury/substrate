"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
	DialStore,
	isEasingConfigValue,
	isSpringConfigValue,
	type ControlMeta,
	type DialPadAxis,
	type DialValue,
	type EasingConfig,
	type PanelConfig,
	type Preset,
	type TransitionConfig,
} from "dialkit/store"
import {
	RiAddLine,
	RiArrowDownSLine,
	RiCheckLine,
	RiDeleteBinLine,
	RiFileCopyLine,
	RiRestartLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"
import {
	Pane,
	PaneAction,
	PaneHeader,
	PaneLabel,
} from "@/components/substrate/pane"
import {
	CollapsiblePane,
	CollapsiblePaneContent,
	CollapsiblePaneHeader,
	CollapsiblePaneLabel,
} from "@/components/substrate/collapsible-pane"
import {
	Action,
	ActionControls,
	ActionLabel,
} from "@/components/substrate/action"
import { NumberSlider } from "@/components/substrate/number-slider"
import { NumberInput } from "@/components/substrate/number-input"
import { Toggle } from "@/components/substrate/toggle"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/substrate/select"
import { ColourPicker } from "@/components/substrate/colour-picker"
import { TextArea } from "@/components/substrate/text-area"
import { EasingCurveEditor } from "@/components/substrate/easing-curve-editor"
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/components/substrate/toggle-group"
import { SpringCurve, SpringFields } from "@/components/substrate/spring-editor"
import { XYPad, type XYPadAxis } from "@/components/substrate/xy-pad"
import { ImagePicker } from "@/components/substrate/image-picker"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/substrate/popover"
import {
	formatShortcut,
	getActiveShortcut,
	retainShortcutListener,
	subscribeActiveShortcut,
} from "@/lib/substrate/controls-shortcuts"
import {
	DEFAULT_PHYSICS_SPRING,
	DEFAULT_TIME_SPRING,
	springMode,
} from "@/lib/substrate/spring"

// Renders the panels registered with useControls. The store and config format
// come from DialKit (MIT, © Josh Puckett); the controls are Substrate's own.

const NO_PANELS: PanelConfig[] = []
const NO_PRESETS: Preset[] = []

// ── Controls ──

type ControlsProps = {
	/** Render only the panel with this name or id; all panels when omitted */
	panel?: string
}

function Controls({
	panel,
	className,
	...props
}: ControlsProps & React.ComponentProps<"div">) {
	const panels = useSyncExternalStore(
		(listener) => DialStore.subscribeGlobal(listener),
		() => DialStore.getPanels("panel"),
		() => NO_PANELS,
	)
	const visible = panel
		? panels.filter((p) => p.name === panel || p.id === panel)
		: panels

	useEffect(() => retainShortcutListener(), [])

	return (
		<div
			data-slot="controls"
			className={cn("space-y-3", className)}
			{...props}
		>
			{visible.map((p) => (
				<ControlsPanel key={p.id} panel={p} />
			))}
		</div>
	)
}

// ── ControlsPanel ──

type ControlsPanelProps = {
	panel: PanelConfig
}

function ControlsPanel({
	panel,
	...props
}: ControlsPanelProps & React.ComponentProps<"div">) {
	const values = useSyncExternalStore(
		(listener) => DialStore.subscribe(panel.id, listener),
		() => DialStore.getValues(panel.id),
		() => DialStore.getValues(panel.id),
	)

	return (
		<Pane data-slot="controls-panel" {...props}>
			<PaneHeader className="gap-1">
				<PaneLabel className="mr-auto truncate">{panel.name}</PaneLabel>
				<ControlsVersions panelId={panel.id} panelName={panel.name} />
				<ControlsCopy
					panelName={panel.name}
					getText={() => copyInstruction(panel.name, values)}
				/>
				<PaneAction
					aria-label={`Reset ${panel.name}`}
					title="Reset"
					onClick={() => DialStore.resetValues(panel.id)}
				>
					<RiRestartLine />
				</PaneAction>
			</PaneHeader>
			<div className="space-y-1">
				{panel.controls.map((control) => (
					<ControlsField
						key={control.path}
						panelId={panel.id}
						control={control}
						values={values}
					/>
				))}
			</div>
		</Pane>
	)
}

// ── ControlsField ──

type ControlsFieldProps = {
	panelId: string
	control: ControlMeta
	values: Record<string, DialValue>
}

function ControlsField({ panelId, control, values }: ControlsFieldProps) {
	const value = values[control.path]
	const update = (next: DialValue) =>
		DialStore.updateValue(panelId, control.path, next)
	const activeShortcut = useSyncExternalStore(
		subscribeActiveShortcut,
		getActiveShortcut,
		() => null,
	)
	const shortcut = control.shortcut?.key || control.shortcut?.interaction
		? control.shortcut
		: undefined
	const shortcutProps = shortcut
		? {
				shortcut: formatShortcut(control, shortcut),
				active:
					activeShortcut?.panelId === panelId &&
					activeShortcut.path === control.path,
			}
		: {}

	switch (control.type) {
		case "folder":
			return (
				<CollapsiblePane
					defaultOpen={control.defaultOpen ?? true}
					className="px-0"
				>
					<CollapsiblePaneHeader>
						<CollapsiblePaneLabel>{control.label}</CollapsiblePaneLabel>
					</CollapsiblePaneHeader>
					<CollapsiblePaneContent className="space-y-1 pl-4">
						{control.children?.map((child) => (
							<ControlsField
								key={child.path}
								panelId={panelId}
								control={child}
								values={values}
							/>
						))}
					</CollapsiblePaneContent>
				</CollapsiblePane>
			)

		case "slider": {
			const step = control.step ?? 1
			return (
				<ControlsRow label={control.label} {...shortcutProps}>
					<NumberSlider
						value={typeof value === "number" ? value : 0}
						onChange={update}
						min={control.min}
						max={control.max}
						step={step}
						precision={decimals(step)}
					/>
				</ControlsRow>
			)
		}

		case "toggle": {
			const pressed = value === true
			return (
				<ControlsRow label={control.label} {...shortcutProps}>
					<Toggle pressed={pressed} onPressedChange={update}>
						{pressed ? "On" : "Off"}
					</Toggle>
				</ControlsRow>
			)
		}

		case "select":
			return (
				<ControlsRow label={control.label}>
					<Select
						value={typeof value === "string" ? value : ""}
						onValueChange={update}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{control.options?.map((option) => {
								const item =
									typeof option === "string"
										? { value: option, label: option }
										: option
								return (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								)
							})}
						</SelectContent>
					</Select>
				</ControlsRow>
			)

		case "color": {
			const colour = typeof value === "string" ? value : "#000000"
			return (
				<ControlsRow label={control.label}>
					<ColourPicker value={colour} onChange={update} />
					<span className="text-[11px] font-mono text-muted-foreground truncate">
						{colour}
					</span>
				</ControlsRow>
			)
		}

		case "text":
			return (
				<div data-slot="controls-text" className="space-y-1 py-1">
					<ActionLabel className="w-auto">{control.label}</ActionLabel>
					<TextArea
						value={typeof value === "string" ? value : ""}
						onChange={(event) => update(event.target.value)}
						placeholder={control.placeholder}
						minRows={1}
					/>
				</div>
			)

		case "transition":
			if (!isSpringConfigValue(value) && !isEasingConfigValue(value)) return null
			return (
				<ControlsTransition
					panelId={panelId}
					path={control.path}
					label={control.label}
					value={value}
					onChange={update}
				/>
			)

		case "image":
			return (
				<div data-slot="controls-image" className="space-y-1 py-1">
					<ActionLabel className="w-auto">{control.label}</ActionLabel>
					<ImagePicker
						value={typeof value === "string" ? value : ""}
						onChange={update}
						options={control.options}
					/>
				</div>
			)

		case "pad": {
			const x = padAxis(control.pad?.x)
			const y = padAxis(control.pad?.y)
			const point = isPadValue(value) ? value : { x: 0, y: 0 }
			return (
				<div data-slot="controls-pad" className="space-y-1 py-1">
					<ActionLabel className="w-auto">{control.label}</ActionLabel>
					<XYPad
						aria-label={control.label}
						value={point}
						onChange={update}
						x={x}
						y={y}
					/>
					<ControlsRow label={control.pad?.labels?.x ?? "X"}>
						<NumberInput
							value={point.x}
							onChange={(next) => update({ ...point, x: next })}
							min={x.min}
							max={x.max}
							step={x.step}
							precision={decimals(x.step)}
						/>
					</ControlsRow>
					<ControlsRow label={control.pad?.labels?.y ?? "Y"}>
						<NumberInput
							value={point.y}
							onChange={(next) => update({ ...point, y: next })}
							min={y.min}
							max={y.max}
							step={y.step}
							precision={decimals(y.step)}
						/>
					</ControlsRow>
				</div>
			)
		}

		case "action":
			return (
				<button
					type="button"
					data-slot="controls-action"
					className={cn(
						"h-7 w-full rounded-md bg-accent px-2 text-xs font-medium text-accent-foreground transition-colors",
						"hover:bg-accent/80 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
					)}
					onClick={() => DialStore.triggerAction(panelId, control.path)}
				>
					{control.label}
				</button>
			)

		default:
			return null
	}
}

// ── ControlsRow ──

type ControlsRowProps = {
	label: string
	/** Shortcut description, such as "R+Scroll" */
	shortcut?: string
	/** The shortcut is held and this row is being adjusted */
	active?: boolean
}

function ControlsRow({
	label,
	shortcut,
	active,
	className,
	children,
	...props
}: ControlsRowProps & React.ComponentProps<"div">) {
	return (
		<Action
			data-shortcut-active={active || undefined}
			className={cn(
				"-mx-1 rounded-md px-1 transition-colors",
				active && "bg-accent/60",
				className,
			)}
			{...props}
		>
			<ActionLabel
				className="flex min-w-0 items-center gap-1"
				title={shortcut ? `${label} (${shortcut})` : label}
			>
				<span className="truncate">{label}</span>
				{shortcut && (
					<kbd
						data-slot="controls-shortcut"
						className={cn(
							"shrink-0 font-mono text-[10px] text-muted-foreground/70",
							active && "text-foreground",
						)}
					>
						{shortcut.split("+")[0]}
					</kbd>
				)}
			</ActionLabel>
			<ActionControls>{children}</ActionControls>
		</Action>
	)
}

// ── ControlsVersions ──

type ControlsVersionsProps = {
	panelId: string
	panelName: string
}

// Saved versions of a panel's values, from DialKit's presets. "Version 1" is
// the values before any version was chosen.
function ControlsVersions({ panelId, panelName }: ControlsVersionsProps) {
	const [open, setOpen] = useState(false)
	const presets = useSyncExternalStore(
		(listener) => DialStore.subscribe(panelId, listener),
		() => {
			const list = DialStore.getPresets(panelId)
			return list.length > 0 ? list : NO_PRESETS
		},
		() => NO_PRESETS,
	)
	const activeId = useSyncExternalStore(
		(listener) => DialStore.subscribe(panelId, listener),
		() => DialStore.getActivePresetId(panelId),
		() => null,
	)
	const activeName = presets.find((preset) => preset.id === activeId)?.name ?? "Version 1"

	const choose = (presetId: string | null) => {
		if (presetId) DialStore.loadPreset(panelId, presetId)
		else DialStore.clearActivePreset(panelId)
		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				data-slot="controls-versions"
				aria-label={`${panelName} versions`}
				className={cn(
					"flex h-6 min-w-0 items-center gap-0.5 rounded px-1.5 text-xs text-muted-foreground transition-colors",
					"hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
					"data-[state=open]:bg-accent data-[state=open]:text-foreground",
				)}
			>
				<span className="truncate">{activeName}</span>
				<RiArrowDownSLine className="size-3.5 shrink-0" />
			</PopoverTrigger>
			<PopoverContent align="end" className="w-48 p-1">
				<div role="group" aria-label="Versions" className="flex flex-col">
					<ControlsVersionItem
						name="Version 1"
						selected={activeId === null}
						onSelect={() => choose(null)}
					/>
					{presets.map((preset) => (
						<ControlsVersionItem
							key={preset.id}
							name={preset.name}
							selected={preset.id === activeId}
							onSelect={() => choose(preset.id)}
							onDelete={() => DialStore.deletePreset(panelId, preset.id)}
						/>
					))}
				</div>
				<div role="separator" className="-mx-1 my-1 h-px bg-border" />
				<button
					type="button"
					className={cn(
						"flex h-7 w-full items-center gap-2 rounded-md px-2 text-xs outline-none transition-colors",
						"hover:bg-accent focus-visible:bg-accent",
						"[&_svg]:size-3.5 [&_svg]:shrink-0",
					)}
					onClick={() => {
						DialStore.saveNewPreset(panelId)
						setOpen(false)
					}}
				>
					<RiAddLine />
					New version
				</button>
			</PopoverContent>
		</Popover>
	)
}

type ControlsVersionItemProps = {
	name: string
	selected: boolean
	onSelect: () => void
	onDelete?: () => void
}

function ControlsVersionItem({
	name,
	selected,
	onSelect,
	onDelete,
}: ControlsVersionItemProps) {
	return (
		<div className="group/version flex items-center rounded-md hover:bg-accent has-focus-visible:bg-accent">
			<button
				type="button"
				aria-pressed={selected}
				className="flex h-7 min-w-0 flex-1 items-center gap-2 px-2 text-left text-xs outline-none"
				onClick={onSelect}
			>
				<RiCheckLine
					aria-hidden="true"
					className={cn("size-3.5 shrink-0", !selected && "invisible")}
				/>
				<span className="truncate">{name}</span>
			</button>
			{onDelete && (
				<button
					type="button"
					aria-label={`Delete ${name}`}
					title="Delete"
					className={cn(
						"mr-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground outline-none transition",
						"opacity-0 group-hover/version:opacity-100 focus-visible:opacity-100",
						"hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
						"[&_svg]:size-3",
					)}
					onClick={onDelete}
				>
					<RiDeleteBinLine />
				</button>
			)}
		</div>
	)
}

// ── ControlsCopy ──

type ControlsCopyProps = {
	panelName: string
	/** The text to copy, built when clicked */
	getText: () => string
}

// Copies the current values as an instruction an agent can apply to the
// code, in DialKit's format
function ControlsCopy({ panelName, getText }: ControlsCopyProps) {
	const [copied, setCopied] = useState(false)
	const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)
	useEffect(() => () => clearTimeout(timeout.current), [])

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(getText())
		} catch {
			// Clipboard access can be refused; the icon stays as it was
			return
		}
		setCopied(true)
		clearTimeout(timeout.current)
		timeout.current = setTimeout(() => setCopied(false), 1500)
	}

	return (
		<PaneAction
			aria-label={copied ? "Copied" : `Copy ${panelName} values for an agent`}
			title={copied ? "Copied" : "Copy values"}
			onClick={copy}
		>
			{copied ? <RiCheckLine /> : <RiFileCopyLine />}
		</PaneAction>
	)
}

function copyInstruction(panelName: string, values: Record<string, DialValue>): string {
	const json = JSON.stringify(
		Object.fromEntries(
			Object.entries(values).filter(([path]) => !path.endsWith(".__mode")),
		),
		null,
		2,
	)
	return `Update the useControls configuration for "${panelName}" with these values:

\`\`\`json
${json}
\`\`\`

Apply these values as the new defaults in the useControls call.`
}

// ── ControlsTransition ──

type TransitionMode = "easing" | "simple" | "advanced"

const DEFAULT_EASING: EasingConfig = {
	type: "easing",
	duration: 0.3,
	ease: [0.25, 0.1, 0.25, 1],
}

type ControlsTransitionProps = {
	panelId: string
	path: string
	label: string
	value: TransitionConfig
	onChange: (value: TransitionConfig) => void
}

// One control for easing curves and springs, as in DialKit: switching type
// swaps the value's shape and switching back restores the previous one
function ControlsTransition({
	panelId,
	path,
	label,
	value,
	onChange,
}: ControlsTransitionProps) {
	const mode: TransitionMode =
		value.type === "easing"
			? "easing"
			: springMode(value) === "physics"
				? "advanced"
				: "simple"

	const lastByMode = useRef<Record<TransitionMode, TransitionConfig>>({
		easing: DEFAULT_EASING,
		simple: DEFAULT_TIME_SPRING,
		advanced: DEFAULT_PHYSICS_SPRING,
	})
	const changeMode = (next: string) => {
		if (next !== "easing" && next !== "simple" && next !== "advanced") return
		lastByMode.current[mode] = value
		// Keep DialKit's own record of the mode in step for presets and persistence
		DialStore.updateTransitionMode(panelId, path, next)
		onChange(lastByMode.current[next])
	}

	return (
		<div data-slot="controls-transition" className="space-y-1 py-1">
			<ActionLabel className="w-auto">{label}</ActionLabel>
			{value.type === "easing" ? (
				<EasingCurveEditor
					value={{
						x1: value.ease[0],
						y1: value.ease[1],
						x2: value.ease[2],
						y2: value.ease[3],
					}}
					onChange={(bezier) =>
						onChange({
							...value,
							ease: [bezier.x1, bezier.y1, bezier.x2, bezier.y2],
						})
					}
				/>
			) : (
				<SpringCurve value={value} />
			)}
			<ControlsRow label="Type">
				<ToggleGroup
					type="single"
					value={mode}
					onValueChange={changeMode}
					className="w-full"
				>
					<ToggleGroupItem value="easing" className="flex-1">
						Easing
					</ToggleGroupItem>
					<ToggleGroupItem value="simple" className="flex-1">
						Time
					</ToggleGroupItem>
					<ToggleGroupItem value="advanced" className="flex-1">
						Physics
					</ToggleGroupItem>
				</ToggleGroup>
			</ControlsRow>
			{value.type === "easing" ? (
				<ControlsRow label="Duration">
					<NumberSlider
						value={value.duration}
						onChange={(duration) => onChange({ ...value, duration })}
						min={0.1}
						max={2}
						step={0.05}
						suffix="s"
					/>
				</ControlsRow>
			) : (
				<SpringFields value={value} onChange={onChange} />
			)}
		</div>
	)
}

function padAxis(axis: DialPadAxis | undefined): Required<XYPadAxis> {
	const [, min = -1, max = 1, step = 0.01] = axis ?? []
	return { min, max, step }
}

function isPadValue(value: DialValue | undefined): value is { x: number; y: number } {
	return (
		typeof value === "object" &&
		value !== null &&
		"x" in value &&
		"y" in value &&
		typeof value.x === "number" &&
		typeof value.y === "number"
	)
}

// Decimal places needed to display a step without rounding it away
function decimals(step: number): number {
	const fraction = String(step).split(".")[1]
	return fraction ? fraction.length : 0
}

export {
	Controls,
	ControlsCopy,
	ControlsField,
	ControlsPanel,
	ControlsVersions,
	type ControlsCopyProps,
	type ControlsFieldProps,
	type ControlsProps,
	type ControlsPanelProps,
	type ControlsVersionsProps,
}
