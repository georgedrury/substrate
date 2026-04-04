"use client"

import { useCallback } from "react"
import {
	RiAddLine,
	RiSubtractLine,
	RiFullscreenLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── ZoomControls ──

type ZoomControlsProps = {
	zoom: number
	onZoomChange: (zoom: number) => void
	onZoomToFit?: () => void
	min?: number
	max?: number
	step?: number
} & React.ComponentProps<"div">

function ZoomControls({
	zoom,
	onZoomChange,
	onZoomToFit,
	min = 0.1,
	max = 10,
	step = 0.25,
	className,
	...props
}: ZoomControlsProps) {
	const zoomIn = useCallback(() => {
		onZoomChange(Math.min(max, zoom + step))
	}, [zoom, max, step, onZoomChange])

	const zoomOut = useCallback(() => {
		onZoomChange(Math.max(min, zoom - step))
	}, [zoom, min, step, onZoomChange])

	const resetZoom = useCallback(() => {
		onZoomChange(1)
	}, [onZoomChange])

	const percentage = Math.round(zoom * 100)

	return (
		<div
			data-slot="zoom-controls"
			className={cn(
				"inline-flex items-center gap-0.5",
				className,
			)}
			{...props}
		>
			<ZoomButton onClick={zoomOut} aria-label="Zoom out">
				<RiSubtractLine />
			</ZoomButton>
			<button
				type="button"
				data-slot="zoom-level"
				onClick={resetZoom}
				className={cn(
					"h-6 min-w-10 px-1.5 rounded-md text-[11px] tabular-nums text-muted-foreground",
					"hover:bg-muted hover:text-foreground transition-colors",
					"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				)}
			>
				{percentage}%
			</button>
			<ZoomButton onClick={zoomIn} aria-label="Zoom in">
				<RiAddLine />
			</ZoomButton>
			{onZoomToFit && (
				<ZoomButton onClick={onZoomToFit} aria-label="Zoom to fit">
					<RiFullscreenLine />
				</ZoomButton>
			)}
		</div>
	)
}

// ── ZoomButton ──

function ZoomButton({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="zoom-button"
			className={cn(
				"size-6 inline-flex items-center justify-center rounded-md",
				"text-muted-foreground transition-colors",
				"hover:bg-muted hover:text-foreground",
				"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"disabled:opacity-30 disabled:pointer-events-none",
				"[&_svg]:size-3.5",
				className,
			)}
			{...props}
		/>
	)
}

export { ZoomControls, ZoomButton }
