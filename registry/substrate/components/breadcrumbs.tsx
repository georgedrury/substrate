import { RiArrowRightSLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── Breadcrumbs ──

function Breadcrumbs({
	className,
	...props
}: React.ComponentProps<"nav">) {
	return (
		<nav
			data-slot="breadcrumbs"
			aria-label="Breadcrumb"
			className={cn("flex items-center gap-0.5 text-xs", className)}
			{...props}
		/>
	)
}

// ── BreadcrumbItem ──

type BreadcrumbItemProps = {
	active?: boolean
} & React.ComponentProps<"button">

function BreadcrumbItem({
	active,
	className,
	...props
}: BreadcrumbItemProps) {
	return (
		<>
			<button
				type="button"
				data-slot="breadcrumb-item"
				data-active={active || undefined}
				className={cn(
					"h-6 px-1.5 rounded-md transition-colors truncate max-w-32 outline-none",
					active
						? "text-foreground font-medium"
						: "text-muted-foreground hover:text-foreground hover:bg-muted",
					"focus-visible:ring-[3px] focus-visible:ring-ring/50",
					className,
				)}
				{...props}
			/>
			{!active && (
				<RiArrowRightSLine
					data-slot="breadcrumb-separator"
					className="size-3.5 text-muted-foreground/50 shrink-0"
				/>
			)}
		</>
	)
}

export { Breadcrumbs, BreadcrumbItem }
