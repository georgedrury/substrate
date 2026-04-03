"use client"

import { useState } from "react"
import {
	Gallery,
	GalleryItem,
	GalleryImage,
	GalleryAction,
} from "@/registry/substrate/components/gallery"

const images = [
	{ id: "1", src: "https://picsum.photos/seed/sub1/400/400", alt: "Sample 1" },
	{ id: "2", src: "https://picsum.photos/seed/sub2/400/400", alt: "Sample 2" },
	{ id: "3", src: "https://picsum.photos/seed/sub3/400/400", alt: "Sample 3" },
	{ id: "4", src: "https://picsum.photos/seed/sub4/400/400", alt: "Sample 4" },
	{ id: "5", src: "https://picsum.photos/seed/sub5/400/400", alt: "Sample 5" },
	{ id: "6", src: "https://picsum.photos/seed/sub6/400/400", alt: "Sample 6" },
]

export default function GalleryDemo() {
	const [selected, setSelected] = useState<string | null>(null)

	return (
		<div className="w-full max-w-md">
			<Gallery columns={3} gap={2}>
				{images.map((img) => (
					<GalleryItem
						key={img.id}
						selected={selected === img.id}
						onSelect={() => setSelected(img.id)}
					>
						<GalleryImage src={img.src} alt={img.alt} />
						<GalleryAction onClick={(e) => e.stopPropagation()}>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
						</GalleryAction>
					</GalleryItem>
				))}
			</Gallery>
		</div>
	)
}
