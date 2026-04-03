"use client"

import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Panel } from "../components/panel"

export function LayersPanel() {
	const { state } = useCanvas()
	const { state: selectionState, dispatch: selectionDispatch } = useSelection()

	return (
		<Panel position="left">
			<ScrollArea className="flex-1">
				<div className="p-1">
					{[...state.elementOrder].reverse().map((id) => {
						const el = state.elements[id]
						if (!el) return null
						const isSelected = selectionState.selectedIds.has(id)

						return (
							<button
								key={id}
								onClick={(e) => {
									if (e.shiftKey) {
										selectionDispatch({ type: "TOGGLE", id })
									} else {
										selectionDispatch({ type: "SELECT", ids: [id] })
									}
								}}
								className={cn(
									"flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors",
									"hover:bg-accent",
									isSelected && "bg-accent text-accent-foreground",
								)}
							>
								<span
									className={cn(
										"size-2 rounded-full shrink-0",
										el.visible ? "bg-foreground/40" : "bg-foreground/10",
									)}
								/>
								<span className="truncate">{el.name}</span>
								<span className="ml-auto text-[10px] text-muted-foreground capitalize">
									{el.type}
								</span>
							</button>
						)
					})}

					{state.elementOrder.length === 0 && (
						<p className="px-2 py-4 text-center text-xs text-muted-foreground">
							No layers
						</p>
					)}
				</div>
			</ScrollArea>
		</Panel>
	)
}
