"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
	DialStore,
	formatLabel,
	type ControlMeta,
	type DialValue,
} from "dialkit/store"
import {
	TimelineStore,
	clampClipMove,
	clampClipResizeEnd,
	clampClipResizeStart,
	clampStepResize,
	clampTrackDelay,
	computeClipStaticFromValues,
	formatClock,
	formatSeconds,
	formatStepLabel,
	normalizeTimelineValuesForCopy,
	timelinePopoverDisplayValues,
	type TimelineClipMeta,
	type TimelineMeta,
	type TimelineStepStatic,
} from "dialkit/timeline"
import {
	RiArrowRightSLine,
	RiPauseFill,
	RiPlayFill,
	RiRestartLine,
	RiZoomInLine,
	RiZoomOutLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"
import {
	ControlsCopy,
	ControlsField,
	ControlsVersions,
} from "@/components/substrate/controls"
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/substrate/popover"

// The editor for timelines registered with useControlsTimeline: scrub the
// playhead, drag clips to move or resize them, and click one to edit its
// values. The clip model comes from DialKit's headless timeline (MIT, © Josh
// Puckett); the interface is Substrate's own.

const NO_TIMELINES: TimelineMeta[] = []
const DRAG_THRESHOLD = 3
const LABEL_WIDTH = 112
/** Candidate ruler intervals in seconds; the first that leaves room for labels wins */
const TICK_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60]
const MIN_TICK_SPACING = 56
/** The tightest zoom shows this many seconds across the lane */
const MIN_VISIBLE_SECONDS = 0.2
const ZOOM_STEP = 1.5

type View = { zoom: number; start: number }

function clampView(view: View, duration: number): View {
	const maxZoom = Math.max(1, duration / MIN_VISIBLE_SECONDS)
	const zoom = Math.min(maxZoom, Math.max(1, view.zoom))
	const visible = duration / zoom
	return { zoom, start: Math.min(Math.max(0, view.start), duration - visible) }
}

/** Zoom while keeping the time at `anchor` (0–1 across the lane) in place */
function zoomAround(view: View, nextZoom: number, anchor: number, duration: number): View {
	const visible = duration / view.zoom
	const anchorTime = view.start + anchor * visible
	const nextVisible = duration / nextZoom
	return clampView({ zoom: nextZoom, start: anchorTime - anchor * nextVisible }, duration)
}

// ── ControlsTimeline ──

type ControlsTimelineProps = {
	/** Render only the timeline with this name or id; all timelines when omitted */
	timeline?: string
}

function ControlsTimeline({
	timeline,
	className,
	...props
}: ControlsTimelineProps & React.ComponentProps<"div">) {
	const timelines = useSyncExternalStore(
		(listener) => TimelineStore.subscribeGlobal(listener),
		() => TimelineStore.getTimelines(),
		() => NO_TIMELINES,
	)
	const visible = timeline
		? timelines.filter((t) => t.name === timeline || t.id === timeline)
		: timelines

	return (
		<div
			data-slot="controls-timeline"
			className={cn("flex flex-col divide-y", className)}
			{...props}
		>
			{visible.map((meta) => (
				<ControlsTimelineSection key={meta.id} meta={meta} />
			))}
		</div>
	)
}

// ── ControlsTimelineSection ──

type Selection = {
	/** Clip key, or "clip.prop" for a property track */
	key: string
	stepKey?: string
}

