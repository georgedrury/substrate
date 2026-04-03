import type { ReactNode } from "react"
import { source } from "@/lib/source"
import { DocsSidebar } from "@/components/docs/sidebar"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Layout({ children }: { children: ReactNode }) {
	const flags = new Map<string, string>()
	for (const page of source.getPages()) {
		const flag = (page.data as { flag?: string }).flag
		if (flag) flags.set(page.url, flag)
	}

	return (
		<SidebarProvider>
			<DocsSidebar tree={source.pageTree} title="Substrate" flags={flags} />
			<SidebarInset>
				<header className="md:hidden sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
					<SidebarTrigger />
				</header>
				<main className="flex-1 p-12 overflow-x-clip">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
