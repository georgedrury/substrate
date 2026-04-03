"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/copy-button"

export interface ComponentPreviewClientProps {
	source: string
	children: React.ReactNode
	className?: string
	background?: "canvas" | "background"
}

export function ComponentPreviewClient({
	source,
	children,
	className,
	background = "background",
}: ComponentPreviewClientProps) {
	const [showCode, setShowCode] = React.useState(false)

	return (
		<div
			data-background={background}
			className={cn(
				"not-prose group relative my-6 flex flex-col overflow-hidden bg-background data-[background=canvas]:bg-canvas data-[background=background]:border",
				className,
			)}
		>
			{/* Preview */}
			<div className="flex min-h-[200px]  items-center justify-center p-8">
				{children}
			</div>

			{/* Code section */}
			<div className="relative overflow-hidden">
				{showCode ? (
					<div className="border-t">
						<div className="relative">
							<CopyButton value={source} className="right-4 top-3" />
							<pre className="overflow-x-auto bg-muted/50 p-4 pr-12 text-sm max-h-96">
								<code>{source}</code>
							</pre>
						</div>
					</div>
				) : (
					<div className="relative">
						<div className="overflow-hidden border-t bg-muted/50">
							<pre className="overflow-hidden p-4 text-sm max-h-16">
								<code className="text-muted-foreground">
									{source.split("\n").slice(0, 3).join("\n")}
								</code>
							</pre>
						</div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div
								className="absolute inset-0"
								style={{
									background:
										"linear-gradient(to top, hsl(var(--muted) / 0.8), hsl(var(--muted) / 0.5), transparent)",
								}}
							/>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="relative z-10 rounded-lg bg-background text-foreground shadow-none hover:bg-muted"
								onClick={() => setShowCode(true)}
							>
								View Code
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
