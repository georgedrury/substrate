import { findDocsPage } from "../../utils/docs.js";
export async function handleGetDocs(registry, args) {
    const name = args.name.toLowerCase();
    const page = findDocsPage(name);
    if (!page) {
        const known = registry.items.some((i) => i.name === name);
        return {
            content: [
                {
                    type: "text",
                    text: known
                        ? `No docs page is bundled for "${name}". Use get_component for its details.`
                        : `"${args.name}" not found. Use search_components to find a name.`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [{ type: "text", text: `Source: ${page.url}\n\n${page.content}` }],
    };
}
//# sourceMappingURL=get-docs.js.map