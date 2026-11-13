export interface ShadcnAddOptions {
    cwd?: string;
    /** Capture output instead of printing it (used by the MCP server) */
    silent?: boolean;
    /** Pass --yes so shadcn skips its confirmation prompts */
    yes?: boolean;
    /** How many times to try before giving up (default 3) */
    attempts?: number;
}
export type RetryHandler = (attempt: number, error: unknown) => void;
export declare function shadcnAdd(urls: string[], options?: ShadcnAddOptions, onRetry?: RetryHandler): void;
//# sourceMappingURL=shadcn.d.ts.map