function ControlsTimelineSection({ meta }: { meta: TimelineMeta }) {
	const values = useSyncExternalStore(
		(listener) => DialStore.subscribe(meta.id, listener),
		() => DialStore.getValues(meta.id),
		() => DialStore.getValues(meta.id),
	)
	const transport = useSyncExternalStore(
		(listener) => TimelineStore.subscribe(meta.id, listener),
		() => TimelineStore.getTransport(meta.id),
		() => TimelineStore.getTransport(meta.id),
	)

	const laneRef = useRef<HTMLDivElement>(null)
	const [laneWidth, setLaneWidth] = useState(0)
	useEffect(() => {
		const lane = laneRef.current
		if (!lane) return
		const observer = new ResizeObserver(([entry]) =>
			setLaneWidth(entry.contentRect.width),
		)
		observer.observe(lane)
		return () => observer.disconnect()
	}, [])

	const [selection, setSelection] = useState<Selection | null>(null)
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())
	const [openTracks, setOpenTracks] = useState<Set<string>>(() => new Set())

	const duration = Math.max(meta.duration, 0.01)
	const [rawView, setView] = useState<View>({ zoom: 1, start: 0 })
	const view = clampView(rawView, duration)
	const visibleDuration = duration / view.zoom
	const viewStart = view.start
	const pxPerSecond = laneWidth / visibleDuration
	const zoomed = view.zoom > 1.0001

	// While playing zoomed in, page the view along with the playhead
	if (
		zoomed &&
		transport.playing &&
		(transport.time < viewStart || transport.time > viewStart + visibleDuration)
	) {
		setView(clampView({ zoom: view.zoom, start: transport.time }, duration))
	}

	// Ctrl or Cmd + scroll (and trackpad pinch) zooms around the pointer;
	// horizontal scroll or Shift + scroll pans. Native listener so the page
	// doesn't scroll or zoom as well.
	const bodyRef = useRef<HTMLDivElement>(null)
	const durationRef = useRef(duration)
	const viewRef = useRef(view)
	useEffect(() => {
		durationRef.current = duration
		viewRef.current = view
	})
	useEffect(() => {
		const body = bodyRef.current
		const lane = laneRef.current
		if (!body || !lane) return
		const handleWheel = (event: WheelEvent) => {
			const rect = lane.getBoundingClientRect()
			const total = durationRef.current
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault()
				const anchor = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
				setView((current) =>
					zoomAround(clampView(current, total), current.zoom * Math.exp(-event.deltaY * 0.01), anchor, total),
				)
				return
			}
			const horizontal = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)
			const delta = event.shiftKey ? event.deltaY || event.deltaX : event.deltaX
			if (!horizontal || !delta || viewRef.current.zoom <= 1) return
			event.preventDefault()
			setView((current) => {
				const secondsPerPx = total / current.zoom / rect.width
				return clampView({ ...current, start: current.start + delta * secondsPerPx }, total)
			})
		}
		body.addEventListener("wheel", handleWheel, { passive: false })
		return () => body.removeEventListener("wheel", handleWheel)
	}, [])

	const zoomBy = (factor: number) =>
		setView((current) => zoomAround(clampView(current, duration), current.zoom * factor, 0.5, duration))

	const toggle = (set: Set<string>, key: string) => {
		const next = new Set(set)
		if (next.has(key)) next.delete(key)
		else next.add(key)
		return next
	}

	const rows: React.ReactNode[] = []
	let lastGroup: string | undefined
	for (const clip of meta.clips) {
		if (clip.group && clip.group !== lastGroup) {
			const group = clip.group
			const open = !collapsedGroups.has(group)
			rows.push(
				<TimelineRow
					key={`group:${group}`}
					label={
						<TimelineDisclosure
							open={open}
							label={formatLabel(group)}
							onToggle={() => setCollapsedGroups((set) => toggle(set, group))}
						/>
					}
				/>,
			)
		}
		lastGroup = clip.group
		if (clip.group && collapsedGroups.has(clip.group)) continue

		const isProps = Boolean(clip.tracks?.length)
		const tracksOpen = isProps && openTracks.has(clip.key)
		const stat = computeClipStaticFromValues(values, clip, meta.duration)

		rows.push(
			<TimelineRow
				key={clip.key}
				indent={Boolean(clip.group)}
				label={
					isProps ? (
						<TimelineDisclosure
							open={tracksOpen}
							label={clip.label}
							onToggle={() => setOpenTracks((set) => toggle(set, clip.key))}
						/>
					) : (
						<span className="truncate">{clip.label}</span>
					)
				}
			>
				<TimelineClipBar
					timelineId={meta.id}
					clip={clip}
					at={stat.at}
					duration={stat.duration}
					looping={stat.loop === "repeat"}
					steps={clip.stepKeys?.length ? stat.tracks[0]?.steps : undefined}
					fixedDuration={isProps || stat.isPhysics}
					composite={isProps}
					pxPerSecond={pxPerSecond}
					viewStart={viewStart}
					timelineDuration={meta.duration}
					selection={selection}
					onSelect={setSelection}
					values={values}
				/>
			</TimelineRow>,
		)

		if (!tracksOpen) continue
		for (const trackRef of clip.tracks ?? []) {
			const track = stat.tracks.find((candidate) => candidate.prop === trackRef.prop)
			if (!track) continue
			const trackClip: TimelineClipMeta = {
				key: `${clip.key}.${trackRef.prop}`,
				label: `${clip.label} · ${formatLabel(trackRef.prop)}`,
				color: clip.color,
				loop: clip.loop,
				group: clip.group,
				stepKeys: trackRef.stepKeys,
			}
			rows.push(
				<TimelineRow
					key={trackClip.key}
					indent
					label={
						<span className="truncate text-muted-foreground">
							{formatLabel(trackRef.prop)}
						</span>
					}
				>
					<TimelineClipBar
						timelineId={meta.id}
						clip={trackClip}
						at={stat.at + track.delay}
						duration={track.duration}
						looping={stat.loop === "repeat"}
						steps={trackRef.stepKeys?.length ? track.steps : undefined}
						fixedDuration={!trackRef.stepKeys?.length && track.steps[0]?.isPhysics === true}
						baseAt={stat.at}
						delayMode
						pxPerSecond={pxPerSecond}
						viewStart={viewStart}
						timelineDuration={meta.duration}
						selection={selection}
						onSelect={setSelection}
						values={values}
					/>
				</TimelineRow>,
			)
		}
	}

	return (
		<section data-slot="controls-timeline-section" className="flex flex-col py-2">
			<header className="flex items-center gap-1 px-3 pb-2">
				<span className="mr-2 truncate text-xs font-medium">{meta.name}</span>
				<TimelineButton
					aria-label={transport.playing ? "Pause" : "Play"}
					onClick={() =>
						transport.playing
							? TimelineStore.pause(meta.id)
							: TimelineStore.play(meta.id)
					}
				>
					{transport.playing ? <RiPauseFill /> : <RiPlayFill />}
				</TimelineButton>
				<TimelineButton aria-label="Replay" onClick={() => TimelineStore.replay(meta.id)}>
					<RiRestartLine />
				</TimelineButton>
				<span className="ml-1 mr-auto font-mono text-[11px] tabular-nums text-muted-foreground">
					{formatClock(transport.time, true)} / {formatClock(meta.duration, true)}
				</span>
				{zoomed && (
					<button
						type="button"
						onClick={() => setView({ zoom: 1, start: 0 })}
						className="h-6 rounded px-1.5 text-xs text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						Fit
					</button>
				)}
				<TimelineButton aria-label="Zoom out" disabled={!zoomed} onClick={() => zoomBy(1 / ZOOM_STEP)}>
					<RiZoomOutLine />
				</TimelineButton>
				<TimelineButton aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)}>
					<RiZoomInLine />
				</TimelineButton>
				<ControlsVersions panelId={meta.id} panelName={meta.name} />
				<ControlsCopy
					panelName={meta.name}
					getText={() => timelineCopyInstruction(meta, values)}
				/>
			</header>

			<div ref={bodyRef} className="relative overflow-hidden">
				<TimelineRow
					label={null}
					laneRef={laneRef}
					laneProps={{
						className: "h-6 cursor-ew-resize border-b",
						...scrubHandlers(meta.id, viewStart, visibleDuration),
					}}
				>
					<TimelineRuler
						viewStart={viewStart}
						visibleDuration={visibleDuration}
						pxPerSecond={pxPerSecond}
					/>
				</TimelineRow>
				<div className="flex flex-col py-1">{rows}</div>
				{transport.time >= viewStart - 1e-6 &&
					transport.time <= viewStart + visibleDuration + 1e-6 && (
						<TimelinePlayhead
							left={LABEL_WIDTH + (Math.min(transport.time, duration) - viewStart) * pxPerSecond}
						/>
					)}
			</div>
			{zoomed && (
				<TimelineRow label={null}>
					<TimelineOverview
						duration={duration}
						view={view}
						time={transport.time}
						onNavigate={(start) => setView(clampView({ zoom: view.zoom, start }, duration))}
					/>
				</TimelineRow>
			)}
		</section>
	)
}

