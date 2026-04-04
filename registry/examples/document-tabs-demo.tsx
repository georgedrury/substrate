"use client"

import { useState } from "react"
import {
	DocumentTabs,
	DocumentTabList,
	DocumentTab,
	DocumentTabContent,
} from "@/registry/substrate/components/document-tabs"

const initialTabs = [
	{ id: "1", name: "Homepage.design" },
	{ id: "2", name: "Components.design" },
	{ id: "3", name: "Icons.design" },
]

export default function DocumentTabsDemo() {
	const [tabs, setTabs] = useState(initialTabs)
	const [active, setActive] = useState("1")

	const closeTab = (id: string) => {
		const next = tabs.filter((t) => t.id !== id)
		if (next.length === 0) return
		if (active === id) setActive(next[0].id)
		setTabs(next)
	}

	return (
		<div className="w-[400px] border rounded-lg overflow-hidden bg-background">
			<DocumentTabs value={active} onValueChange={setActive}>
				<DocumentTabList>
					{tabs.map((tab) => (
						<DocumentTab
							key={tab.id}
							value={tab.id}
							onClose={() => closeTab(tab.id)}
						>
							{tab.name}
						</DocumentTab>
					))}
				</DocumentTabList>
				{tabs.map((tab) => (
					<DocumentTabContent key={tab.id} value={tab.id}>
						<div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
							{tab.name}
						</div>
					</DocumentTabContent>
				))}
			</DocumentTabs>
		</div>
	)
}
