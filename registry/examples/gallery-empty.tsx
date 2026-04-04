import { Gallery, GalleryEmpty } from "@/registry/substrate/components/gallery"

export default function GalleryEmptyDemo() {
	return (
		<div className="w-full max-w-md">
			<Gallery columns={3}>
				<GalleryEmpty>No images generated yet</GalleryEmpty>
			</Gallery>
		</div>
	)
}
