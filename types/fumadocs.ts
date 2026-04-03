import type { ReactNode } from "react"

export interface PageTreeRoot {
	name: ReactNode
	children: PageTreeNode[]
}

export type PageTreeNode = PageTreeItem | PageTreeSeparator | PageTreeFolder

export interface PageTreeItem {
	type: "page"
	name: ReactNode
	url: string
	external?: boolean
	description?: ReactNode
	icon?: ReactNode
}

export interface PageTreeSeparator {
	type: "separator"
	name?: ReactNode
	icon?: ReactNode
}

export interface PageTreeFolder {
	type: "folder"
	name: ReactNode
	children: PageTreeNode[]
	defaultOpen?: boolean
	description?: ReactNode
	icon?: ReactNode
}
