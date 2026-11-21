import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { log } from "../utils/logger.js";
import { shadcnAdd } from "../utils/shadcn.js";
import { REGISTRY_BASE, collectItems } from "../registry.js";
import { LOCK_FILE, allowedPaths, backupFile, installedPath, itemHash, readLock, recordInstalled, restoreUnlessAllowed, snapshotSources, targetsOf, writeLock, } from "../lock.js";
import { assess, fetchCurrent, findProjectRoot } from "./doctor.js";
const SAFE = new Set(["behind"]);
// Backups are for you to look at, not to commit
function ignoreBackups(root) {
    const path = join(root, ".gitignore");
    if (!existsSync(path))
        return;
    const current = readFileSync(path, "utf-8");
    if (/^\/?\.substrate\/?$/m.test(current))
        return;
    appendFileSync(path, `${current.endsWith("\n") ? "" : "\n"}.substrate/\n`);
}
/**
 * Update tracked components. Without names, that is everything simply behind.
 * Edited components, and ones of unknown version, are only replaced with
 * `force`, and are backed up first. Prints nothing and never exits, so the CLI
 * and the MCP server can both use it.
 */
export async function runUpdate(root, names, options = {}) {
    const lock = readLock(root);
    if (!lock)
        return { kind: "no-lock" };
    const untracked = names.filter((name) => !lock.items[name]);
    if (untracked.length > 0)
        return { kind: "untracked", names: untracked };
    const current = await fetchCurrent(Object.keys(lock.items));
    const reports = assess(root, lock, current);
    const byName = new Map(reports.map((report) => [report.name, report]));
    // With names, update exactly those; without, everything that is simply behind
    const chosen = names.length > 0 ? names : reports.filter((r) => SAFE.has(r.status)).map((r) => r.name);
    const blocked = chosen.filter((name) => {
        const status = byName.get(name)?.status;
        return status !== undefined && !SAFE.has(status) && status !== "ok" && !options.force;
    });
    if (blocked.length > 0) {
        return { kind: "blocked", items: blocked.map((name) => ({ name, status: byName.get(name)?.status ?? "unknown" })) };
    }
    const toUpdate = chosen.filter((name) => {
        const status = byName.get(name)?.status;
        return status !== "ok" && status !== "removed" && status !== undefined;
    });
    if (toUpdate.length === 0)
        return { kind: "up-to-date" };
    // shadcn also overwrites an item's dependencies, so look at the whole group
    const group = await collectItems(toUpdate);
    const keeping = [...group.keys()].filter((name) => {
        const status = byName.get(name)?.status;
        return !toUpdate.includes(name) && status !== undefined && !SAFE.has(status) && status !== "ok";
    });
    if (options.dryRun)
        return { kind: "dry-run", toUpdate, keeping };
    // Back up anything that differs from what we wrote, before it is replaced
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    let backups = 0;
    for (const name of toUpdate) {
        const report = byName.get(name);
        if (!report || SAFE.has(report.status))
            continue;
        for (const target of targetsOf(group.get(name))) {
            const path = installedPath(root, target);
            if (path && existsSync(path)) {
                backupFile(root, path, stamp);
                backups++;
            }
        }
    }
    const snapshot = snapshotSources(root);
    const updating = toUpdate.map((name) => group.get(name));
    try {
        shadcnAdd(toUpdate.map((name) => `${REGISTRY_BASE}/${name}`), { cwd: root, overwrite: true, yes: true, silent: options.silent }, options.onRetry);
    }
    catch {
        restoreUnlessAllowed(snapshot, new Set());
        return { kind: "failed" };
    }
    // Anything shadcn rewrote beyond the items we meant to update goes back
    const restored = restoreUnlessAllowed(snapshot, allowedPaths(root, updating));
    for (const item of updating)
        recordInstalled(root, lock, item, itemHash(item));
    writeLock(root, lock);
    if (backups > 0)
        ignoreBackups(root);
    return {
        kind: "updated",
        updated: toUpdate,
        keeping,
        restored: restored.length,
        backups,
        backupDir: backups > 0 ? join(".substrate", "backup", stamp) : null,
    };
}
export async function update(names, options = {}) {
    const root = findProjectRoot(process.cwd());
    if (!root) {
        log.error("No components.json found. Run this from inside your project.");
        process.exit(1);
    }
    const result = await runUpdate(root, names, {
        ...options,
        onRetry: (attempt) => log.warn(`Update failed (attempt ${attempt}), retrying...`),
    });
    switch (result.kind) {
        case "no-lock":
            log.error(`No ${LOCK_FILE} yet. Run \`substrate-kit doctor --adopt\` first so there is something to compare with.`);
            process.exit(1);
        case "untracked":
            log.error(`Not tracked in ${LOCK_FILE}: ${result.names.join(", ")}`);
            process.exit(1);
        case "blocked":
            log.error("These have local edits or an unknown version, so they were not touched:");
            for (const item of result.items)
                console.log(`  ${item.name} (${item.status})`);
            log.info("Update them anyway with `substrate-kit update --force <name>`. Your files are backed up first.");
            process.exit(1);
        case "up-to-date":
            log.success("Everything is up to date.");
            return;
        case "dry-run":
            console.log();
            console.log(`  Updating: ${result.toUpdate.join(", ")}`);
            if (result.keeping.length > 0)
                console.log(`  Keeping your versions of: ${result.keeping.join(", ")}`);
            log.info("Dry run: nothing was changed.");
            return;
        case "failed":
            log.error("Update failed. Your files were put back as they were.");
            process.exit(1);
        case "updated":
            console.log();
            console.log(`  Updated: ${result.updated.join(", ")}`);
            if (result.keeping.length > 0)
                console.log(`  Kept your versions of: ${result.keeping.join(", ")}`);
            log.success(`Updated ${result.updated.length} component${result.updated.length === 1 ? "" : "s"}.`);
            if (result.restored > 0) {
                log.info(`Kept your version of ${result.restored} other file${result.restored === 1 ? "" : "s"} that shadcn would have overwritten.`);
            }
            if (result.backupDir) {
                log.info(`Backed up ${result.backups} edited file${result.backups === 1 ? "" : "s"} to ${result.backupDir}`);
            }
    }
}
//# sourceMappingURL=update.js.map