export interface UpdateOptions {
    force?: boolean;
    dryRun?: boolean;
}
export type UpdateResult = {
    kind: "no-lock";
} | {
    kind: "untracked";
    names: string[];
} | {
    kind: "blocked";
    items: Array<{
        name: string;
        status: string;
    }>;
} | {
    kind: "up-to-date";
} | {
    kind: "dry-run";
    toUpdate: string[];
    keeping: string[];
} | {
    kind: "failed";
} | {
    kind: "updated";
    updated: string[];
    keeping: string[];
    restored: number;
    backups: number;
    backupDir: string | null;
};
/**
 * Update tracked components. Without names, that is everything simply behind.
 * Edited components, and ones of unknown version, are only replaced with
 * `force`, and are backed up first. Prints nothing and never exits, so the CLI
 * and the MCP server can both use it.
 */
export declare function runUpdate(root: string, names: string[], options?: UpdateOptions & {
    silent?: boolean;
    onRetry?: (attempt: number) => void;
}): Promise<UpdateResult>;
export declare function update(names: string[], options?: UpdateOptions): Promise<void>;
//# sourceMappingURL=update.d.ts.map