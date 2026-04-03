import type { Registry } from "../types.js";
export declare function handleSearch(registry: Registry, args: {
    query?: string;
    category?: string;
}): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=search.d.ts.map