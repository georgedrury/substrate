"use client"

import { RiArrowGoBackLine, RiArrowGoForwardLine } from "@remixicon/react"
import { cn } from "@/lib/utils"
import { useDocumentStore } from "@/stores/substrate/document-store"

type HistoryControlsProps = {
	size?: "sm" | "md"
} & React.ComponentProps<"div">

function HistoryControls({
	size = "md",
	className,
	...props
}: HistoryControlsProps) {
	const canUndo = useDocumentStore((s) => s.past.length > 0)
	const canRedo = useDocumentStore((s) => s.future.length > 0)
	const undo = useDocumentStore((s) => s.undo)
	const redo = useDocumentStore((s) => s.redo)

	const iconSize = size === "sm" ? "size-3.5" : "size-4"
	const buttonSize = size === "sm" ? "size-7" : "size-8"

	return (
		<div
			data-slot="history-controls"
			className={cn("inline-flex items-center gap-0.5", className)}
			{...props}
		>
			<HistoryButton
				onClick={undo}
				disabled={!canUndo}
				aria-label="Undo"
				className={buttonSize}
			>
				<RiArrowGoBackLine className={iconSize} />
			</HistoryButton>
			<HistoryButton
				onClick={redo}
				disabled={!canRedo}
				aria-label="Redo"
				className={buttonSize}
			>
				<RiArrowGoForwardLine className={iconSize} />
			</HistoryButton>
		</div>
	)
}

function HistoryButton({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="history-button"
			className={cn(
				"inline-flex items-center justify-center rounded-md",
				"text-muted-foreground transition-colors",
				"hover:bg-muted hover:text-foreground",
				"focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
				"disabled:opacity-30 disabled:pointer-events-none",
				className,
			)}
			{...props}
		/>
	)
}

export { HistoryControls, HistoryButton }
