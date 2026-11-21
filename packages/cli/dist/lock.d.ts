import { type ItemDetail } from "./registry.js";
export declare const LOCK_FILE = "substrate.lock.json";
export declare const BACKUP_DIR: string;
export interface LockEntry {
    /** Hash of the registry content at install, or null when that is not known */
    registryHash: string | null;
    /** Hash of each installed file as written, keyed by target */
    files: Record<string, string>;
}
export interface Lock {
    version: 1;
    registry: string;
    items: Record<string, LockEntry>;
}
export declare function hashText(text: string | Buffer): string;
/** A hash of everything an item would write, so any change to it changes the hash */
export declare function itemHash(item: ItemDetail): string;
export declare function installedPath(root: string, target: string): string | null;
export declare function hashInstalled(root: string, target: string): string | null;
export declare function readLock(root: string): Lock | null;
export declare function writeLock(root: string, lock: Lock): void;
export declare function emptyLock(): Lock;
declare function targetsOf(item: ItemDetail): string[];
/** What is on disk now for an item's files; null for a file that is missing */
export declare function currentFileHashes(root: string, item: ItemDetail): Record<string, string | null>;
/** Record an item as installed from the registry as it is now */
export declare function recordInstalled(root: string, lock: Lock, item: ItemDetail, registryHash: string | null): boolean;
/** The project's source files that an install could overwrite, with their contents */
export declare function snapshotSources(root: string): Map<string, Buffer>;
/**
 * Put back every file in the snapshot that changed and is not in `allowed`.
 * shadcn overwrites an item's dependencies too, including base components you
 * may have customised; only the items being updated should change.
 */
export declare function restoreUnlessAllowed(snapshot: Map<string, Buffer>, allowed: Set<string>): string[];
export declare function backupFile(root: string, path: string, stamp: string): string;
export declare function allowedPaths(root: string, items: Iterable<ItemDetail>): Set<string>;
export { targetsOf };
export declare function hashesBefore(root: string, items: Map<string, ItemDetail>): Map<string, Record<string, string | null>>;
/**
 * After an install, note each item. One that was not there before, or whose
 * files changed, came from the registry as it is now. One that was already
 * there and left alone (shadcn keeps differing files) has an unknown version,
 * unless we already tracked it.
 */
export declare function recordAfterInstall(root: string, items: Map<string, ItemDetail>, before: Map<string, Record<string, string | null>>): number;
//# sourceMappingURL=lock.d.ts.map