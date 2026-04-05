export type SurfaceType = "canvas-2d" | "3d-scene" | "animation" | "node-editor" | "data-vis" | "image-gen" | "blank";
export interface SurfaceOption {
    value: SurfaceType;
    label: string;
    description: string;
}
export declare const SURFACE_OPTIONS: SurfaceOption[];
export interface SurfaceConfig {
    /** Registry components to install via shadcn */
    components: string[];
    /** Additional npm dependencies beyond the base */
    extraDeps?: Record<string, string>;
    /** Additional npm devDependencies */
    extraDevDeps?: Record<string, string>;
    /** Extra CSS variable block appended to globals.css */
    cssVars?: string;
    /** The main App.tsx content */
    app: () => string;
    /** Additional files to write (path relative to project root → content) */
    files?: Record<string, () => string>;
}
//# sourceMappingURL=types.d.ts.map