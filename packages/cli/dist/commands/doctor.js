import { dirname, join } from "node:path";
import { exists } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { fetchItem, loadRegistry } from "../registry.js";
import { LOCK_FILE, currentFileHashes, emptyLock, itemHash, readLock, recordInstalled, writeLock, } from "../lock.js";
export function findProjectRoot(from) {
    let dir = from;
    for (;;) {
        if (exists(join(dir, "components.json")))
            return dir;
        const parent = dirname(dir);
        if (parent === dir)
            return null;
        dir = parent;
    }
}
/** Compare every locked item with what is on disk and what the registry has now */
export function assess(root, lock, current) {
    const reports = [];
    for (const [name, entry] of Object.entries(lock.items)) {
        const detail = current.get(name) ?? null;
        const now = detail ? currentFileHashes(root, detail) : null;
        const changedFiles = Object.entries(entry.files)
            .filter(([target, recorded]) => (now ? now[target] : null) !== recorded)
            .map(([target]) => target);
        let status;
        if (!detail)
            status = "removed";
        else if (Object.values(now ?? {}).every((hash) => hash === null))
            status = "missing";
        else if (entry.registryHash === null)
            status = "unknown";
        else {
            const behind = entry.registryHash !== itemHash(detail);
            const modified = changedFiles.length > 0;
            status = behind && modified ? "behind+modified" : behind ? "behind" : modified ? "modified" : "ok";
        }
        reports.push({ name, status, changedFiles });
    }
    return reports;
}
export async function fetchCurrent(names) {
    const out = new Map();
    await Promise.all(names.map(async (name) => {
        try {
            out.set(name, await fetchItem(name));
        }
        catch {
            out.set(name, null);
        }
    }));
    return out;
}
// Record the Substrate files already in a project. With `current`, they are
// taken to match the registry as it is now, which is true straight after an
// install; without it their version is unknown, because we can't tell.
async function adopt(root, current) {
    const registry = await loadRegistry();
    // An item that can't be fetched is skipped rather than failing the whole adoption
    const details = await fetchCurrent(registry.items.map((item) => item.name));
    const lock = readLock(root) ?? emptyLock();
    let added = 0;
    for (const item of details.values()) {
        if (!item || lock.items[item.name])
            continue;
        if (recordInstalled(root, lock, item, current ? itemHash(item) : null))
            added++;
    }
    writeLock(root, lock);
    return added;
}
/** The state of every tracked component, without printing anything */
export async function buildReport(root) {
    const lock = readLock(root);
    if (!lock)
        return { tracked: false };
    const names = Object.keys(lock.items);
    const current = await fetchCurrent(names);
    const reachable = names.length === 0 || [...current.values()].some((detail) => detail !== null);
    return { tracked: true, reachable, items: assess(root, lock, current) };
}
const LABEL = {
    ok: "up to date",
    behind: "behind the registry",
    modified: "edited locally",
    "behind+modified": "behind the registry and edited locally",
    unknown: "version unknown",
    missing: "files missing",
    removed: "no longer in the registry",
};
export async function doctor(options = {}) {
    const root = findProjectRoot(process.cwd());
    if (!root) {
        log.error("No components.json found. Run this from inside your project.");
        process.exit(1);
    }
    if (options.adopt) {
        let added;
        try {
            added = await adopt(root, options.current === true);
        }
        catch {
            log.error("Could not load the Substrate registry. Check your network connection.");
            process.exit(1);
        }
        log.success(`Recorded ${added} Substrate component${added === 1 ? "" : "s"} in ${LOCK_FILE}` +
            (options.current ? "" : " (versions unknown; `substrate-kit update --force` refreshes them)"));
        return;
    }
    const lock = readLock(root);
    if (!lock) {
        log.warn(`No ${LOCK_FILE} yet. Components added with an older CLI aren't tracked.`);
        log.info("Run `substrate-kit doctor --adopt` to start tracking the Substrate files already in this project.");
        return;
    }
    const names = Object.keys(lock.items);
    const current = await fetchCurrent(names);
    if ([...current.values()].every((detail) => detail === null) && names.length > 0) {
        log.error("Could not load the Substrate registry. Check your network connection.");
        process.exit(1);
    }
    const reports = assess(root, lock, current);
    if (options.json) {
        console.log(JSON.stringify({ root, items: reports }, null, 2));
    }
    else {
        const attention = reports.filter((report) => report.status !== "ok");
        log.title("Substrate components");
        console.log(`  ${reports.length - attention.length} of ${reports.length} up to date`);
        console.log();
        for (const report of attention) {
            console.log(`  ${report.name}: ${LABEL[report.status]}`);
            for (const file of report.changedFiles)
                console.log(`    changed: ${file}`);
        }
        if (attention.length > 0) {
            console.log();
            const behind = attention.some((r) => r.status === "behind");
            if (behind)
                log.info("`substrate-kit update` updates the ones behind the registry.");
            if (attention.some((r) => ["modified", "behind+modified", "unknown"].includes(r.status))) {
                log.info("Edited or unknown-version components are only replaced by `substrate-kit update --force`, which backs them up first.");
            }
        }
    }
    if (options.check && reports.some((report) => report.status !== "ok"))
        process.exitCode = 1;
}
//# sourceMappingURL=doctor.js.map