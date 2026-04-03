"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import Link from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"
import type { PageTreeRoot, PageTreeNode } from "@/types/fumadocs"

interface PagerProps extends React.HTMLAttributes<HTMLElement> {
	tree: PageTreeRoot
	url: string
}

interface PagerItem {
	title: string
	url: string
}

function flattenPages(tree: PageTreeRoot): PagerItem[] {
	const pages: PagerItem[] = []

	function traverse(node: PageTreeNode) {
		if (node.type === "page") {
			pages.push({
				title: String(node.name),
				url: node.url,
			})
		}

		if ("children" in node && node.children) {
			node.children.forEach(traverse)
		}
	}

	tree.children.forEach(traverse)
	return pages
}

export function Pager({ tree, url, className, ...props }: PagerProps) {
	const pages = React.useMemo(() => flattenPages(tree), [tree])
	const currentIndex = pages.findIndex((page) => page.url === url)

	const prev = currentIndex > 0 ? pages[currentIndex - 1] : null
	const next = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null

	if (!prev && !next) {
		return null
	}

	return (
		<nav
			className={cn("mt-12 flex items-center gap-4 border-t pt-8", className)}
			{...props}
		>
			{prev ? (
				<Link
					href={prev.url}
					className="flex flex-1 flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-muted"
				>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<RiArrowLeftSLine className="size-4" />
						<span>Previous</span>
					</div>
					<div className="font-medium">{prev.title}</div>
				</Link>
			) : (
				<div className="flex-1" />
			)}

			{next ? (
				<Link
					href={next.url}
					className="flex flex-1 flex-col gap-2 rounded-lg border p-4 text-right transition-colors hover:bg-muted"
				>
					<div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
						<span>Next</span>
						<RiArrowRightSLine className="size-4" />
					</div>
					<div className="font-medium">{next.title}</div>
				</Link>
			) : (
				<div className="flex-1" />
			)}
		</nav>
	)
}
