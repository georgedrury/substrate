import { type ItemDetail } from "../registry.js";
import { type Lock } from "../lock.js";
export type Status = "ok" | "behind" | "modified" | "behind+modified" | "unknown" | "missing" | "removed";
export interface ItemReport {
    name: string;
    status: Status;
    /** Files that differ from what was written at install (or are gone) */
    changedFiles: string[];
}
export interface DoctorOptions {
    json?: boolean;
    adopt?: boolean;
    current?: boolean;
    check?: boolean;
}
export declare function findProjectRoot(from: string): string | null;
/** Compare every locked item with what is on disk and what the registry has now */
export declare function assess(root: string, lock: Lock, current: Map<string, ItemDetail | null>): ItemReport[];
export declare function fetchCurrent(names: string[]): Promise<Map<string, ItemDetail | null>>;
export type Report = {
    tracked: false;
} | {
    tracked: true;
    reachable: boolean;
    items: ItemReport[];
};
/** The state of every tracked component, without printing anything */
export declare function buildReport(root: string): Promise<Report>;
export declare function doctor(options?: DoctorOptions): Promise<void>;
//# sourceMappingURL=doctor.d.ts.map