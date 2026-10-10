import type { Registry } from "../types.js"

export async function handleSearch(
  registry: Registry,
  args: { query?: string; category?: string },
) {
  let items = registry.items

  if (args.category) {
    const cat = args.category.toLowerCase()
    items = items.filter((i) =>
      (i.categories || []).some((c) => c.toLowerCase() === cat),
    )
  }

  if (args.query) {
    const q = args.query.toLowerCase()
    items = items.filter(
      (i) =>
        i.name.includes(q) ||
        (i.title || "").toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        (i.categories || []).some((c) => c.toLowerCase().includes(q)),
    )
  }

  const results = items.map((i) => ({
    name: i.name,
    title: i.title,
    description: i.description,
    categories: i.categories,
    install: `npx substrate-kit add ${i.name}`,
  }))

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(results, null, 2),
      },
    ],
  }
}
