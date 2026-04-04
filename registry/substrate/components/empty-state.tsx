import { cn } from "@/lib/utils"

// ── EmptyState ──

function EmptyState({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-state"
			className={cn(
				"flex flex-col items-center justify-center gap-3 py-10 px-6 text-center",
				className,
			)}
			{...props}
		/>
	)
}

// ── EmptyStateIcon ──

function EmptyStateIcon({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-state-icon"
			className={cn(
				"flex items-center justify-center size-10 rounded-lg bg-muted text-muted-foreground",
				"[&_svg]:size-5",
				className,
			)}
			{...props}
		/>
	)
}

// ── EmptyStateTitle ──

function EmptyStateTitle({
	className,
	...props
}: React.ComponentProps<"h3">) {
	return (
		<h3
			data-slot="empty-state-title"
			className={cn("text-sm font-medium", className)}
			{...props}
		/>
	)
}

// ── EmptyStateDescription ──

function EmptyStateDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="empty-state-description"
			className={cn("text-xs text-muted-foreground max-w-48", className)}
			{...props}
		/>
	)
}

// ── EmptyStateAction ──

function EmptyStateAction({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="empty-state-action"
			className={cn(
				"h-7 px-3 rounded-md text-xs font-medium transition-colors",
				"bg-primary text-primary-foreground",
				"hover:bg-primary/90",
				"outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		/>
	)
}

export {
	EmptyState,
	EmptyStateIcon,
	EmptyStateTitle,
	EmptyStateDescription,
	EmptyStateAction,
}
