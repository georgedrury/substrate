import type { Registry } from "../types.js"
import { shadcnAdd } from "../../utils/shadcn.js"

// SUBSTRATE_REGISTRY_URL points installs at a local registry for testing
const REGISTRY_BASE =
	process.env.SUBSTRATE_REGISTRY_URL ?? "https://substrate.georgedrury.co.uk/r"

export async function handleInstall(
	registry: Registry,
	args: { components: string[] },
) {
	const results: Array<{ name: string; status: string; error?: string }> = []

	for (const name of args.components) {
		const item = registry.items.find((i) => i.name === name)
		if (!item) {
			results.push({
				name,
				status: "not_found",
				error: `Component "${name}" not in registry`,
			})
			continue
		}

		const url = `${REGISTRY_BASE}/${name}`
		try {
			shadcnAdd(url, { silent: true })
			results.push({ name, status: "installed" })
		} catch (err) {
			results.push({
				name,
				status: "failed",
				error: err instanceof Error ? err.message : String(err),
			})
		}
	}

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(results, null, 2),
			},
		],
	}
}
