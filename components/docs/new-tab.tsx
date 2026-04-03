"use client"

import { RiExternalLinkLine } from "@remixicon/react"
import * as React from "react"

import { cn } from "@/lib/utils"

interface NewTabProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string
	children: React.ReactNode
}

export function NewTab({ href, className, children, ...props }: NewTabProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 hover:text-primary/80",
				className
			)}
			{...props}
		>
			{children}
			<RiExternalLinkLine className="inline size-3.5" />
		</a>
	)
}
