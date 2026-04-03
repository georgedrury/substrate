"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TOCItem {
	title: string
	url: string
	depth: number
}

interface TOCProps extends React.HTMLAttributes<HTMLDivElement> {
	items: TOCItem[]
}

export function TOC({ items, className, ...props }: TOCProps) {
	const [activeId, setActiveId] = React.useState<string>("")

	React.useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
					}
				})
			},
			{ rootMargin: "0% 0% -80% 0%" }
		)

		const headings = document.querySelectorAll("h2, h3, h4")
		headings.forEach((heading) => observer.observe(heading))

		return () => {
			headings.forEach((heading) => observer.unobserve(heading))
		}
	}, [])

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault()
		setActiveId(id)

		const element = document.getElementById(id)
		if (element) {
			const headerOffset = 100
			const elementPosition = element.getBoundingClientRect().top
			const offsetPosition = elementPosition + window.scrollY - headerOffset

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			})
		}
	}

	if (!items || items.length === 0) {
		return null
	}

	return (
		<div className={cn("space-y-2", className)} {...props}>
			<p className="font-medium text-sm">On this page</p>
			<ul className="space-y-0 text-sm">
				{items.map((item) => {
					const isActive = activeId === item.url.slice(1)

					return (
						<li
							key={item.url}
							className={cn(
								"border-l-2 transition-colors",
								isActive ? "border-l-primary" : "border-l-border-muted/50"
							)}
							style={{
								paddingLeft:
									item.depth > 2 ? `${(item.depth - 2) * 1}rem` : undefined,
							}}
						>
							<a
								href={item.url}
								onClick={(e) => handleClick(e, item.url.slice(1))}
								className={cn(
									"block py-1 pl-4 transition-colors",
									isActive
										? "font-medium text-primary"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{item.title}
							</a>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
