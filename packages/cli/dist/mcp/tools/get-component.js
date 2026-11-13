import { overrideKeys } from "../../registry.js";
import { docsUrl } from "../../utils/docs.js";
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
    // Theme variables ride along so one call answers "how do I restyle this"
    const details = {
        ...item,
        overrideKeys: overrideKeys(item),
        docs: docsUrl(item.name),
        install: `npx substrate-kit add ${item.name}`,
    };
    return {
        content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
    };
}
//# sourceMappingURL=get-component.js.map