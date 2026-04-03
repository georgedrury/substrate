export interface ExecOptions {
    cwd?: string;
    silent?: boolean;
}
export declare function exec(command: string, options?: ExecOptions): string;
export declare function execSilent(command: string, cwd?: string): string | null;
//# sourceMappingURL=shell.d.ts.map