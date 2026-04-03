"use client"

import { RiExternalLinkLine, RiFileLine, RiFolderLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

interface SkillsProps extends React.ComponentProps<"div"> {
	title: string
	description?: string
	children: React.ReactNode
}

export function Skills({
	title,
	description,
	children,
	className,
	...props
}: SkillsProps) {
	return (
		<div
			className={cn("not-prose my-6 rounded-md border", className)}
			{...props}
		>
			<div className="flex items-center justify-between border-b px-4 py-3">
				<div>
					<div className="font-medium text-sm">{title}</div>
					{description && (
						<div className="text-sm text-muted-foreground">{description}</div>
					)}
				</div>
			</div>
			<div className="pt-2 px-3 pb-4">{children}</div>
		</div>
	)
}

interface SkillsFolderProps extends React.ComponentProps<"div"> {
	name: string
	children?: React.ReactNode
}

export function SkillsFolder({
	name,
	children,
	className,
	...props
}: SkillsFolderProps) {
	return (
		<div className={cn("", className)} {...props}>
			<div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground">
				<RiFolderLine className="size-4 opacity-50" />
				<span>{name}</span>
			</div>
			{children && <div className="ml-4 border-l pl-2">{children}</div>}
		</div>
	)
}

interface SkillProps extends React.ComponentProps<"div"> {
	name: string
	href: string
}

export function Skill({ name, href, className, ...props }: SkillProps) {
	return (
		<a href={href} target="_blank" rel="noopener noreferrer">
			<div
				className={cn(
					"group flex items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-muted/50 transition",
					className,
				)}
				{...props}
			>
				<div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
					<RiFileLine className="size-4" />
					<span>{name}</span>
				</div>
				<RiExternalLinkLine className="size-4 transition group-hover:opacity-100 opacity-0" />
			</div>
		</a>
	)
}
