import {
	Pane,
	PaneHeader,
	PaneLabel,
	PaneAction,
} from "@/registry/substrate/components/pane"
import { RiResetLeftLine } from "@remixicon/react"

export default function PaneDemo() {
	return (
		<div className="w-[260px] border rounded-lg py-2">
			<Pane>
				<PaneHeader>
					<PaneLabel>Properties</PaneLabel>
					<PaneAction>
						<RiResetLeftLine />
					</PaneAction>
				</PaneHeader>
				<div className="space-y-2">
					<div className="flex justify-between text-xs">
						<span className="text-muted-foreground">Width</span>
						<span>400px</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-muted-foreground">Height</span>
						<span>300px</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-muted-foreground">Rotation</span>
						<span>0°</span>
					</div>
				</div>
			</Pane>
		</div>
	)
}
