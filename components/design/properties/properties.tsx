import { cn } from "@/lib/utils"

type PropertiesProps = {}

export function Properties({
	className,
	...props
}: PropertiesProps & React.ComponentProps<"div">) {
	return <div className={cn("space-y-2 px-3", className)} {...props} />
}

export function PropertiesHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="properties-header"
			className={cn("flex justify-between", className)}
			{...props}
		/>
	)
}

export function PropertiesLabel({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<span
			data-slot="properties-label"
			className={cn("text-xs font-medium", className)}
			{...props}
		/>
	)
}

export function PropertiesAction({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			data-slot="properties-action"
			className={cn("", className)}
			{...props}
		/>
	)
}
