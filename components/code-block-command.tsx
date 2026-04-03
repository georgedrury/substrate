"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"

interface CodeBlockCommandProps extends React.HTMLAttributes<HTMLDivElement> {
	__npm__: string
	__yarn__: string
	__pnpm__: string
	__bun__: string
}

export function CodeBlockCommand({
	__npm__,
	__yarn__,
	__pnpm__,
	__bun__,
	className,
	...props
}: CodeBlockCommandProps) {
	return (
		<div className={cn("relative", className)} {...props}>
			<Tabs defaultValue="npm" className="gap-0">
				<TabsList className="bg-transparent mt-4 p-0 rounded-none!">
					<TabsTrigger
						value="npm"
						className="relative rounded-none border-x-0 border-t-0! border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-normal text-muted-foreground shadow-none! transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none! cursor-pointer font-sans"
					>
						npm
					</TabsTrigger>
					<TabsTrigger
						value="yarn"
						className="relative rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-normal text-muted-foreground shadow-none! transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none! cursor-pointer font-sans"
					>
						yarn
					</TabsTrigger>
					<TabsTrigger
						value="pnpm"
						className="relative rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-normal text-muted-foreground shadow-none! transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none! cursor-pointer font-sans"
					>
						pnpm
					</TabsTrigger>
					<TabsTrigger
						value="bun"
						className="relative rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-normal text-muted-foreground shadow-none! transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none! cursor-pointer font-sans"
					>
						bun
					</TabsTrigger>
				</TabsList>
				<TabsContent value="npm" className="relative -mt-px">
					<CopyButton value={__npm__} />
					<pre className="mb-4 mt-0 overflow-x-auto bg-muted/50 px-4 py-4">
						<code className="relative font-mono text-sm">{__npm__}</code>
					</pre>
				</TabsContent>
				<TabsContent value="yarn" className="relative">
					<CopyButton value={__yarn__} />
					<pre className="mb-4 mt-0 overflow-x-auto bg-muted/50 px-4 py-4">
						<code className="relative font-mono text-sm">{__yarn__}</code>
					</pre>
				</TabsContent>
				<TabsContent value="pnpm" className="relative">
					<CopyButton value={__pnpm__} />
					<pre className="mb-4 mt-0 overflow-x-auto bg-muted/50 px-4 py-4">
						<code className="relative font-mono text-sm">{__pnpm__}</code>
					</pre>
				</TabsContent>
				<TabsContent value="bun" className="relative">
					<CopyButton value={__bun__} />
					<pre className="mb-4 mt-0 overflow-x-auto bg-muted/50 px-4 py-4">
						<code className="relative font-mono text-sm">{__bun__}</code>
					</pre>
				</TabsContent>
			</Tabs>
		</div>
	)
}