// ── Layout pieces ──

type TimelineRowProps = {
	label: React.ReactNode
	indent?: boolean
	laneRef?: React.Ref<HTMLDivElement>
	laneProps?: React.ComponentProps<"div">
	children?: React.ReactNode
}

function TimelineRow({ label, indent, laneRef, laneProps, children }: TimelineRowProps) {
	const { className: laneClassName, ...restLaneProps } = laneProps ?? {}
	return (
		<div data-slot="controls-timeline-row" className="flex min-h-7 items-stretch">
			<div
				className={cn(
					"flex shrink-0 items-center px-3 text-xs",
					indent && "pl-6",
				)}
				style={{ width: LABEL_WIDTH }}
			>
				{label}
			</div>
			<div
				ref={laneRef}
				className={cn("relative mr-3 flex-1 overflow-hidden", laneClassName)}
				{...restLaneProps}
			>
				{children}
			</div>
		</div>
	)
}

function TimelineDisclosure({
	open,
	label,
	onToggle,
}: {
	open: boolean
	label: string
	onToggle: () => void
}) {
	return (
		<button
			type="button"
			aria-expanded={open}
			onClick={onToggle}
			className="-ml-1 flex min-w-0 items-center gap-0.5 rounded px-1 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
		>
			<RiArrowRightSLine
				aria-hidden="true"
				className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-90")}
			/>
			<span className="truncate">{label}</span>
		</button>
	)
}

