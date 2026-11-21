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
export async function update(names, options = {}) {
    const root = findProjectRoot(process.cwd());
    if (!root) {
        log.error("No components.json found. Run this from inside your project.");
        process.exit(1);
    }
    const lock = readLock(root);
    if (!lock) {
        log.error(`No ${LOCK_FILE} yet. Run \`substrate-kit doctor --adopt\` first so there is something to compare with.`);
        process.exit(1);
    }
    const unknown = names.filter((name) => !lock.items[name]);
    if (unknown.length > 0) {
        log.error(`Not tracked in ${LOCK_FILE}: ${unknown.join(", ")}`);
        process.exit(1);
    }
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
        log.error("These have local edits or an unknown version, so they were not touched:");
        for (const name of blocked)
            console.log(`  ${name} (${byName.get(name)?.status})`);
        log.info("Update them anyway with `substrate-kit update --force <name>`. Your files are backed up first.");
        process.exit(1);
    }
    const toUpdate = chosen.filter((name) => {
        const status = byName.get(name)?.status;
        return status !== "ok" && status !== "removed" && status !== undefined;
    });
    if (toUpdate.length === 0) {
        log.success("Everything is up to date.");
        return;
    }
    // shadcn also overwrites an item's dependencies, so look at the whole group
    const group = await collectItems(toUpdate);
    const protectedDeps = [...group.keys()].filter((name) => {
        const status = byName.get(name)?.status;
        return !toUpdate.includes(name) && status !== undefined && !SAFE.has(status) && status !== "ok";
    });
    console.log();
    console.log(`  Updating: ${toUpdate.join(", ")}`);
    if (protectedDeps.length > 0) {
        console.log(`  Keeping your versions of: ${protectedDeps.join(", ")}`);
    }
    if (options.dryRun) {
        log.info("Dry run: nothing was changed.");
        return;
    }
    // Back up anything that differs from what we wrote, before it is replaced
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backups = [];
    for (const name of toUpdate) {
        const report = byName.get(name);
        if (!report || SAFE.has(report.status))
            continue;
        for (const target of targetsOf(group.get(name))) {
            const path = installedPath(root, target);
            if (path && existsSync(path))
                backups.push(backupFile(root, path, stamp));
        }
    }
    const snapshot = snapshotSources(root);
    const updating = toUpdate.map((name) => group.get(name));
    try {
        shadcnAdd(toUpdate.map((name) => `${REGISTRY_BASE}/${name}`), { cwd: root, overwrite: true, yes: true }, (attempt) => log.warn(`Update failed (attempt ${attempt}), retrying...`));
    }
    catch {
        restoreUnlessAllowed(snapshot, new Set());
        log.error("Update failed. Your files were put back as they were.");
        process.exit(1);
    }
    // Anything shadcn rewrote beyond the items we meant to update goes back
    const keep = allowedPaths(root, updating);
    const restored = restoreUnlessAllowed(snapshot, keep);
    for (const item of updating)
        recordInstalled(root, lock, item, itemHash(item));
    writeLock(root, lock);
    log.success(`Updated ${updating.length} component${updating.length === 1 ? "" : "s"}.`);
    if (restored.length > 0) {
        log.info(`Kept your version of ${restored.length} other file${restored.length === 1 ? "" : "s"} that shadcn would have overwritten.`);
    }
    if (backups.length > 0) {
        ignoreBackups(root);
        log.info(`Backed up ${backups.length} edited file${backups.length === 1 ? "" : "s"} to ${join(".substrate", "backup", stamp)}`);
    }
}
//# sourceMappingURL=update.js.map