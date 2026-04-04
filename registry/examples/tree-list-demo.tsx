"use client"

import { useState } from "react"
import {
	TreeList,
	TreeItem,
	TreeItemContent,
	TreeItemIcon,
	useTreeExpansion,
} from "@/registry/substrate/components/tree-list"
import { RiArtboardLine } from "@remixicon/react"

const tree = [
	{
		id: "page",
		name: "Page",
		colour: "#6366f1",
		children: [
			{
				id: "header",
				name: "Header",
				colour: "#0ea5e9",
				children: [
					{ id: "logo", name: "Logo", colour: "#f43f5e" },
					{ id: "nav", name: "Navigation", colour: "#22c55e" },
				],
			},
			{
				id: "hero",
				name: "Hero",
				colour: "#eab308",
				children: [
					{ id: "headline", name: "Headline", colour: "#a855f7" },
					{ id: "cta", name: "CTA button", colour: "#f43f5e" },
				],
			},
			{ id: "footer", name: "Footer", colour: "#64748b" },
		],
	},
]

type TreeNode = {
	id: string
	name: string
	colour?: string
	children?: TreeNode[]
}

export default function TreeListDemo() {
	const [selectedId, setSelectedId] = useState("nav")
	const { isExpanded, toggle } = useTreeExpansion(["page", "header"])

	function renderNodes(nodes: TreeNode[], depth: number) {
		return nodes.map((node) => {
			const hasChildren = node.children && node.children.length > 0
			const expanded = isExpanded(node.id)

			return (
				<div key={node.id}>
					<TreeItem
						depth={depth}
						selected={selectedId === node.id}
						expandable={hasChildren}
						expanded={expanded}
						onExpandedChange={() => toggle(node.id)}
						onClick={() => setSelectedId(node.id)}
					>
						<TreeItemIcon colour={hasChildren ? undefined : node.colour}>
							{hasChildren && <RiArtboardLine />}
						</TreeItemIcon>
						<TreeItemContent>{node.name}</TreeItemContent>
					</TreeItem>
					{hasChildren && expanded && renderNodes(node.children!, depth + 1)}
				</div>
			)
		})
	}

	return (
		<div className="w-[240px] border rounded-lg bg-card overflow-hidden">
			<TreeList>{renderNodes(tree, 0)}</TreeList>
		</div>
	)
}
