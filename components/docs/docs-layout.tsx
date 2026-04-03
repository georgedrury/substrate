"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TOC, type TOCItem } from "./toc"

interface DocsLayoutProps {
	toc?: TOCItem[]
	children: React.ReactNode
	className?: string
	wide?: boolean
}

export function DocsLayout({
	toc,
	children,
	className,
	wide,
}: DocsLayoutProps) {
	return (
		<div className={cn("flex gap-8", className)}>
			<div
				className={cn(
					"min-w-0 flex-1",
					wide ? "max-w-6xl overflow-x-auto mx-auto" : "max-w-xl mx-auto",
				)}
			>
				<article className="prose prose-neutral dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0 prose-headings:scroll-mt-24">
					{children}
				</article>
			</div>
			{toc && toc.length > 0 && (
				<aside className="sticky top-20 hidden max-h-[calc(100vh-5rem)] w-64 flex-shrink-0 self-start overflow-y-auto xl:block">
					<TOC items={toc} />
				</aside>
			)}
		</div>
	)
}
