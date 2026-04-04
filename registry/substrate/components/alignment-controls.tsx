"use client"

import {
	RiAlignItemLeftLine,
	RiAlignItemHorizontalCenterLine,
	RiAlignItemRightLine,
	RiAlignItemTopLine,
	RiAlignItemVerticalCenterLine,
	RiAlignItemBottomLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── Distribute icons (not available in remixicon) ──

function DistributeHorizontalIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
			<line x1="2" y1="2" x2="2" y2="14" />
			<line x1="14" y1="2" x2="14" y2="14" />
			<rect x="5.5" y="4.5" width="5" height="7" rx="0.5" />
		</svg>
	)
}

function DistributeVerticalIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
			<line x1="2" y1="2" x2="14" y2="2" />
			<line x1="2" y1="14" x2="14" y2="14" />
			<rect x="4.5" y="5.5" width="7" height="5" rx="0.5" />
		</svg>
	)
}

// ── AlignmentControls ──

type AlignAction =
	| "left"
	| "center-h"
	| "right"
	| "top"
	| "center-v"
	| "bottom"
	| "distribute-h"
	| "distribute-v"

type AlignmentControlsProps = {
	onAlign: (action: AlignAction) => void
	showDistribute?: boolean
	disabled?: boolean
} & Omit<React.ComponentProps<"div">, "children">

function AlignmentControls({
	onAlign,
	showDistribute = true,
	disabled,
	className,
	...props
}: AlignmentControlsProps) {
	return (
		<div
			data-slot="alignment-controls"
			className={cn(
				"inline-flex items-center gap-0.5",
				disabled && "opacity-50 pointer-events-none",
				className,
			)}
			{...props}
		>
			<AlignButton onClick={() => onAlign("left")} aria-label="Align left">
				<RiAlignItemLeftLine />
			</AlignButton>
			<AlignButton onClick={() => onAlign("center-h")} aria-label="Align centre horizontally">
				<RiAlignItemHorizontalCenterLine />
			</AlignButton>
			<AlignButton onClick={() => onAlign("right")} aria-label="Align right">
				<RiAlignItemRightLine />
			</AlignButton>

			<AlignSeparator />

			<AlignButton onClick={() => onAlign("top")} aria-label="Align top">
				<RiAlignItemTopLine />
			</AlignButton>
			<AlignButton onClick={() => onAlign("center-v")} aria-label="Align centre vertically">
				<RiAlignItemVerticalCenterLine />
			</AlignButton>
			<AlignButton onClick={() => onAlign("bottom")} aria-label="Align bottom">
				<RiAlignItemBottomLine />
			</AlignButton>

			{showDistribute && (
				<>
					<AlignSeparator />
					<AlignButton onClick={() => onAlign("distribute-h")} aria-label="Distribute horizontally">
						<DistributeHorizontalIcon />
					</AlignButton>
					<AlignButton onClick={() => onAlign("distribute-v")} aria-label="Distribute vertically">
						<DistributeVerticalIcon />
					</AlignButton>
				</>
			)}
		</div>
	)
}

// ── AlignButton ──

function AlignButton({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="align-button"
			className={cn(
				"size-7 inline-flex items-center justify-center rounded-md",
				"text-muted-foreground transition-colors",
				"hover:bg-muted hover:text-foreground",
				"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"disabled:opacity-30 disabled:pointer-events-none",
				"[&_svg]:size-4",
				className,
			)}
			{...props}
		/>
	)
}

// ── AlignSeparator ──

function AlignSeparator({ className }: { className?: string }) {
	return (
		<span
			data-slot="align-separator"
			className={cn("w-px h-4 bg-border mx-0.5", className)}
		/>
	)
}

export {
	AlignmentControls,
	AlignButton,
	AlignSeparator,
	type AlignAction,
}