function TimelineButton({ className, ...props }: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			className={cn(
				"flex size-6 items-center justify-center rounded text-muted-foreground outline-none transition-colors",
				"hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"[&_svg]:size-3.5",
				className,
			)}
			{...props}
		/>
	)
}

type TimelineRulerProps = {
	viewStart: number
	visibleDuration: number
	pxPerSecond: number
}

function TimelineRuler({ viewStart, visibleDuration, pxPerSecond }: TimelineRulerProps) {
	if (pxPerSecond <= 0) return null
	const step =
		TICK_STEPS.find((candidate) => candidate * pxPerSecond >= MIN_TICK_SPACING) ??
		TICK_STEPS[TICK_STEPS.length - 1]
	const first = Math.ceil(viewStart / step - 1e-6)
	const last = Math.floor((viewStart + visibleDuration) / step + 1e-6)
	const decimals = String(step).split(".")[1]?.length ?? 0
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0">
			{Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => {
				const time = (first + i) * step
				return (
					<div
						key={first + i}
						className="absolute bottom-0 flex h-full flex-col justify-end"
						style={{ left: (time - viewStart) * pxPerSecond }}
					>
						<span className="mb-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
							{time.toFixed(decimals)}s
						</span>
						<span className="h-1.5 w-px bg-border" />
					</div>
				)
			})}
		</div>
	)
}

function TimelinePlayhead({ left }: { left: number }) {
	return (
		<div
			aria-hidden="true"
			data-slot="controls-timeline-playhead"
			className="pointer-events-none absolute top-0 bottom-0 w-px bg-[var(--timeline-playhead,var(--color-destructive))]"
			style={{ left }}
		>
			<span className="absolute -top-0.5 left-1/2 size-2 -translate-x-1/2 rotate-45 rounded-[1px] bg-[var(--timeline-playhead,var(--color-destructive))]" />
		</div>
	)
}

type TimelineOverviewProps = {
	duration: number
	view: View
	time: number
	onNavigate: (start: number) => void
}

/** The whole timeline in miniature; drag the window to pan */
function TimelineOverview({ duration, view, time, onNavigate }: TimelineOverviewProps) {
	const visible = duration / view.zoom
	const grab = useRef<number | null>(null)

	const timeAt = (event: React.PointerEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect()
		return (Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))) * duration
	}

	return (
		<div
			data-slot="controls-timeline-overview"
			className="relative my-1.5 h-2 cursor-grab touch-none rounded-full bg-muted active:cursor-grabbing"
			onPointerDown={(event) => {
				if (event.button !== 0) return
				event.currentTarget.setPointerCapture(event.pointerId)
				const at = timeAt(event)
				const inside = at >= view.start && at <= view.start + visible
				// Grab the window where it was pressed, or centre it on the press
				grab.current = inside ? at - view.start : visible / 2
				onNavigate(at - grab.current)
			}}
			onPointerMove={(event) => {
				if (grab.current === null) return
				onNavigate(timeAt(event) - grab.current)
			}}
			onPointerUp={() => {
				grab.current = null
			}}
			onLostPointerCapture={() => {
				grab.current = null
			}}
		>
			<div
				className="absolute inset-y-0 rounded-full bg-foreground/25"
				style={{
					left: `${(view.start / duration) * 100}%`,
					width: `${(visible / duration) * 100}%`,
				}}
			/>
			<div
				aria-hidden="true"
				className="absolute -inset-y-0.5 w-px bg-[var(--timeline-playhead,var(--color-destructive))]"
				style={{ left: `${(Math.min(time, duration) / duration) * 100}%` }}
			/>
		</div>
	)
}

