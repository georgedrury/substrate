import { readFile } from "fs/promises"
import path from "path"

import { Index } from "@/registry/examples/__index__"
import { ComponentPreviewClient } from "@/components/docs/component-preview-client"

/**
 * Rewrite internal registry paths to consumer-facing paths.
 * e.g. @/registry/substrate/components/surface → @/components/substrate/surface
 *      @/registry/substrate/stores/animation-store → @/stores/animation-store
 *      @/registry/substrate/lib/easing → @/lib/easing
 */
function fixImport(source: string): string {
	return source
		.replace(/@\/registry\/substrate\/components\//g, "@/components/substrate/")
		.replace(/@\/registry\/substrate\/stores\//g, "@/stores/")
		.replace(/@\/registry\/substrate\/lib\//g, "@/lib/")
}

export async function ComponentPreview({
	name,
	background,
}: { name: string } & React.ComponentProps<typeof ComponentPreviewClient>) {
	const entry = Index[name]

	if (!entry) {
		return (
			<p className="text-sm text-muted-foreground">
				Example{" "}
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
					{name}
				</code>{" "}
				not found in registry.
			</p>
		)
	}

	const rawSource = await readFile(
		path.join(process.cwd(), entry.filePath),
		"utf-8",
	)
	const source = fixImport(rawSource)
	const Component = entry.component

	return (
		<ComponentPreviewClient background={background} source={source}>
			<Component />
		</ComponentPreviewClient>
	)
}
