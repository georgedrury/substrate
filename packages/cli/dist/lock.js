import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync, copyFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { REGISTRY_BASE } from "./registry.js";
// substrate.lock.json records, for each installed Substrate item, a hash of
// the registry content it was installed from and of the file as written. shadcn
// rewrites files on install, so an installed file never matches the registry
// byte for byte; hashes taken at install time are what let us tell "the
// registry moved on" apart from "you edited this".
export const LOCK_FILE = "substrate.lock.json";
export const BACKUP_DIR = join(".substrate", "backup");
export function hashText(text) {
    return createHash("sha256").update(text).digest("hex").slice(0, 16);
}
/** A hash of everything an item would write, so any change to it changes the hash */
export function itemHash(item) {
    const parts = item.files
        .filter((file) => file.target)
        .map((file) => `${file.target}\n${file.content ?? ""}`)
        .sort();
    return hashText(parts.join("\n--\n"));
}
// Targets are relative to the source folder: src/ when the project has one
export function installedPath(root, target) {
    const candidates = existsSync(join(root, "src"))
        ? [join(root, "src", target), join(root, target)]
        : [join(root, target), join(root, "src", target)];
    return candidates.find((path) => existsSync(path)) ?? null;
}
export function hashInstalled(root, target) {
    const path = installedPath(root, target);
    return path ? hashText(readFileSync(path)) : null;
}
export function readLock(root) {
    const path = join(root, LOCK_FILE);
    if (!existsSync(path))
        return null;
    try {
        const parsed = JSON.parse(readFileSync(path, "utf-8"));
        return parsed.version === 1 && parsed.items ? parsed : null;
    }
    catch {
        return null;
    }
}
export function writeLock(root, lock) {
    const sorted = {
        ...lock,
        items: Object.fromEntries(Object.entries(lock.items).sort(([a], [b]) => a.localeCompare(b))),
    };
    writeFileSync(join(root, LOCK_FILE), JSON.stringify(sorted, null, 2) + "\n");
}
export function emptyLock() {
    return { version: 1, registry: REGISTRY_BASE, items: {} };
}
function targetsOf(item) {
    return item.files.flatMap((file) => (file.target ? [file.target] : []));
}
/** What is on disk now for an item's files; null for a file that is missing */
export function currentFileHashes(root, item) {
    return Object.fromEntries(targetsOf(item).map((target) => [target, hashInstalled(root, target)]));
}
/** Record an item as installed from the registry as it is now */
export function recordInstalled(root, lock, item, registryHash) {
    const files = {};
    for (const [target, hash] of Object.entries(currentFileHashes(root, item))) {
        if (hash === null)
            return false;
        files[target] = hash;
    }
    if (Object.keys(files).length === 0)
        return false;
    lock.items[item.name] = { registryHash, files };
    return true;
}
// ── Protecting files an update must not touch ──
const TRACKED_DIRS = ["components", "hooks", "lib", "stores"];
function walk(dir, out) {
    if (!existsSync(dir))
        return;
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory())
            walk(path, out);
        else
            out.push(path);
    }
}
/** The project's source files that an install could overwrite, with their contents */
export function snapshotSources(root) {
    const files = [];
    for (const base of [root, join(root, "src")]) {
        for (const dir of TRACKED_DIRS)
            walk(join(base, dir), files);
    }
    return new Map(files.map((file) => [file, readFileSync(file)]));
}
/**
 * Put back every file in the snapshot that changed and is not in `allowed`.
 * shadcn overwrites an item's dependencies too, including base components you
 * may have customised; only the items being updated should change.
 */
export function restoreUnlessAllowed(snapshot, allowed) {
    const restored = [];
    for (const [path, before] of snapshot) {
        if (allowed.has(path))
            continue;
        const now = existsSync(path) ? readFileSync(path) : null;
        if (now === null || !now.equals(before)) {
            mkdirSync(dirname(path), { recursive: true });
            writeFileSync(path, before);
            restored.push(path);
        }
    }
    return restored;
}
export function backupFile(root, path, stamp) {
    const dest = join(root, BACKUP_DIR, stamp, relative(root, path));
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(path, dest);
    return relative(root, dest);
}
export function allowedPaths(root, items) {
    const allowed = new Set();
    for (const item of items) {
        for (const target of targetsOf(item)) {
            for (const base of [root, join(root, "src")])
                allowed.add(join(base, target));
        }
    }
    return allowed;
}
export { targetsOf };
// ── Recording what `add` installed ──
export function hashesBefore(root, items) {
    return new Map([...items].map(([name, item]) => [name, currentFileHashes(root, item)]));
}
/**
 * After an install, note each item. One that was not there before, or whose
 * files changed, came from the registry as it is now. One that was already
 * there and left alone (shadcn keeps differing files) has an unknown version,
 * unless we already tracked it.
 */
export function recordAfterInstall(root, items, before) {
    const lock = readLock(root) ?? emptyLock();
    let recorded = 0;
    for (const [name, item] of items) {
        const was = before.get(name) ?? {};
        const now = currentFileHashes(root, item);
        const written = Object.entries(now).some(([target, hash]) => hash !== null && was[target] !== hash);
        const existing = lock.items[name];
        if (written) {
            if (recordInstalled(root, lock, item, itemHash(item)))
                recorded++;
        }
        else if (!existing) {
            if (recordInstalled(root, lock, item, null))
                recorded++;
        }
    }
    writeLock(root, lock);
    return recorded;
}
//# sourceMappingURL=lock.js.map