/** Pointer handlers that seek to wherever the pointer is on the ruler */
function scrubHandlers(
	timelineId: string,
	viewStart: number,
	visibleDuration: number,
): React.ComponentProps<"div"> {
	const seek = (event: React.PointerEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect()
		const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
		TimelineStore.seek(timelineId, viewStart + fraction * visibleDuration)
	}
	return {
		onPointerDown: (event) => {
			if (event.button !== 0) return
			event.currentTarget.setPointerCapture(event.pointerId)
			TimelineStore.pause(timelineId)
			seek(event)
		},
		onPointerMove: (event) => {
			if (event.currentTarget.hasPointerCapture(event.pointerId)) seek(event)
		},
	}
}

// ── TimelineClipBar ──

type DragMode = "move" | "start" | "end" | "boundary"

type DragState = {
	mode: DragMode
	boundaryIndex: number
	pointerX: number
	at: number
	duration: number
	stepDurations: number[]
	stepKey?: string
	moved: boolean
}

type TimelineClipBarProps = {
	timelineId: string
	clip: TimelineClipMeta
	at: number
	duration: number
	looping: boolean
	steps?: TimelineStepStatic[]
	/** Length set by spring physics or by the clip's tracks, so not resizable */
	fixedDuration: boolean
	/** A props clip's summary bar; its tracks are edited on their own rows */
	composite?: boolean
	/** Dragging edits a property track's delay from the clip start */
	delayMode?: boolean
	baseAt?: number
	pxPerSecond: number
	/** Time at the lane's left edge */
	viewStart: number
	timelineDuration: number
	selection: Selection | null
	onSelect: (selection: Selection | null) => void
	values: Record<string, DialValue>
}

