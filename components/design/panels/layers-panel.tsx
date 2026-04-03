"use client"

import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Panel } from "@/registry/substrate/components/panel"

export function LayersPanel() {
	const elements = useDocumentStore((s) => s.elements)
	const elementOrder = useDocumentStore((s) => s.elementOrder)
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const select = useDocumentStore((s) => s.select)
	const toggleSelection = useDocumentStore((s) => s.toggleSelection)

	return (
		<Panel position="left">
			<ScrollArea className="flex-1">
				<div className="p-1">
					{[...elementOrder].reverse().map((id) => {
						const el = elements[id]
						if (!el) return null
						const isSelected = selectedIds.has(id)

						return (
							<button
								key={id}
								onClick={(e) => {
									if (e.shiftKey) {
										toggleSelection(id)
									} else {
										select([id])
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

					{elementOrder.length === 0 && (
						<p className="px-2 py-4 text-center text-xs text-muted-foreground">
							No layers
						</p>
					)}
				</div>
			</ScrollArea>
		</Panel>
	)
}
