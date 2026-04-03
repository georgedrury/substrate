export async function handleGetComponent(registry, args) {
    const item = registry.items.find((i) => i.name.toLowerCase() === args.name.toLowerCase());
    if (!item) {
        return {
            content: [
                {
                    type: "text",
                    text: `Component "${args.name}" not found. Available: ${registry.items.map((i) => i.name).join(", ")}`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(item, null, 2),
            },
        ],
    };
}
//# sourceMappingURL=get-component.js.map