function TimelineClipBar({
	timelineId,
	clip,
	at,
	duration,
	looping,
	steps,
	fixedDuration,
	composite = false,
	delayMode = false,
	baseAt = 0,
	pxPerSecond,
	viewStart,
	timelineDuration,
	selection,
	onSelect,
	values,
}: TimelineClipBarProps) {
	const drag = useRef<DragState | null>(null)
	const [dragging, setDragging] = useState(false)
	const selected = selection?.key === clip.key
	const resizable = duration > 0 && !fixedDuration && !composite
	const startPath = delayMode ? `${clip.key}.delay` : `${clip.key}.at`
	const startValue = (next: number) => (delayMode ? Math.max(0, next - baseAt) : next)

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return
		event.stopPropagation()
		const target = event.target instanceof HTMLElement ? event.target : null
		const boundary = target?.dataset.boundary
		const edge = target?.dataset.edge
		drag.current = {
			mode: boundary !== undefined ? "boundary" : edge === "start" || edge === "end" ? edge : "move",
			boundaryIndex: Number(boundary ?? 0),
			pointerX: event.clientX,
			at,
			duration,
			stepDurations: steps?.map((step) => step.duration) ?? [],
			stepKey: target?.closest<HTMLElement>("[data-step]")?.dataset.step,
			moved: false,
		}
		event.currentTarget.setPointerCapture(event.pointerId)
	}

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const state = drag.current
		if (!state || pxPerSecond <= 0) return
		const dx = event.clientX - state.pointerX
		if (!state.moved) {
			if (Math.abs(dx) <= DRAG_THRESHOLD) return
			state.moved = true
			setDragging(true)
			onSelect(null)
		}
		const dt = dx / pxPerSecond

		if (state.mode === "boundary" && steps) {
			const index = state.boundaryIndex
			const others = state.stepDurations.reduce((sum, d, j) => (j === index ? sum : sum + d), 0)
			DialStore.updateValue(
				timelineId,
				`${clip.key}.${steps[index].key ?? ""}.duration`,
				clampStepResize(state.stepDurations[index] + dt, state.at, others, timelineDuration),
			)
		} else if (state.mode === "move") {
			const next = delayMode
				? baseAt + clampTrackDelay(state.at + dt - baseAt, baseAt, state.duration, timelineDuration)
				: clampClipMove(state.at + dt, state.duration, timelineDuration)
			DialStore.updateValue(timelineId, startPath, startValue(next))
		} else if (state.mode === "end" && !steps) {
			DialStore.updateValue(
				timelineId,
				`${clip.key}.duration`,
				clampClipResizeEnd(state.duration + dt, state.at, timelineDuration),
			)
		} else if (state.mode === "start") {
			const limit = delayMode ? baseAt : 0
			const length = steps ? state.stepDurations[0] : state.duration
			const next = clampClipResizeStart(Math.max(state.at + dt, limit), state.at, length)
			const lengthPath = steps
				? `${clip.key}.${steps[0].key ?? ""}.duration`
				: `${clip.key}.duration`
			DialStore.updateValues(timelineId, {
				[startPath]: startValue(next.at),
				[lengthPath]: next.duration,
			})
		}
	}

	const handlePointerUp = () => {
		const state = drag.current
		drag.current = null
		setDragging(false)
		if (state && !state.moved && !composite) {
			const already = selected && selection?.stepKey === state.stepKey
			onSelect(already ? null : { key: clip.key, stepKey: state.stepKey })
		}
	}

	const handlePointerCancel = () => {
		drag.current = null
		setDragging(false)
	}

	const width = Math.max(duration * pxPerSecond, 10)
	const durationText = `${fixedDuration && !composite ? "~" : ""}${formatSeconds(duration)}`

	// Faded repeats show where a looping clip plays again
	const ghosts: { start: number; length: number }[] = []
	if (looping && duration > 0) {
		for (let start = at + duration; start < timelineDuration - 1e-6 && ghosts.length < 256; start += duration) {
			ghosts.push({ start, length: Math.min(duration, timelineDuration - start) })
		}
	}

	const boundaries: number[] = []
	let running = 0
	for (const step of steps ?? []) {
		running += step.duration
		boundaries.push(running)
	}

	const bar = (
		<div
			data-slot="controls-timeline-clip"
			data-selected={selected || undefined}
			data-dragging={dragging || undefined}
			title={`${clip.label}: ${formatSeconds(at)} for ${durationText}${fixedDuration && !composite ? " (length set by spring physics)" : ""}${looping ? ", repeats" : ""}`}
			className={cn(
				"group/clip absolute top-1 bottom-1 flex touch-none select-none items-center overflow-hidden rounded",
				"bg-[var(--timeline-clip,color-mix(in_oklab,var(--color-primary)_18%,transparent))]",
				"ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-primary)_35%,transparent)]",
				composite ? "cursor-default opacity-70" : "cursor-grab",
				dragging && "cursor-grabbing",
				selected && "ring-2 ring-primary",
			)}
			style={{ left: (at - viewStart) * pxPerSecond, width }}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerCancel}
			onLostPointerCapture={handlePointerCancel}
		>
			{steps ? (
				<>
					{steps.map((step, index) => {
						const segmentWidth = step.duration * pxPerSecond
						const segmentSelected = selected && selection?.stepKey === step.key
						return (
							<div
								key={step.key ?? index}
								data-step={step.key ?? undefined}
								className={cn(
									"flex h-full shrink-0 items-center justify-center border-r border-[color-mix(in_oklab,var(--color-primary)_35%,transparent)] last:border-r-0",
									segmentSelected && "bg-primary/20",
								)}
								style={{ width: segmentWidth }}
							>
								{segmentWidth > 48 && (
									<ClipText>
										{step.key ? `${formatStepLabel(step.key)} · ` : ""}
										{formatSeconds(step.duration)}
									</ClipText>
								)}
							</div>
						)
					})}
					{steps.map((step, index) =>
						step.isPhysics ? null : (
							<ClipHandle
								key={`boundary:${step.key ?? index}`}
								data-boundary={index}
								style={{ left: boundaries[index] * pxPerSecond - 3 }}
							/>
						),
					)}
					{!steps[0].isPhysics && <ClipHandle data-edge="start" style={{ left: 0 }} />}
				</>
			) : (
				<>
					{width > 48 && <ClipText className="mx-auto">{durationText}</ClipText>}
					{resizable && <ClipHandle data-edge="start" style={{ left: 0 }} />}
					{resizable && <ClipHandle data-edge="end" style={{ right: 0 }} />}
				</>
			)}
		</div>
	)

	return (
		<>
			{ghosts.map((ghost) => (
				<div
					key={ghost.start}
					aria-hidden="true"
					className="pointer-events-none absolute top-1 bottom-1 rounded border border-dashed border-primary/25 bg-primary/5"
					style={{ left: (ghost.start - viewStart) * pxPerSecond + 1, width: Math.max(1, ghost.length * pxPerSecond - 2) }}
				/>
			))}
			<Popover
				open={selected}
				onOpenChange={(open) => {
					if (!open) onSelect(null)
				}}
			>
				<PopoverAnchor asChild>{bar}</PopoverAnchor>
				{selected && (
					<PopoverContent
						side="top"
						align="start"
						className="max-h-96 w-72 overflow-y-auto p-3"
						onOpenAutoFocus={(event) => event.preventDefault()}
					>
						<ClipEditor
							timelineId={timelineId}
							clip={clip}
							stepKey={selection?.stepKey}
							values={values}
						/>
					</PopoverContent>
				)}
			</Popover>
		</>
	)
}

