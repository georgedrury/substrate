"use client"

import { useSyncExternalStore } from "react"
import {
	DialStore,
	type ControlMeta,
	type DialValue,
	type PanelConfig,
	type TransitionConfig,
} from "dialkit/store"
import { RiRestartLine } from "@remixicon/react"
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

// Renders the panels registered with useControls. The store and config format
// come from DialKit (MIT, © Josh Puckett); the controls are Substrate's own.

const NO_PANELS: PanelConfig[] = []

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
			<PaneHeader>
				<PaneLabel>{panel.name}</PaneLabel>
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
				<ControlsRow label={control.label}>
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
				<ControlsRow label={control.label}>
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

		case "transition": {
			if (!isEasing(value)) {
				return <ControlsUnsupported label={control.label} kind="spring" />
			}
			const [x1, y1, x2, y2] = value.ease
			return (
				<div data-slot="controls-easing" className="space-y-1 py-1">
					<ActionLabel className="w-auto">{control.label}</ActionLabel>
					<EasingCurveEditor
						value={{ x1, y1, x2, y2 }}
						onChange={(bezier) =>
							update({
								...value,
								ease: [bezier.x1, bezier.y1, bezier.x2, bezier.y2],
							})
						}
					/>
					<ControlsRow label="Duration">
						<NumberInput
							value={value.duration}
							onChange={(duration) => update({ ...value, duration })}
							min={0}
							step={0.05}
							suffix="s"
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

		// Substrate has no component for these DialKit controls yet
		case "spring":
		case "image":
		case "pad":
			return <ControlsUnsupported label={control.label} kind={control.type} />

		default:
			return null
	}
}

// ── ControlsRow ──

type ControlsRowProps = {
	label: string
}

function ControlsRow({
	label,
	children,
	...props
}: ControlsRowProps & React.ComponentProps<"div">) {
	return (
		<Action {...props}>
			<ActionLabel className="truncate" title={label}>
				{label}
			</ActionLabel>
			<ActionControls>{children}</ActionControls>
		</Action>
	)
}

// ── ControlsUnsupported ──

type ControlsUnsupportedProps = {
	label: string
	kind: string
}

function ControlsUnsupported({ label, kind }: ControlsUnsupportedProps) {
	return (
		<ControlsRow label={label} data-slot="controls-unsupported">
			<span className="text-xs text-muted-foreground">
				No {kind} control yet
			</span>
		</ControlsRow>
	)
}

function isEasing(
	value: DialValue | undefined,
): value is Extract<TransitionConfig, { type: "easing" }> {
	return (
		typeof value === "object" &&
		value !== null &&
		"type" in value &&
		value.type === "easing" &&
		"ease" in value
	)
}

// Decimal places needed to display a step without rounding it away
function decimals(step: number): number {
	const fraction = String(step).split(".")[1]
	return fraction ? fraction.length : 0
}

export { Controls, ControlsPanel, type ControlsProps, type ControlsPanelProps }
