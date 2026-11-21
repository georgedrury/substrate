import { type RetryHandler } from "./utils/shadcn.js";
export interface InstallOptions {
    /** Capture shadcn's output instead of printing it (used by the MCP server) */
    silent?: boolean;
    yes?: boolean;
    onRetry?: RetryHandler;
}
/**
 * Install components with shadcn and record them in substrate.lock.json.
 * Throws if the install fails. Recording is best effort: if the registry can't
 * be read to work out what was written, the install still stands.
 */
export declare function installAndRecord(root: string, components: string[], options?: InstallOptions): Promise<{
    recorded: number;
}>;
//# sourceMappingURL=install.d.ts.map