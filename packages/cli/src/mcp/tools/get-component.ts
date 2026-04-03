import type { Registry } from "../types.js"

export async function handleGetComponent(
  registry: Registry,
  args: { name: string },
) {
  const item = registry.items.find(
    (i) => i.name.toLowerCase() === args.name.toLowerCase(),
  )

  if (!item) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Component "${args.name}" not found. Available: ${registry.items.map((i) => i.name).join(", ")}`,
        },
      ],
      isError: true,
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(item, null, 2),
      },
    ],
  }
}
