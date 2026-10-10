"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { RiArrowRightSLine } from "@remixicon/react"

import type { PageTreeRoot, PageTreeNode } from "@/types/fumadocs"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./theme-toggle"

interface DocsSidebarProps {
	tree: PageTreeRoot
	title?: string
	flags?: Map<string, string>
}

function PageItem({
	node,
	flags,
}: {
	node: PageTreeNode
	flags?: Map<string, string>
}) {
	const pathname = usePathname()

	if (node.type !== "page") return null

	const isActive = pathname === node.url
	const flag = flags?.get(node.url)

	return (
		<SidebarMenuItem className="w-fit">
			<SidebarMenuButton asChild isActive={isActive}>
				<Link href={node.url}>
					{node.name}
					{flag && (
						<Badge className="ml-1.5 text-[10px] px-1 py-0">{flag}</Badge>
					)}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}

function FolderSection({
	node,
	flags,
}: {
	node: PageTreeNode
	flags?: Map<string, string>
}) {
	if (node.type !== "folder") return null

	const hasChildren = node.children && node.children.length > 0

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{node.name}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{hasChildren &&
						node.children.map((child: PageTreeNode, index: number) => {
							if (child.type === "page") {
								return <PageItem key={index} node={child} flags={flags} />
							}

							if (child.type === "folder") {
								return (
									<FolderCollapsible key={index} node={child} flags={flags} />
								)
							}

							return null
						})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}

function FolderCollapsible({
	node,
	flags,
}: {
	node: PageTreeNode
	flags?: Map<string, string>
}) {
	const pathname = usePathname()

	if (node.type !== "folder") return null

	const hasChildren = node.children && node.children.length > 0
	const hasActivePage = hasChildren
		? node.children.some(
				(child) => child.type === "page" && pathname === child.url,
			)
		: false

	return (
		<Collapsible
			defaultOpen={hasActivePage}
			className="group/collapsible w-fit"
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton>
						{node.name}
						<RiArrowRightSLine className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				{hasChildren && (
					<CollapsibleContent>
						<SidebarMenuSub>
							{node.children.map((child: PageTreeNode, index: number) => {
								if (child.type === "page") {
									const isActive = pathname === child.url
									const flag = flags?.get(child.url)
									return (
										<SidebarMenuSubItem key={index}>
											<SidebarMenuSubButton asChild isActive={isActive}>
												<Link href={child.url}>
													{child.name}
													{flag && (
														<Badge
															variant="outline"
															className="ml-1.5 text-[10px] px-1 py-0"
														>
															{flag}
														</Badge>
													)}
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									)
								}
								return null
							})}
						</SidebarMenuSub>
					</CollapsibleContent>
				)}
			</SidebarMenuItem>
		</Collapsible>
	)
}

export function DocsSidebar({
	tree,
	title = "Documentation",
	flags,
}: DocsSidebarProps) {
	const topLevelPages = tree.children.filter(
		(node) => node.type === "page" || node.type === "separator",
	)
	const topLevelFolders = tree.children.filter((node) => node.type === "folder")

	return (
		<Sidebar className="border-r-[0.5px]!">
			<SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<Link
							href="/docs"
							className="flex items-center gap-2 font-heading text-primary text-2xl"
						>
							{title}
						</Link>
					</SidebarGroup>
				</SidebarContent>
			</SidebarHeader>
			<SidebarContent>
				{topLevelPages.length > 0 && (
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{topLevelPages.map((node: PageTreeNode, index: number) => (
									<PageItem key={index} node={node} flags={flags} />
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
				{topLevelFolders.map((node: PageTreeNode, index: number) => (
					<FolderSection key={index} node={node} flags={flags} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<ThemeToggle />
			</SidebarFooter>
		</Sidebar>
	)
}
