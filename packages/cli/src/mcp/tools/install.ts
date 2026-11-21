import type { Registry } from "../../registry.js"
import { installAndRecord } from "../../install.js"
import { findProjectRoot } from "../../commands/doctor.js"

export async function handleInstall(
	registry: Registry,
	args: { components: string[] },
) {
	const known = new Set(registry.items.map((i) => i.name))
	const unknown = args.components.filter((name) => !known.has(name))
	const valid = args.components.filter((name) => known.has(name))

	const results: Array<{ name: string; status: string; error?: string }> = unknown.map((name) => ({
		name,
		status: "not_found",
		error: `Component "${name}" not in registry`,
	}))

	if (valid.length > 0) {
		const root = findProjectRoot(process.cwd())
		if (!root) {
			const error = "No components.json found. Run `npx @substrate-kit/cli init` in the project first."
			for (const name of valid) results.push({ name, status: "failed", error })
			return {
				content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
				isError: true,
			}
		}
		try {
			await installAndRecord(root, valid, { silent: true })
			for (const name of valid) results.push({ name, status: "installed" })
		} catch (err) {
			const error = err instanceof Error ? err.message : String(err)
			for (const name of valid) results.push({ name, status: "failed", error })
		}
	}

	return {
		content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
		isError: results.some((r) => r.status !== "installed"),
	}
}
