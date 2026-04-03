import { cn } from "@/lib/utils"

type PaneProps = {}

export function Pane({
	className,
	...props
}: PaneProps & React.ComponentProps<"div">) {
	return <div className={cn("space-y-2 px-3", className)} {...props} />
}

export function PaneHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="pane-header"
			className={cn("flex justify-between items-center", className)}
			{...props}
		/>
	)
}

export function PaneLabel({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<span
			data-slot="pane-label"
			className={cn("text-xs font-medium", className)}
			{...props}
		/>
	)
}

export function PaneAction({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			data-slot="pane-action"
			className={cn(
				"size-6 flex items-center justify-center transition bg-background rounded hover:bg-accent",
				className,
			)}
			{...props}
		/>
	)
}
