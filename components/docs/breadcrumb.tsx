"use client"

import { RiArrowRightSLine } from "@remixicon/react"
import Link from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
	url: string
	items?: Array<{ title: string; href?: string }>
}

export function Breadcrumb({
	url,
	items,
	className,
	...props
}: BreadcrumbProps) {
	const breadcrumbs = React.useMemo(() => {
		if (items) return items

		const segments = url.split("/").filter(Boolean)
		return segments.map((segment, index) => {
			const href = "/" + segments.slice(0, index + 1).join("/")
			const title = segment
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ")

			return {
				title,
				href: index === segments.length - 1 ? undefined : href,
			}
		})
	}, [url, items])

	if (breadcrumbs.length === 0) {
		return null
	}

	return (
		<nav
			aria-label="Breadcrumb"
			className={cn(
				"flex items-center gap-2 text-sm text-muted-foreground",
				className,
			)}
			{...props}
		>
			{breadcrumbs.map((item, index) => (
				<React.Fragment key={item.title}>
					{index > 0 && <RiArrowRightSLine className="size-4" />}
					{item.href ? (
						<Link
							href={item.href}
							className="transition-colors hover:text-foreground"
						>
							{item.title}
						</Link>
					) : (
						<span className="font-medium text-primary">{item.title}</span>
					)}
				</React.Fragment>
			))}
		</nav>
	)
}
