import { type PackageManager } from "../utils/detect-pm.js";
export interface CreateOptions {
    surface?: string;
    skipInstall?: boolean;
    skipGit?: boolean;
    packageManager?: PackageManager;
}
export declare function create(projectName: string, options?: CreateOptions): Promise<void>;
//# sourceMappingURL=create.d.ts.map