import { Resizer } from "@/registry/substrate/components/resizer"

export default function ResizerDemo() {
	return (
		<div className="flex items-stretch h-24 w-[300px] border rounded-lg overflow-hidden">
			<div className="flex-1 flex items-center justify-center text-xs text-muted-foreground bg-card">
				Left panel
			</div>
			<Resizer orientation="vertical" />
			<div className="flex-1 flex items-center justify-center text-xs text-muted-foreground bg-card">
				Right panel
			</div>
		</div>
	)
}
