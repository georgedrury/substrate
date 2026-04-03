"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"

interface SourceCodeProps extends React.HTMLAttributes<HTMLDivElement> {
	file?: string
	children: React.ReactNode
	code?: string
}

export function SourceCode({ file, children, code, className, ...props }: SourceCodeProps) {
	return (
		<div className={cn("not-prose my-6", className)} {...props}>
			<div className="overflow-hidden rounded-lg border bg-muted">
				{file && (
					<div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
						<div className="font-mono text-sm text-muted-foreground">{file}</div>
						{code && <CopyButton value={code} className="relative right-0 top-0" />}
					</div>
				)}
				<div className="relative">
					{!file && code && <CopyButton value={code} />}
					<div className="overflow-x-auto">{children}</div>
				</div>
			</div>
		</div>
	)
}
