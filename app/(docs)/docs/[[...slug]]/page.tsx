import { source } from "@/lib/source"
import { notFound } from "next/navigation"
import { mdxComponents } from "@/mdx-components"
import { DocsLayout } from "@/components/docs/docs-layout"
import { Breadcrumb } from "@/components/docs/breadcrumb"
import { Pager } from "@/components/docs/pager"
import { TOC } from "@/components/docs/toc"
import DocsHeader from "@/components/docs/docs-header"

interface PageProps {
	params: Promise<{ slug?: string[] }>
}

export default async function Page(props: PageProps) {
	const params = await props.params
	const page = source.getPage(params.slug)

	if (!page) {
		notFound()
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = page.data as any

	const MDX = data.body

	return (
		<div>
			{data.toc && data.toc.length > 0 && (
				<div className="mb-8 xl:hidden">
					<TOC items={data.toc} />
				</div>
			)}
			<DocsLayout toc={data.toc} wide={data.wide}>
				<Breadcrumb url={page.url} className="mb-4" />
				<DocsHeader title={data.title} description={data.description} updated={data.updated} />
				<div className="border-t-[1px] border-t-border/50 pt-6">
					{MDX && <MDX components={mdxComponents} />}
				</div>
				<Pager tree={source.pageTree} url={page.url} />
			</DocsLayout>
		</div>
	)
}

export async function generateStaticParams() {
	return source.generateParams()
}

export async function generateMetadata(props: PageProps) {
	const params = await props.params
	const page = source.getPage(params.slug)

	if (!page) {
		notFound()
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = page.data as any

	return {
		title: data.title,
		description: data.description,
	}
}
