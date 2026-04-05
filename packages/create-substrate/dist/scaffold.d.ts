import { type PackageManager } from "./utils/detect-pm.js";
import { type SurfaceType } from "./surfaces/index.js";
export interface ScaffoldOptions {
    surface: SurfaceType;
    packageManager: PackageManager;
    skipInstall?: boolean;
    skipGit?: boolean;
}
export declare function scaffold(projectName: string, options: ScaffoldOptions): Promise<void>;
//# sourceMappingURL=scaffold.d.ts.map