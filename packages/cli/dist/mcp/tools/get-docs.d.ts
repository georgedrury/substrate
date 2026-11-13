import type { Registry } from "../../registry.js";
export declare function handleGetDocs(registry: Registry, args: {
    name: string;
}): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: undefined;
}>;
//# sourceMappingURL=get-docs.d.ts.map