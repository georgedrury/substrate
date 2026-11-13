"use client"

import { useRef, useState } from "react"
import { RiImageAddLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

// ── Types ──

type ImagePickerOption = string | { value: string; label: string }

type NamedImage = {
	value: string
	label: string
}

/** "https://cdn/x/hero-wide.png?w=2" -> "hero-wide" */
function imageLabel(src: string): string {
	if (src.startsWith("data:")) return "Uploaded image"
	const file = src.split(/[?#]/)[0].split("/").pop() ?? ""
	return decodeURIComponent(file).replace(/\.[a-z0-9]+$/i, "") || "Image"
}

function toNamed(option: ImagePickerOption): NamedImage {
	return typeof option === "string"
		? { value: option, label: imageLabel(option) }
		: option
}

function readAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result))
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})
}

// ── ImagePicker ──

type ImagePickerProps = {
	/** The selected image's URL, or an empty string for none */
	value: string
	onChange: (value: string) => void
	/** Image URLs to choose from, optionally with labels */
	options?: ImagePickerOption[]
	/** Show an upload tile and accept dropped files. Uploads become data URLs. */
	upload?: boolean
	columns?: number
	disabled?: boolean
}

function ImagePicker({
	value,
	onChange,
	options = [],
	upload = true,
	columns = 4,
	disabled,
	className,
	...props
}: ImagePickerProps & Omit<React.ComponentProps<"div">, "onChange" | "defaultValue">) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [uploads, setUploads] = useState<NamedImage[]>([])
	const [dragging, setDragging] = useState(false)

	const images = [...options.map(toNamed), ...uploads]
	// A value from storage or code that isn't in the list still shows as selected
	if (value && !images.some((image) => image.value === value)) {
		images.push({ value, label: imageLabel(value) })
	}

	const addFiles = async (files: FileList | null) => {
		const imageFiles = Array.from(files ?? []).filter((file) =>
			file.type.startsWith("image/"),
		)
		if (imageFiles.length === 0) return
		const added = await Promise.all(
			imageFiles.map(async (file) => ({
				value: await readAsDataUrl(file),
				label: file.name.replace(/\.[a-z0-9]+$/i, ""),
			})),
		)
		setUploads((current) => [...current, ...added])
		onChange(added[added.length - 1].value)
	}

	return (
		<div
			data-slot="image-picker"
			data-dragging={dragging || undefined}
			className={cn(
				"grid gap-1.5 rounded-md",
				dragging && "ring-2 ring-ring/50",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
			onDragOver={(event) => {
				if (!upload) return
				event.preventDefault()
				setDragging(true)
			}}
			onDragLeave={(event) => {
				// Moving between tiles fires dragleave on the grid too
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setDragging(false)
				}
			}}
			onDrop={(event) => {
				if (!upload) return
				event.preventDefault()
				setDragging(false)
				void addFiles(event.dataTransfer.files)
			}}
			{...props}
		>
			{images.map((image) => {
				const selected = image.value === value
				return (
					<button
						key={image.value}
						type="button"
						data-slot="image-picker-item"
						data-selected={selected || undefined}
						aria-pressed={selected}
						aria-label={image.label}
						title={image.label}
						disabled={disabled}
						onClick={() => onChange(image.value)}
						className={cn(
							"relative aspect-square overflow-hidden rounded-md bg-muted outline-none transition-shadow",
							"focus-visible:ring-[3px] focus-visible:ring-ring/50",
							selected
								? "ring-2 ring-[var(--image-picker-selection,var(--color-primary))]"
								: "hover:ring-1 hover:ring-border",
						)}
					>
						<img
							src={image.value}
							alt=""
							draggable={false}
							className="size-full object-cover"
						/>
					</button>
				)
			})}
			{upload && (
				<>
					<button
						type="button"
						data-slot="image-picker-upload"
						aria-label="Upload image"
						title="Upload or drop an image"
						disabled={disabled}
						onClick={() => inputRef.current?.click()}
						className={cn(
							"flex aspect-square items-center justify-center rounded-md border border-dashed text-muted-foreground outline-none transition-colors",
							"hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
							"[&_svg]:size-4",
						)}
					>
						<RiImageAddLine />
					</button>
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						multiple
						hidden
						onChange={(event) => {
							void addFiles(event.target.files)
							event.target.value = ""
						}}
					/>
				</>
			)}
		</div>
	)
}

export {
	ImagePicker,
	imageLabel,
	type ImagePickerProps,
	type ImagePickerOption,
}
