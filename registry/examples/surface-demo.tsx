import { Surface, SurfaceControls, SurfaceGrid } from "@/registry/substrate/components/surface"

export default function SurfaceDemo() {
	return (
		<div className="relative w-full h-[300px] rounded-lg overflow-hidden border">
			<Surface>
				<SurfaceGrid size={20} />
				<SurfaceControls position="bottom-right">
					<button className="size-7 rounded bg-background/80 backdrop-blur-sm flex items-center justify-center text-xs border hover:bg-background">
						+
					</button>
					<button className="size-7 rounded bg-background/80 backdrop-blur-sm flex items-center justify-center text-xs border hover:bg-background">
						−
					</button>
				</SurfaceControls>
			</Surface>
		</div>
	)
}
