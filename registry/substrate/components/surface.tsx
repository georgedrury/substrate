import { cn } from "@/lib/utils"

type SurfaceProps = {
	children?: React.ReactNode
}

export function Surface({
	className,
	children,
	...props
}: SurfaceProps & React.ComponentProps<"div">) {
	return (
		<div
			data-slot="surface"
			className={cn(
				"absolute inset-0 bg-canvas text-canvas-foreground overflow-hidden",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}

type SurfaceControlsProps = {
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
	children?: React.ReactNode
}

export function SurfaceControls({
	className,
	children,
	position = "bottom-right",
	...props
}: SurfaceControlsProps & React.ComponentProps<"div">) {
	const positionClasses = {
		"top-left": "top-3 left-3",
		"top-right": "top-3 right-3",
		"bottom-left": "bottom-3 left-3",
		"bottom-right": "bottom-3 right-3",
	}

	return (
		<div
			className="absolute inset-0 pointer-events-none"
			data-slot="surface-controls-container"
		>
			<div
				data-slot="surface-controls"
				data-position={position}
				className={cn(
					"absolute flex gap-1 pointer-events-auto z-10",
					positionClasses[position],
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>
	)
}

type SurfaceGridProps = {
	size?: number
	children?: React.ReactNode
}

export function SurfaceGrid({
	className,
	children,
	size = 20,
	...props
}: SurfaceGridProps & React.ComponentProps<"div">) {
	return (
		<div
			data-slot="surface-grid"
			className={cn(
				"absolute inset-0 text-canvas-foreground",
				className,
			)}
			style={{
				backgroundImage: `radial-gradient(circle, currentColor var(--surface-grid-opacity, 0.1) ${size / 2}px, transparent ${size / 2}px)`,
				backgroundSize: `${size}px ${size}px`,
			}}
			{...props}
		>
			{children}
		</div>
	)
}
