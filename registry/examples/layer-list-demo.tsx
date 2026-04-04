"use client"

import { useState } from "react"
import {
	LayerList,
	LayerItem,
	LayerIcon,
	LayerName,
	LayerActions,
	LayerVisibilityToggle,
	LayerLockToggle,
} from "@/registry/substrate/components/layer-list"

const initialLayers = [
	{ id: "1", name: "Header", colour: "#6366f1", visible: true, locked: false },
	{ id: "2", name: "Hero image", colour: "#0ea5e9", visible: true, locked: false },
	{ id: "3", name: "CTA button", colour: "#f43f5e", visible: true, locked: false },
	{ id: "4", name: "Background", colour: "#a3a3a3", visible: true, locked: true },
]

export default function LayerListDemo() {
	const [layers, setLayers] = useState(initialLayers)
	const [selectedId, setSelectedId] = useState<string>("2")

	return (
		<div className="w-[240px] border rounded-lg bg-card overflow-hidden">
			<LayerList>
				{layers.map((layer) => (
					<LayerItem
						key={layer.id}
						selected={selectedId === layer.id}
						onClick={() => setSelectedId(layer.id)}
					>
						<LayerIcon colour={layer.colour} />
						<LayerName
							onRename={(name) =>
								setLayers((l) =>
									l.map((x) => (x.id === layer.id ? { ...x, name } : x)),
								)
							}
						>
							{layer.name}
						</LayerName>
						<LayerActions>
							<LayerVisibilityToggle
								visible={layer.visible}
								onVisibleChange={(visible) =>
									setLayers((l) =>
										l.map((x) => (x.id === layer.id ? { ...x, visible } : x)),
									)
								}
							/>
							<LayerLockToggle
								locked={layer.locked}
								onLockedChange={(locked) =>
									setLayers((l) =>
										l.map((x) => (x.id === layer.id ? { ...x, locked } : x)),
									)
								}
							/>
						</LayerActions>
					</LayerItem>
				))}
			</LayerList>
		</div>
	)
}
