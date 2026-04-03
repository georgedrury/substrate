import { Panel } from "@/registry/substrate/components/panel"
import {
	Pane,
	PaneHeader,
	PaneLabel,
} from "@/registry/substrate/components/pane"

export default function PanelDemo() {
	return (
		<div className="h-[300px] bg-canvas overflow-hidden">
			<Panel position="left">
				<Pane>
					<PaneHeader>
						<PaneLabel>Layers</PaneLabel>
					</PaneHeader>
					<div className="space-y-1">
						<div className="text-xs px-2 py-1.5 rounded bg-accent/50">
							Background
						</div>
						<div className="text-xs px-2 py-1.5 rounded">Rectangle 1</div>
						<div className="text-xs px-2 py-1.5 rounded">Text layer</div>
					</div>
				</Pane>
			</Panel>
		</div>
	)
}
