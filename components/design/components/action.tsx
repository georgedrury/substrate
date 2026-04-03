import { cn } from "@/lib/utils"

type ActionProps = {
	orientation?: "vertical" | "horizontal"
}

export function Action({
	className,
	orientation = "horizontal",
	...props
}: ActionProps & React.ComponentProps<"div">) {
	return (
		<div
			data-slot="action"
			className={cn(
				"h-7 group/action gap-2 flex items-center data-[orientation=vertical]:flex-col",
				className,
			)}
			{...props}
		/>
	)
}
export function ActionLabel({
	className,
	...props
}: React.ComponentProps<"label">) {
	return (
		<label
			data-slot="action-label"
			className={cn("text-xs w-18 text-muted-foreground", className)}
			{...props}
		/>
	)
}
export function ActionControls({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="action-controls"
			className={cn(
				"flex-1 flex items-center gap-2 [&_input]:border-0 **:data-[slot=input-group]:border-0 **:data-[slot=select-trigger]:border-0",
				className,
			)}
			{...props}
		/>
	)
}
