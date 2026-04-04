import { cn } from "@/lib/utils"

// ── StatusBar ──

function StatusBar({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="status-bar"
			className={cn(
				"flex items-center h-7 px-3 text-[11px] text-muted-foreground bg-background border-t select-none",
				className,
			)}
			{...props}
		/>
	)
}

// ── StatusBarSection ──

type StatusBarSectionProps = {
	align?: "left" | "center" | "right"
} & React.ComponentProps<"div">

function StatusBarSection({
	align = "left",
	className,
	...props
}: StatusBarSectionProps) {
	return (
		<div
			data-slot="status-bar-section"
			className={cn(
				"flex items-center gap-3",
				align === "left" && "mr-auto",
				align === "center" && "mx-auto",
				align === "right" && "ml-auto",
				className,
			)}
			{...props}
		/>
	)
}

// ── StatusBarItem ──

function StatusBarItem({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="status-bar-item"
			className={cn(
				"inline-flex items-center gap-1 tabular-nums",
				className,
			)}
			{...props}
		/>
	)
}

// ── StatusBarSeparator ──

function StatusBarSeparator({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="status-bar-separator"
			className={cn("w-px h-3 bg-border", className)}
			{...props}
		/>
	)
}

export {
	StatusBar,
	StatusBarSection,
	StatusBarItem,
	StatusBarSeparator,
}
