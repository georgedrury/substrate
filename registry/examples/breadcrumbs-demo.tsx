"use client"

import { useState } from "react"
import { Breadcrumbs, BreadcrumbItem } from "@/registry/substrate/components/breadcrumbs"

const path = [
	{ id: "page", label: "Page" },
	{ id: "header", label: "Header" },
	{ id: "nav", label: "Navigation" },
	{ id: "link", label: "Link" },
]

export default function BreadcrumbsDemo() {
	const [depth, setDepth] = useState(path.length - 1)
	const visible = path.slice(0, depth + 1)

	return (
		<Breadcrumbs>
			{visible.map((item, i) => (
				<BreadcrumbItem
					key={item.id}
					active={i === visible.length - 1}
					onClick={() => setDepth(i)}
				>
					{item.label}
				</BreadcrumbItem>
			))}
		</Breadcrumbs>
	)
}
