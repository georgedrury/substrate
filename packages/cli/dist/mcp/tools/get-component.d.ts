import type { Registry } from "../types.js";
export declare function handleGetComponent(registry: Registry, args: {
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
//# sourceMappingURL=get-component.d.ts.map