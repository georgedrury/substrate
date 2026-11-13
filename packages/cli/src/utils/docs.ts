import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { SITE_URL } from "../registry.js"
import { PACKAGE_ROOT } from "./version.js"

// Docs pages are copied into the package at publish time (see
// scripts/bundle-cli-assets.mjs), one folder per section of the docs site.
const DOCS_DIR = join(PACKAGE_ROOT, "docs")

export interface DocsPage {
	url: string
	content: string
}

export function findDocsPage(name: string): DocsPage | null {
	if (!/^[a-z0-9-]+$/.test(name) || !existsSync(DOCS_DIR)) return null
	for (const section of readdirSync(DOCS_DIR, { withFileTypes: true })) {
		if (!section.isDirectory()) continue
		const file = join(DOCS_DIR, section.name, `${name}.mdx`)
		if (existsSync(file)) {
			return {
				url: `${SITE_URL}/docs/${section.name}/${name}`,
				content: readFileSync(file, "utf-8"),
			}
		}
	}
	return null
}

// Hooks and utilities live under their own sections of the docs site
export function docsUrl(name: string): string {
	return findDocsPage(name)?.url ?? `${SITE_URL}/docs/components/${name}`
}
