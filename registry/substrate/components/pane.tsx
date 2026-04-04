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
			className={cn(
				"flex justify-between items-center",
				// Auto-push history controls to the right and compact them
				"**:data-[slot=history-controls]:ml-auto **:data-[slot=history-controls]:gap-0",
				"**:data-[slot=history-button]:size-6 **:data-[slot=history-button]:[&_svg]:size-3.5",
				className,
			)}
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
				"size-6 flex [&>svg]:size-3 items-center justify-center transition bg-panel rounded hover:bg-accent",
				className,
			)}
			{...props}
		/>
	)
}
