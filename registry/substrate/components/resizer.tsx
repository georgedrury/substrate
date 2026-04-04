import { cn } from "@/lib/utils"

// ── Resizer ──

type ResizerProps = {
	orientation?: "horizontal" | "vertical"
} & React.ComponentProps<"div">

function Resizer({
	orientation = "vertical",
	className,
	...props
}: ResizerProps) {
	return (
		<div
			data-slot="resizer"
			data-orientation={orientation}
			className={cn(
				"relative shrink-0 group/resizer",
				orientation === "vertical" && "w-px cursor-col-resize",
				orientation === "horizontal" && "h-px cursor-row-resize",
				className,
			)}
			{...props}
		>
			{/* Visual line */}
			<div
				className={cn(
					"absolute bg-border transition-colors group-hover/resizer:bg-ring group-active/resizer:bg-ring",
					orientation === "vertical" && "inset-y-0 left-0 w-px",
					orientation === "horizontal" && "inset-x-0 top-0 h-px",
				)}
			/>
			{/* Wider hit area */}
			<div
				className={cn(
					"absolute",
					orientation === "vertical" && "inset-y-0 -left-1 w-2",
					orientation === "horizontal" && "inset-x-0 -top-1 h-2",
				)}
			/>
			{/* Grab dots */}
			<div
				className={cn(
					"absolute opacity-0 group-hover/resizer:opacity-100 transition-opacity",
					orientation === "vertical" &&
						"top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5",
					orientation === "horizontal" &&
						"top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0.5",
				)}
			>
				<span className="size-1 rounded-full bg-muted-foreground/50" />
				<span className="size-1 rounded-full bg-muted-foreground/50" />
				<span className="size-1 rounded-full bg-muted-foreground/50" />
			</div>
		</div>
	)
}

export { Resizer, type ResizerProps }
