"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePanel } from "../contexts/panel-context"
import { useSelection } from "../contexts/selection-context"
import { PropertiesTab } from "./properties-tab"
import { DesignTab } from "./design-tab"
import type { RightPanelId } from "../types"

export function PanelSwitcher() {
	const { state: panelState, setRightPanel } = usePanel()
	const { state: selectionState } = useSelection()

	// Auto-switch to properties when something is selected
	useEffect(() => {
		if (selectionState.selectedIds.size > 0) {
			setRightPanel("properties")
		}
	}, [selectionState.selectedIds.size, setRightPanel])

	return (
		<Tabs
			value={panelState.rightPanel}
			onValueChange={(v) => setRightPanel(v as RightPanelId)}
			className="h-full flex flex-col"
		>
			<TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-2 shrink-0">
				<TabsTrigger value="properties" className="text-xs cursor-pointer">
					Properties
				</TabsTrigger>
				<TabsTrigger value="design" className="text-xs cursor-pointer">
					Design
				</TabsTrigger>
			</TabsList>
			<TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
				<ScrollArea className="h-full">
					<PropertiesTab />
				</ScrollArea>
			</TabsContent>
			<TabsContent value="design" className="flex-1 m-0 overflow-hidden">
				<ScrollArea className="h-full">
					<DesignTab />
				</ScrollArea>
			</TabsContent>
		</Tabs>
	)
}
