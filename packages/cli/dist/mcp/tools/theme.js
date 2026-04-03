function extractOverrideKeys(item) {
    const theme = item.cssVars?.theme;
    if (!theme)
        return [];
    const keys = [];
    for (const value of Object.values(theme)) {
        const match = value.match(/^var\(--([^,)]+)/);
        if (match)
            keys.push(`--${match[1]}`);
    }
    return keys;
}
export async function handleGetThemeVariables(registry, args) {
    let items = registry.items;
    if (args.components && args.components.length > 0) {
        const names = new Set(args.components.map((n) => n.toLowerCase()));
        items = items.filter((i) => names.has(i.name.toLowerCase()));
    }
    const result = {};
    for (const item of items) {
        if (!item.cssVars)
            continue;
        result[item.name] = {
            cssVars: item.cssVars,
            overrideKeys: extractOverrideKeys(item),
        };
    }
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
//# sourceMappingURL=theme.js.map