"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import {
	Action,
	ActionControls,
	ActionLabel,
} from "@/components/substrate/action"
import { NumberSlider } from "@/components/substrate/number-slider"
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/components/substrate/toggle-group"
import {
	DEFAULT_PHYSICS_SPRING,
	DEFAULT_TIME_SPRING,
	springMode,
	springParams,
	springProgress,
	type Spring,
	type SpringMode,
} from "@/lib/substrate/spring"

// ── SpringCurve ──

type SpringCurveProps = {
	value: Spring
	/** Seconds shown across the width */
	duration?: number
}

const CURVE_WIDTH = 256
const CURVE_HEIGHT = 120
const CURVE_STEPS = 120

function SpringCurve({
	value,
	duration = 2,
	className,
	...props
}: SpringCurveProps & React.ComponentProps<"svg">) {
	const params = springParams(value)
	const samples: number[] = []
	for (let i = 0; i <= CURVE_STEPS; i++) {
		samples.push(springProgress((i / CURVE_STEPS) * duration, params))
	}

	// Always show the start and the target, plus any overshoot
	const low = Math.min(0, ...samples)
	const high = Math.max(1, ...samples)
	const pad = CURVE_HEIGHT * 0.12
	const toY = (progress: number) =>
		CURVE_HEIGHT - pad - ((progress - low) / (high - low)) * (CURVE_HEIGHT - pad * 2)

	const path = samples
		.map((progress, i) => {
			const x = (i / CURVE_STEPS) * CURVE_WIDTH
			return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${toY(progress).toFixed(2)}`
		})
		.join(" ")

	return (
		<svg
			data-slot="spring-curve"
			viewBox={`0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}`}
			preserveAspectRatio="none"
			aria-hidden="true"
			className={cn("h-30 w-full rounded-md bg-muted/50 text-foreground", className)}
			{...props}
		>
			{[1, 2, 3].map((i) => (
				<line
					key={i}
					x1={(CURVE_WIDTH / 4) * i}
					x2={(CURVE_WIDTH / 4) * i}
					y1={0}
					y2={CURVE_HEIGHT}
					stroke="currentColor"
					strokeOpacity={0.08}
					vectorEffect="non-scaling-stroke"
				/>
			))}
			<line
				x1={0}
				x2={CURVE_WIDTH}
				y1={toY(1)}
				y2={toY(1)}
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeDasharray="2 2"
				vectorEffect="non-scaling-stroke"
			/>
			<path
				d={path}
				fill="none"
				stroke="var(--spring-curve, currentColor)"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	)
}

// ── SpringFields ──

type SpringFieldsProps = {
	value: Spring
	onChange: (value: Spring) => void
	onStart?: () => void
}

/** Sliders for the spring's own mode: duration and bounce, or stiffness, damping and mass */
function SpringFields({ value, onChange, onStart }: SpringFieldsProps) {
	if (springMode(value) === "time") {
		const update = (key: "visualDuration" | "bounce", next: number) => {
			onChange({
				type: "spring",
				visualDuration: value.visualDuration ?? DEFAULT_TIME_SPRING.visualDuration,
				bounce: value.bounce ?? DEFAULT_TIME_SPRING.bounce,
				[key]: next,
			})
		}
		return (
			<>
				<SpringRow label="Duration">
					<NumberSlider
						value={value.visualDuration ?? DEFAULT_TIME_SPRING.visualDuration}
						onChange={(next) => update("visualDuration", next)}
						onStart={onStart}
						min={0.1}
						max={1}
						step={0.05}
						suffix="s"
					/>
				</SpringRow>
				<SpringRow label="Bounce">
					<NumberSlider
						value={value.bounce ?? DEFAULT_TIME_SPRING.bounce}
						onChange={(next) => update("bounce", next)}
						onStart={onStart}
						min={0}
						max={1}
						step={0.05}
					/>
				</SpringRow>
			</>
		)
	}

	const update = (key: "stiffness" | "damping" | "mass", next: number) => {
		onChange({
			type: "spring",
			stiffness: value.stiffness ?? DEFAULT_PHYSICS_SPRING.stiffness,
			damping: value.damping ?? DEFAULT_PHYSICS_SPRING.damping,
			mass: value.mass ?? DEFAULT_PHYSICS_SPRING.mass,
			[key]: next,
		})
	}
	return (
		<>
			<SpringRow label="Stiffness">
				<NumberSlider
					value={value.stiffness ?? DEFAULT_PHYSICS_SPRING.stiffness}
					onChange={(next) => update("stiffness", next)}
					onStart={onStart}
					min={1}
					max={1000}
					step={10}
					precision={0}
				/>
			</SpringRow>
			<SpringRow label="Damping">
				<NumberSlider
					value={value.damping ?? DEFAULT_PHYSICS_SPRING.damping}
					onChange={(next) => update("damping", next)}
					onStart={onStart}
					min={1}
					max={100}
					step={1}
					precision={0}
				/>
			</SpringRow>
			<SpringRow label="Mass">
				<NumberSlider
					value={value.mass ?? DEFAULT_PHYSICS_SPRING.mass}
					onChange={(next) => update("mass", next)}
					onStart={onStart}
					min={0.1}
					max={10}
					step={0.1}
					precision={1}
				/>
			</SpringRow>
		</>
	)
}

function SpringRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<Action>
			<ActionLabel>{label}</ActionLabel>
			<ActionControls>{children}</ActionControls>
		</Action>
	)
}

// ── SpringEditor ──

type SpringEditorProps = {
	value: Spring
	onChange: (value: Spring) => void
	onStart?: () => void
}

function SpringEditor({
	value,
	onChange,
	onStart,
	className,
	...props
}: SpringEditorProps & Omit<React.ComponentProps<"div">, "onChange">) {
	const mode = springMode(value)

	// Switching mode and back restores what was there before
	const lastByMode = useRef<Record<SpringMode, Spring>>({
		time: DEFAULT_TIME_SPRING,
		physics: DEFAULT_PHYSICS_SPRING,
	})

	return (
		<div
			data-slot="spring-editor"
			className={cn("flex flex-col gap-1", className)}
			{...props}
		>
			<SpringCurve value={value} className="mb-1" />
			<SpringRow label="Type">
				<ToggleGroup
					type="single"
					value={mode}
					onValueChange={(next: string) => {
						if (next !== "time" && next !== "physics") return
						lastByMode.current[mode] = value
						onStart?.()
						onChange(lastByMode.current[next])
					}}
					className="w-full"
				>
					<ToggleGroupItem value="time" className="flex-1">
						Time
					</ToggleGroupItem>
					<ToggleGroupItem value="physics" className="flex-1">
						Physics
					</ToggleGroupItem>
				</ToggleGroup>
			</SpringRow>
			<SpringFields value={value} onChange={onChange} onStart={onStart} />
		</div>
	)
}

export {
	SpringCurve,
	SpringEditor,
	SpringFields,
	type SpringCurveProps,
	type SpringEditorProps,
	type SpringFieldsProps,
}
