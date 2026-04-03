import type { MDXComponents } from "mdx/types"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"
import { CodeBlockCommand } from "@/components/code-block-command"
import { NewTab } from "@/components/docs/new-tab"
import { SourceCode } from "@/components/docs/source-code"
import { Lineage } from "@/components/docs/lineage"
import { Banner } from "@/components/docs/banner"
import { Skills, SkillsFolder, Skill } from "@/components/docs/skills"
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion"

export const mdxComponents: MDXComponents = {
	// Custom documentation components
	NewTab,
	SourceCode,
	Lineage,
	Banner,
	Skills,
	SkillsFolder,
	Skill,
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,

	// Headings
	h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
		<h1
			className={cn(
				"mt-2 scroll-m-4 text-2xl font-semibold first:mt-0",
				className,
			)}
			{...props}
		/>
	),
	h2: ({ className, ...props }: React.ComponentProps<"h2">) => {
		return (
			<h2
				id={props.children
					?.toString()
					.replace(/ /g, "-")
					.replace(/'/g, "")
					.replace(/\?/g, "")
					.toLowerCase()}
				className={cn(
					"mt-12 scroll-m-4 pb-2 text-xl font-semibold first:mt-0",
					className,
				)}
				{...props}
			/>
		)
	},
	h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
		<h3
			className={cn("mt-8 scroll-m-4 text-lg font-semibold", className)}
			{...props}
		/>
	),
	h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
		<h4
			className={cn("mt-8 scroll-m-4 text-lg font-semibold", className)}
			{...props}
		/>
	),
	h5: ({ className, ...props }: React.ComponentProps<"h5">) => (
		<h5
			className={cn("mt-8 scroll-m-4 text-base font-semibold", className)}
			{...props}
		/>
	),
	h6: ({ className, ...props }: React.ComponentProps<"h6">) => (
		<h6
			className={cn("mt-8 scroll-m-4 text-base font-semibold", className)}
			{...props}
		/>
	),
	a: ({ className, ...props }: React.ComponentProps<"a">) => (
		<a
			className={cn("font-medium underline underline-offset-4", className)}
			{...props}
		/>
	),
	p: ({ className, ...props }: React.ComponentProps<"p">) => (
		<p
			className={cn(
				"leading-6 text-base [&:not(:first-child)]:mt-3",
				className,
			)}
			{...props}
		/>
	),
	strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
		<strong className={cn("font-medium", className)} {...props} />
	),
	ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
		<ul className={cn("my-4 ml-6 list-disc", className)} {...props} />
	),
	ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
		<ol className={cn("my-4 ml-6 list-decimal", className)} {...props} />
	),
	li: ({ className, ...props }: React.ComponentProps<"li">) => (
		<li className={cn("mt-2 leading-7 first:mt-0", className)} {...props} />
	),
	blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
		<blockquote
			className={cn(
				"mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground",
				className,
			)}
			{...props}
		/>
	),
	img: ({ className, alt, ...props }: React.ComponentProps<"img">) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img className={cn("rounded-md border", className)} alt={alt} {...props} />
	),
	Image: ({
		src,
		className,
		width,
		height,
		alt,
		...props
	}: React.ComponentProps<typeof Image>) => (
		<Image
			className={cn("mt-6 rounded-md border", className)}
			src={src || ""}
			width={Number(width)}
			height={Number(height)}
			alt={alt || ""}
			{...props}
		/>
	),
	hr: ({ ...props }: React.ComponentProps<"hr">) => (
		<hr className="my-4 md:my-8" {...props} />
	),
	table: ({ className, ...props }: React.ComponentProps<"table">) => (
		<div className="my-6 w-full overflow-y-auto">
			<table className={cn("w-full", className)} {...props} />
		</div>
	),
	tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
		<tr
			className={cn("m-0 border-b transition-colors", className)}
			{...props}
		/>
	),
	th: ({ className, ...props }: React.ComponentProps<"th">) => (
		<th
			className={cn(
				"border px-2 py-2 text-left font-medium text-sm [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	td: ({ className, ...props }: React.ComponentProps<"td">) => (
		<td
			className={cn(
				"border px-2 [&>code]:text-sm py-2 text-sm text-left [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	pre: ({ className, children, ...props }: React.ComponentProps<"pre">) => {
		const childrenArray = React.Children.toArray(children)
		const codeElement = childrenArray.find((child) =>
			React.isValidElement(child),
		)

		const codeProps = React.isValidElement(codeElement)
			? (codeElement.props as {
					__npm__?: string
					__yarn__?: string
					__pnpm__?: string
					__bun__?: string
					__raw__?: string
				})
			: {}

		const isPackageManagerCommand =
			codeProps.__npm__ &&
			codeProps.__yarn__ &&
			codeProps.__pnpm__ &&
			codeProps.__bun__

		if (isPackageManagerCommand) {
			return <>{children}</>
		}

		const rawCode = codeProps.__raw__ ?? null

		return (
			<div className="not-prose relative my-6">
				{rawCode && <CopyButton value={rawCode} />}
				<pre
					className={cn(
						"overflow-x-auto bg-muted/50 p-4 text-sm max-h-124",
						className,
					)}
					{...props}
				>
					{children}
				</pre>
			</div>
		)
	},
	code: ({
		className,
		__raw__,
		__src__,
		__npm__,
		__yarn__,
		__pnpm__,
		__bun__,
		...props
	}: React.ComponentProps<"code"> & {
		__raw__?: string
		__src__?: string
		__npm__?: string
		__yarn__?: string
		__pnpm__?: string
		__bun__?: string
	}) => {
		if (typeof props.children === "string") {
			return (
				<code
					className={cn(
						"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
						className,
					)}
					{...props}
				/>
			)
		}

		const isPackageManagerCommand = __npm__ && __yarn__ && __pnpm__ && __bun__
		if (isPackageManagerCommand) {
			return (
				<CodeBlockCommand
					__npm__={__npm__}
					__yarn__={__yarn__}
					__pnpm__={__pnpm__}
					__bun__={__bun__}
				/>
			)
		}

		return <code className={className} {...props} />
	},
	Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
		<Link
			className={cn("font-medium underline underline-offset-4", className)}
			{...props}
		/>
	),
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		...mdxComponents,
		...components,
	}
}