function ClipText({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"pointer-events-none truncate px-1.5 font-mono text-[10px] tabular-nums text-foreground/70",
				className,
			)}
			{...props}
		/>
	)
}

function ClipHandle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"absolute top-0 bottom-0 z-10 w-1.5 cursor-ew-resize",
				"after:absolute after:inset-y-1 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:rounded-full after:bg-primary/60 after:opacity-0 group-hover/clip:after:opacity-100",
				className,
			)}
			{...props}
		/>
	)
}

// ── ClipEditor ──

type ClipEditorProps = {
	timelineId: string
	clip: TimelineClipMeta
	stepKey?: string
	values: Record<string, DialValue>
}

/** The clip's or step's own controls, with timing left to the bar */
function ClipEditor({ timelineId, clip, stepKey, values }: ClipEditorProps) {
	const path = stepKey ? `${clip.key}.${stepKey}` : clip.key
	const exclude = stepKey
		? new Set<string>()
		: new Set([...(clip.stepKeys ?? []), ...(clip.tracks?.map((track) => track.prop) ?? [])])
	const controls = clipControls(timelineId, path, exclude)
	// Transitions show as they actually run, with the bar's length applied
	const display = timelinePopoverDisplayValues(values, clip.key, clip.stepKeys, stepKey)

	return (
		<div data-slot="controls-timeline-editor" className="space-y-1">
			<div className="pb-1 text-xs font-medium">
				{clip.label}
				{stepKey && <span className="text-muted-foreground"> · {formatStepLabel(stepKey)}</span>}
			</div>
			{controls.length === 0 ? (
				<p className="text-xs text-muted-foreground">Nothing to edit beyond timing.</p>
			) : (
				controls.map((control) => (
					<ControlsField
						key={control.path}
						panelId={timelineId}
						control={control}
						values={display}
					/>
				))
			)}
		</div>
	)
}

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

function clipControls(timelineId: string, path: string, exclude: Set<string>): ControlMeta[] {
	const panel = DialStore.getPanel(timelineId)
	const folder = panel ? findControl(panel.controls, path) : null
	return (folder?.children ?? []).filter((control) => {
		const childKey = control.path.slice(path.length + 1)
		return childKey !== "at" && childKey !== "duration" && childKey !== "delay" && !exclude.has(childKey)
	})
}

// ── Copy ──

function timelineCopyInstruction(meta: TimelineMeta, values: Record<string, DialValue>): string {
	const json = JSON.stringify(
		Object.fromEntries(
			Object.entries(normalizeTimelineValuesForCopy(values, meta.clips)).filter(
				([path]) => !path.endsWith(".__mode"),
			),
		),
		null,
		2,
	)
	return `Update the useControlsTimeline configuration for "${meta.name}" with these values:

\`\`\`json
${json}
\`\`\`

Apply these values as the new defaults in the useControlsTimeline call. Keep the existing \`clip.current\` bindings while the timeline is being tuned.`
}

export { ControlsTimeline, type ControlsTimelineProps }
