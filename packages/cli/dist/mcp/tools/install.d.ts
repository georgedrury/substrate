import type { Registry } from "../../registry.js";
export declare function handleInstall(registry: Registry, args: {
    components: string[];
}): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
}>;
//# sourceMappingURL=install.d.ts.map