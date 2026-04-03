import { readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { Registry } from "./types.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REGISTRY_URL = "https://substrate.georgedrury.co.uk/registry.json"

export async function loadRegistry(): Promise<Registry> {
	// Try local
	const localPath = join(process.cwd(), "registry.json")
	if (existsSync(localPath)) {
		try {
			return JSON.parse(readFileSync(localPath, "utf-8"))
		} catch {
			/* fall through */
		}
	}

	// Try remote
	try {
		const res = await fetch(REGISTRY_URL)
		if (res.ok) return (await res.json()) as Registry
	} catch {
		/* fall through */
	}

	// Try bundled
	const bundledPaths = [
		join(__dirname, "..", "..", "registry.json"),
		join(__dirname, "..", "..", "..", "registry.json"),
	]
	for (const p of bundledPaths) {
		if (existsSync(p)) {
			try {
				return JSON.parse(readFileSync(p, "utf-8"))
			} catch {
				/* fall through */
			}
		}
	}

	throw new Error("Could not load Substrate registry")
}
