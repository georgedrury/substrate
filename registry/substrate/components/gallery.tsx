import { cn } from "@/lib/utils"

type GalleryProps = {
	columns?: number
	gap?: number
	children?: React.ReactNode
}

export function Gallery({
	className,
	children,
	columns = 3,
	gap = 2,
	...props
}: GalleryProps & React.ComponentProps<"div">) {
	return (
		<div
			data-slot="gallery"
			className={cn("grid w-full", className)}
			style={{
				gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
				gap: `${gap * 0.25}rem`,
			}}
			{...props}
		>
			{children}
		</div>
	)
}

type GalleryItemProps = {
	selected?: boolean
	onSelect?: () => void
	children?: React.ReactNode
}

export function GalleryItem({
	className,
	children,
	selected = false,
	onSelect,
	...props
}: GalleryItemProps & React.ComponentProps<"div">) {
	return (
		<div
			data-slot="gallery-item"
			data-selected={selected}
			className={cn(
				"group relative aspect-square overflow-hidden rounded-md cursor-pointer",
				"transition-all duration-200",
				selected && "ring-2 ring-primary",
				className,
			)}
			onClick={onSelect}
			{...props}
		>
			{children}
			<div
				className={cn(
					"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
				)}
			/>
		</div>
	)
}

type GalleryImageProps = React.ComponentProps<"img">

export function GalleryImage({ className, ...props }: GalleryImageProps) {
	return (
		<img
			data-slot="gallery-image"
			className={cn("object-cover w-full h-full", className)}
			{...props}
		/>
	)
}

type GalleryActionProps = React.ComponentProps<"button">

export function GalleryAction({
	className,
	children,
	...props
}: GalleryActionProps) {
	return (
		<button
			data-slot="gallery-action"
			className={cn(
				"absolute top-2 right-2 z-10 size-7 rounded bg-background/80 backdrop-blur-sm",
				"opacity-0 group-hover:opacity-100 transition-opacity duration-200",
				"flex items-center justify-center hover:bg-background",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	)
}

type GalleryEmptyProps = {
	children?: React.ReactNode
}

export function GalleryEmpty({
	className,
	children,
	...props
}: GalleryEmptyProps & React.ComponentProps<"div">) {
	return (
		<div
			data-slot="gallery-empty"
			className={cn(
				"col-span-full flex items-center justify-center text-sm text-muted-foreground py-8",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
