import { execSync } from "node:child_process"
import type { Registry } from "../types.js"

const REGISTRY_BASE = "https://substrate.vui.run/r"

export async function handleInstall(
  registry: Registry,
  args: { components: string[] },
) {
  const results: Array<{ name: string; status: string; error?: string }> = []

  for (const name of args.components) {
    const item = registry.items.find((i) => i.name === name)
    if (!item) {
      results.push({ name, status: "not_found", error: `Component "${name}" not in registry` })
      continue
    }

    const url = `${REGISTRY_BASE}/${name}`
    try {
      execSync(`npx shadcn@latest add ${url}`, {
        encoding: "utf-8",
        stdio: "pipe",
      })
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
