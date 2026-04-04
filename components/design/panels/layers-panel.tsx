"use client"

import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Panel } from "@/registry/substrate/components/panel"
import {
	LayerList,
	LayerItem,
	LayerIcon,
	LayerName,
	LayerActions,
	LayerVisibilityToggle,
	LayerLockToggle,
} from "@/registry/substrate/components/layer-list"
import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
} from "@/registry/substrate/components/context-menu"
import {
	EmptyState,
	EmptyStateIcon,
	EmptyStateTitle,
	EmptyStateDescription,
} from "@/registry/substrate/components/empty-state"
import { RiStackLine } from "@remixicon/react"
import { toast } from "@/registry/substrate/components/toast"

export function LayersPanel() {
	const elements = useDocumentStore((s) => s.elements)
	const elementOrder = useDocumentStore((s) => s.elementOrder)
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const hoveredId = useDocumentStore((s) => s.hoveredId)
	const select = useDocumentStore((s) => s.select)
	const toggleSelection = useDocumentStore((s) => s.toggleSelection)
	const setHovered = useDocumentStore((s) => s.setHovered)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const deleteElements = useDocumentStore((s) => s.deleteElements)
	const addElement = useDocumentStore((s) => s.addElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)
	const deselectAll = useDocumentStore((s) => s.deselectAll)

	const reversedOrder = [...elementOrder].reverse()

	if (elementOrder.length === 0) {
		return (
			<Panel position="left">
				<EmptyState>
					<EmptyStateIcon>
						<RiStackLine className="size-5" />
					</EmptyStateIcon>
					<EmptyStateTitle>No layers yet</EmptyStateTitle>
					<EmptyStateDescription>
						Draw a shape on the canvas to get started
					</EmptyStateDescription>
				</EmptyState>
			</Panel>
		)
	}

	return (
		<Panel position="left">
			<LayerList>
				{reversedOrder.map((id) => {
					const el = elements[id]
					if (!el) return null

					return (
						<ContextMenu key={id}>
							<ContextMenuTrigger asChild>
								<LayerItem
									selected={selectedIds.has(id)}
									hovered={hoveredId === id}
									onClick={(e) => {
										if (e.shiftKey || e.metaKey || e.ctrlKey) {
											toggleSelection(id)
										} else {
											select([id])
										}
									}}
									onMouseEnter={() => setHovered(id)}
									onMouseLeave={() => setHovered(null)}
								>
									<LayerIcon colour={el.fill?.color ?? undefined} />
									<LayerName
										onRename={(name) => {
											pushSnapshot()
											updateElement(id, { name })
										}}
									>
										{el.name}
									</LayerName>
									<LayerActions>
										<LayerVisibilityToggle
											visible={el.visible}
											onVisibleChange={(v) => {
												pushSnapshot()
												updateElement(id, { visible: v })
											}}
										/>
										<LayerLockToggle
											locked={el.locked}
											onLockedChange={(v) => {
												pushSnapshot()
												updateElement(id, { locked: v })
											}}
										/>
									</LayerActions>
								</LayerItem>
							</ContextMenuTrigger>
							<ContextMenuContent>
								<ContextMenuItem
									onSelect={() => {
										pushSnapshot()
										const newId = crypto.randomUUID()
										addElement({
											...el,
											id: newId,
											x: el.x + 20,
											y: el.y + 20,
											name: `${el.name} copy`,
										} as typeof el)
										select([newId])
									}}
								>
									Duplicate
									<ContextMenuShortcut>⌘D</ContextMenuShortcut>
								</ContextMenuItem>
								<ContextMenuSeparator />
								<ContextMenuItem
									onSelect={() => {
										pushSnapshot()
										updateElement(id, { visible: !el.visible })
									}}
								>
									{el.visible ? "Hide" : "Show"}
								</ContextMenuItem>
								<ContextMenuItem
									onSelect={() => {
										pushSnapshot()
										updateElement(id, { locked: !el.locked })
									}}
								>
									{el.locked ? "Unlock" : "Lock"}
								</ContextMenuItem>
								<ContextMenuSeparator />
								<ContextMenuItem
									onSelect={() => {
										const snapshot = el
										pushSnapshot()
										deleteElements([id])
										deselectAll()
										toast.undo("Layer deleted", () => {
											pushSnapshot()
											addElement(snapshot)
											select([id])
										})
									}}
								>
									Delete
									<ContextMenuShortcut>⌫</ContextMenuShortcut>
								</ContextMenuItem>
							</ContextMenuContent>
						</ContextMenu>
					)
				})}
			</LayerList>
		</Panel>
	)
}
