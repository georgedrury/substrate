"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LineageItem {
	name: string
	href?: string
}

interface LineageProps extends React.HTMLAttributes<HTMLDivElement> {
	items: LineageItem[]
}

export function Lineage({ items, className, ...props }: LineageProps) {
	return (
		<div className="bg-accent p-12 mt-4">
			<div
				className={cn("flex flex-col items-center mt-4", className)}
				{...props}
			>
				{items.map((item, index) => (
					<React.Fragment key={index}>
						<div
							className={cn(
								"text-lg bg-background border-[0.5px] px-3 w-56 h-10 flex items-center rounded-full last:text-primary",
								item.href && "hover:scale-101 transition ease-in",
							)}
							style={{
								animation: "opacityFadeIn 0.5s ease-in forwards",
								animationDelay: `${index * 0.25}s`,
								opacity: 0,
							}}
						>
							{item.href ? (
								<a
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex-1 flex justify-between items-center h-full py-1"
								>
									<div className="flex items-center gap-2">
										{item.name}
									</div>
								</a>
							) : (
								<div className="flex items-center gap-2">
									<div className="size-4 bg-foreground rounded-full ml-1" />
									<span className="text-foreground">{item.name}</span>
								</div>
							)}
						</div>
						{index < items.length - 1 && (
							<div
								className="h-8 w-px bg-foreground/10"
								style={{
									animation: "opacityFadeIn 0.5s ease-in forwards",
									animationDelay: `${(items.length - 1) * 0.25 + 0.5 + 0.1}s`,
									opacity: 0,
								}}
							/>
						)}
					</React.Fragment>
				))}
			</div>
		</div>
	)
}
