import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { exists } from "../utils/fs.js";
import { installAndRecord } from "../install.js";
import { log } from "../utils/logger.js";
import { loadRegistry, overrideKeys, } from "../registry.js";
function getCategories(registry) {
    const cats = new Map();
    for (const item of registry.items) {
        for (const cat of item.categories || ["other"]) {
            if (!cats.has(cat))
                cats.set(cat, []);
            cats.get(cat).push(item);
        }
    }
    return cats;
}
async function interactivePicker(registry) {
    const items = registry.items;
    const selected = new Set();
    let cursor = 0;
    let searchQuery = "";
    let mode = "browse";
    function getFiltered() {
        if (!searchQuery)
            return items;
        const q = searchQuery.toLowerCase();
        return items.filter((i) => i.name.includes(q) ||
            (i.title || "").toLowerCase().includes(q) ||
            (i.description || "").toLowerCase().includes(q) ||
            (i.categories || []).some((c) => c.toLowerCase().includes(q)));
    }
    function render() {
        const filtered = getFiltered();
        const pageSize = Math.min(15, process.stdout.rows - 6);
        const start = Math.max(0, cursor - pageSize + 1);
        const end = Math.min(filtered.length, start + pageSize);
        process.stdout.write("\x1B[2J\x1B[H");
        console.log("  Select components to install (space to toggle, enter to confirm, / to search)\n");
        if (searchQuery) {
            console.log(`  Search: ${searchQuery}  (${filtered.length} results)\n`);
        }
        for (let i = start; i < end; i++) {
            const item = filtered[i];
            const originalIdx = items.indexOf(item);
            const isSelected = selected.has(originalIdx);
            const isCursor = i === cursor;
            const marker = isSelected ? "[x]" : "[ ]";
            const pointer = isCursor ? ">" : " ";
            const desc = item.description
                ? ` — ${item.description.slice(0, 50)}${item.description.length > 50 ? "..." : ""}`
                : "";
            console.log(`  ${pointer} ${marker} ${item.name}${desc}`);
        }
        console.log();
        const count = selected.size;
        console.log(`  ${count} selected${count > 0 ? ": " + [...selected].map((i) => items[i].name).join(", ") : ""}`);
    }
    return new Promise((resolve) => {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.resume();
        render();
        process.stdin.on("data", (data) => {
            const key = data.toString();
            const filtered = getFiltered();
            if (mode === "search") {
                if (key === "\r" || key === "\n" || key === "\x1B") {
                    mode = "browse";
                    cursor = 0;
                    render();
                    return;
                }
                if (key === "\x7F" || key === "\b") {
                    searchQuery = searchQuery.slice(0, -1);
                    cursor = 0;
                    render();
                    return;
                }
                if (key.length === 1 && key >= " ") {
                    searchQuery += key;
                    cursor = 0;
                    render();
                    return;
                }
                return;
            }
            if (key === "/" || key === "f") {
                mode = "search";
                searchQuery = "";
                cursor = 0;
                render();
                return;
            }
            if (key === "\x1B[A" || key === "k") {
                cursor = Math.max(0, cursor - 1);
                render();
                return;
            }
            if (key === "\x1B[B" || key === "j") {
                cursor = Math.min(filtered.length - 1, cursor + 1);
                render();
                return;
            }
            if (key === " ") {
                if (filtered.length > 0) {
                    const originalIdx = items.indexOf(filtered[cursor]);
                    if (selected.has(originalIdx)) {
                        selected.delete(originalIdx);
                    }
                    else {
                        selected.add(originalIdx);
                    }
                }
                render();
                return;
            }
            if (key === "\r" || key === "\n") {
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                }
                rl.close();
                process.stdout.write("\x1B[2J\x1B[H");
                resolve([...selected].map((i) => items[i].name));
                return;
            }
            if (key === "q" || key === "\x03") {
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                }
                rl.close();
                process.stdout.write("\x1B[2J\x1B[H");
                resolve([]);
                return;
            }
            if (key === "a") {
                for (const item of filtered) {
                    selected.add(items.indexOf(item));
                }
                render();
                return;
            }
            if (key === "n") {
                selected.clear();
                render();
                return;
            }
        });
    });
}
function printThemeHint(item) {
    const keys = overrideKeys(item);
    if (keys.length === 0)
        return;
    console.log();
    console.log(`  Theme overrides:`);
    for (const key of keys) {
        console.log(`    ${key}`);
    }
}
function printCategories(registry) {
    const cats = getCategories(registry);
    console.log();
    console.log("Available categories:");
    console.log();
    for (const [category, items] of cats) {
        console.log(`  ${category} (${items.length})`);
        for (const item of items) {
            console.log(`    ${item.name}`);
        }
        console.log();
    }
}
function findProjectRoot(from) {
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
async function requireRegistry() {
    try {
        return await loadRegistry();
    }
    catch {
        log.error("Could not load the Substrate registry. Check your network connection.");
        process.exit(1);
    }
}
export async function add(components, options = {}) {
    if (options.listCategories) {
        printCategories(await requireRegistry());
        return;
    }
    const cwd = findProjectRoot(process.cwd());
    if (!cwd) {
        log.error("No components.json found. Run 'npx @substrate-kit/cli init' first, or run this from inside your project.");
        process.exit(1);
    }
    const registry = await requireRegistry();
    if (options.category && components.length === 0) {
        const catItems = getCategories(registry).get(options.category.toLowerCase());
        if (!catItems) {
            log.error(`Category "${options.category}" not found.`);
            printCategories(registry);
            process.exit(1);
        }
        components = catItems.map((i) => i.name);
        console.log();
        console.log(`  ${options.category} (${components.length} components)`);
        for (const name of components)
            console.log(`    ${name}`);
        console.log();
    }
    if (components.length === 0) {
        if (!process.stdin.isTTY) {
            log.error("Interactive mode requires a terminal. Specify components: substrate-kit add design-canvas toolbar");
            process.exit(1);
        }
        components = await interactivePicker(registry);
        if (components.length === 0) {
            log.info("No components selected.");
            return;
        }
    }
    const known = new Set(registry.items.map((i) => i.name));
    const unknown = components.filter((name) => !known.has(name));
    if (unknown.length > 0) {
        log.error(`Not in the registry: ${unknown.join(", ")}`);
        log.info("Run 'substrate-kit docs --list' to see every component.");
        process.exit(1);
    }
    log.title("Adding Substrate components");
    log.step(`Installing ${components.join(", ")}`);
    let recorded = 0;
    try {
        ;
        ({ recorded } = await installAndRecord(cwd, components, {
            yes: options.yes,
            onRetry: (attempt) => log.warn(`Install failed (attempt ${attempt}), retrying...`),
        }));
    }
    catch {
        log.error("Install failed. Check your connection and try again.");
        process.exit(1);
    }
    for (const name of components) {
        const item = registry.items.find((i) => i.name === name);
        if (item)
            printThemeHint(item);
    }
    if (recorded > 0)
        log.step(`Recorded ${recorded} component${recorded === 1 ? "" : "s"} in substrate.lock.json`);
    log.blank();
    log.success(`Added ${components.length} component${components.length === 1 ? "" : "s"} from substrate.georgedrury.co.uk`);
}
//# sourceMappingURL=add.js.map