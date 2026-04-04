import { createInterface } from "node:readline";
import { join, dirname } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { exec } from "../utils/shell.js";
import { exists } from "../utils/fs.js";
import { log } from "../utils/logger.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_BASE = "https://substrate.georgedrury.co.uk/r";
const REGISTRY_URL = "https://substrate.georgedrury.co.uk/registry.json";
async function loadRegistry() {
    const localPath = join(process.cwd(), "registry.json");
    if (existsSync(localPath)) {
        try {
            return JSON.parse(readFileSync(localPath, "utf-8"));
        }
        catch {
            /* fall through */
        }
    }
    try {
        const res = await fetch(REGISTRY_URL);
        if (res.ok)
            return (await res.json());
    }
    catch {
        /* fall through */
    }
    const bundledPaths = [
        join(__dirname, "..", "..", "registry.json"),
        join(__dirname, "..", "..", "..", "registry.json"),
    ];
    for (const p of bundledPaths) {
        if (existsSync(p)) {
            try {
                return JSON.parse(readFileSync(p, "utf-8"));
            }
            catch {
                /* fall through */
            }
        }
    }
    return null;
}
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
function extractOverrideKeys(item) {
    const theme = item.cssVars?.theme;
    if (!theme)
        return [];
    const keys = [];
    for (const value of Object.values(theme)) {
        const match = value.match(/^var\(--([^,)]+)/);
        if (match)
            keys.push(`--${match[1]}`);
    }
    return keys;
}
function printThemeHint(item) {
    const keys = extractOverrideKeys(item);
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
export async function add(components, options = {}) {
    if (options.listCategories) {
        const registry = await loadRegistry();
        if (!registry) {
            log.error("Could not load the Substrate registry.");
            process.exit(1);
        }
        printCategories(registry);
        return;
    }
    let cwd = process.cwd();
    let found = false;
    while (cwd !== "/") {
        if (exists(join(cwd, "components.json"))) {
            found = true;
            break;
        }
        cwd = join(cwd, "..");
    }
    if (!found) {
        log.error("No components.json found. Run 'substrate init' first or ensure you're in a project directory.");
        process.exit(1);
    }
    if (options.category && components.length === 0) {
        const registry = await loadRegistry();
        if (!registry) {
            log.error("Could not load the Substrate registry.");
            process.exit(1);
        }
        const cats = getCategories(registry);
        const catItems = cats.get(options.category.toLowerCase());
        if (!catItems) {
            log.error(`Category "${options.category}" not found.`);
            console.log();
            printCategories(registry);
            process.exit(1);
        }
        components = catItems.map((i) => i.name);
        console.log();
        console.log(`  ${options.category} (${components.length} components)`);
        for (const name of components) {
            console.log(`    ${name}`);
        }
        console.log();
    }
    if (components.length === 0) {
        const registry = await loadRegistry();
        if (!registry) {
            log.error("Could not load the Substrate registry.");
            log.info("Usage: substrate add design-canvas toolbar panel");
            process.exit(1);
        }
        if (!process.stdin.isTTY) {
            log.error("Interactive mode requires a terminal. Specify components: substrate add design-canvas toolbar");
            process.exit(1);
        }
        components = await interactivePicker(registry);
        if (components.length === 0) {
            log.info("No components selected.");
            return;
        }
    }
    const registry = await loadRegistry();
    log.title("Adding Substrate components");
    let installed = 0;
    for (const component of components) {
        const url = `${REGISTRY_BASE}/${component}`;
        log.step(`Installing ${component}`);
        try {
            exec(`npx shadcn@latest add ${url}`, { cwd });
            log.success(`Installed ${component}`);
            installed++;
            if (registry) {
                const item = registry.items.find((i) => i.name === component);
                if (item)
                    printThemeHint(item);
            }
        }
        catch {
            log.error(`Failed to install ${component}`);
        }
    }
    log.blank();
    log.info(`Added ${installed} component${installed === 1 ? "" : "s"} from substrate.georgedrury.co.uk`);
}
//# sourceMappingURL=add.js.map