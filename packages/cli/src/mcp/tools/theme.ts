import type { Registry, RegistryItem } from "../types.js"

function extractOverrideKeys(item: RegistryItem): string[] {
  const theme = item.cssVars?.theme
  if (!theme) return []
  const keys: string[] = []
  for (const value of Object.values(theme)) {
    const match = value.match(/^var\(--([^,)]+)/)
    if (match) keys.push(`--${match[1]}`)
  }
  return keys
}

export async function handleGetThemeVariables(
  registry: Registry,
  args: { components?: string[] },
) {
  let items = registry.items

  if (args.components && args.components.length > 0) {
    const names = new Set(args.components.map((n) => n.toLowerCase()))
    items = items.filter((i) => names.has(i.name.toLowerCase()))
  }

  const result: Record<string, { cssVars: typeof items[0]["cssVars"]; overrideKeys: string[] }> = {}

  for (const item of items) {
    if (!item.cssVars) continue
    result[item.name] = {
      cssVars: item.cssVars,
      overrideKeys: extractOverrideKeys(item),
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  }
}
