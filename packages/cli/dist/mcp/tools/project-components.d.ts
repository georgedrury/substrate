export declare function handleCheckComponents(): Promise<{
    isError?: boolean | undefined;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleUpdateComponents(args: {
    components?: string[];
    dry_run?: boolean;
}): Promise<{
    isError?: boolean | undefined;
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=project-components.d.ts.map