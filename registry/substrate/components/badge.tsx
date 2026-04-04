import { cn } from "@/lib/utils"

// ── Badge ──

type BadgeVariant = "default" | "secondary" | "outline" | "muted"

type BadgeProps = {
	variant?: BadgeVariant
} & React.ComponentProps<"span">

function Badge({
	variant = "default",
	className,
	...props
}: BadgeProps) {
	return (
		<span
			data-slot="badge"
			className={cn(
				"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none transition-colors",
				"[&_svg]:size-3 [&_svg]:shrink-0",
				variant === "default" && "bg-foreground text-background",
				variant === "secondary" && "bg-secondary text-secondary-foreground",
				variant === "outline" && "border text-muted-foreground",
				variant === "muted" && "bg-muted text-muted-foreground",
				className,
			)}
			{...props}
		/>
	)
}

export { Badge, type BadgeProps, type BadgeVariant }
