export type PackageManager = "npm" | "pnpm" | "bun";
export declare function detectPackageManager(cwd: string): PackageManager;
export declare function getInstallCommand(pm: PackageManager): string;
export declare function getRunCommand(pm: PackageManager, script: string): string;
//# sourceMappingURL=detect-pm.d.ts.map