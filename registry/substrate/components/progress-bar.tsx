import { cn } from "@/lib/utils"

// ── ProgressBar ──

type ProgressBarProps = {
	value: number
	max?: number
	indeterminate?: boolean
} & React.ComponentProps<"div">

function ProgressBar({
	value,
	max = 100,
	indeterminate,
	className,
	...props
}: ProgressBarProps) {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100))

	return (
		<div
			data-slot="progress-bar"
			role="progressbar"
			aria-valuenow={indeterminate ? undefined : value}
			aria-valuemin={0}
			aria-valuemax={max}
			className={cn(
				"h-1.5 w-full overflow-hidden rounded-full bg-muted",
				className,
			)}
			{...props}
		>
			<div
				data-slot="progress-bar-fill"
				className={cn(
					"h-full rounded-full bg-foreground/60 transition-all duration-300",
					indeterminate && "animate-progress-indeterminate w-1/3",
				)}
				style={indeterminate ? undefined : { width: `${percentage}%` }}
			/>
		</div>
	)
}

export { ProgressBar, type ProgressBarProps }
