import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { PACKAGE_ROOT } from "./utils/version.js"

export const SITE_URL = "https://substrate.georgedrury.co.uk"

// SUBSTRATE_REGISTRY_URL points installs at a local registry for testing
export const REGISTRY_BASE = process.env.SUBSTRATE_REGISTRY_URL ?? `${SITE_URL}/r`

const REGISTRY_URL = `${SITE_URL}/registry.json`
const FETCH_TIMEOUT_MS = 5000

export interface RegistryItem {
	name: string
	type: string
	title?: string
	description?: string
	author?: string
	categories?: string[]
	dependencies?: string[]
	registryDependencies?: string[]
	meta?: {
		example?: string
		lineage?: Array<{ name: string; href?: string }>
	}
	cssVars?: {
		theme?: Record<string, string>
		light?: Record<string, string>
		dark?: Record<string, string>
	}
	files?: Array<{ path: string; type: string; target: string }>
}

export interface Registry {
	items: RegistryItem[]
}

// The live registry is the newest; the copy bundled with the package keeps
// the CLI working offline. A registry.json in the current folder is never
// read, since it could belong to an unrelated project.
export async function loadRegistry(): Promise<Registry> {
	try {
		const res = await fetch(REGISTRY_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
		if (res.ok) return (await res.json()) as Registry
	} catch {
		/* fall through to the bundled copy */
	}

	const bundled = join(PACKAGE_ROOT, "registry.json")
	if (existsSync(bundled)) {
		try {
			return JSON.parse(readFileSync(bundled, "utf-8")) as Registry
		} catch {
			/* fall through */
		}
	}

	throw new Error("Could not load the Substrate registry")
}

export function overrideKeys(item: RegistryItem): string[] {
	const keys: string[] = []
	for (const value of Object.values(item.cssVars?.theme ?? {})) {
		const match = value.match(/^var\(--([^,)]+)/)
		if (match) keys.push(`--${match[1]}`)
	}
	return keys
}

export function matchesQuery(item: RegistryItem, query: string): boolean {
	const q = query.toLowerCase()
	return (
		item.name.includes(q) ||
		(item.title ?? "").toLowerCase().includes(q) ||
		(item.description ?? "").toLowerCase().includes(q) ||
		(item.categories ?? []).some((c) => c.toLowerCase().includes(q))
	)
}
