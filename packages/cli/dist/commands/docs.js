import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "../utils/logger.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_URL = "https://substrate.georgedrury.co.uk/registry.json";
const DOCS_BASE = "https://substrate.georgedrury.co.uk/docs/components";
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
    throw new Error("Could not load Substrate registry");
}
function formatComponent(item) {
    const title = item.title || item.name;
    const categories = (item.categories || []).join(", ");
    console.log();
    console.log(title);
    if (item.description) {
        console.log(item.description);
    }
    console.log();
    const meta = [];
    if (categories)
        meta.push(`Category: ${categories}`);
    if (item.dependencies?.length) {
        meta.push(`Dependencies: ${item.dependencies.join(", ")}`);
    }
    if (meta.length) {
        meta.forEach((m) => console.log(`  ${m}`));
        console.log();
    }
    const lineage = item.meta?.lineage;
    if (lineage?.length) {
        const chain = lineage.map((l) => l.name).join(" → ");
        console.log(`  Lineage: ${chain}`);
    }
    if (item.meta?.example) {
        console.log();
        console.log("  Usage:");
        console.log(`    ${item.meta.example}`);
    }
    const cssVars = item.cssVars?.theme;
    if (cssVars && Object.keys(cssVars).length > 0) {
        console.log();
        console.log("  CSS variables:");
        for (const [key, value] of Object.entries(cssVars)) {
            console.log(`    ${key}`);
            console.log(`      ${value}`);
        }
    }
    console.log();
    console.log("  Install:");
    console.log(`    npx substrate-kit add ${item.name}`);
    console.log();
    console.log("  Docs:");
    console.log(`    ${DOCS_BASE}/${item.name}`);
    console.log();
}
function formatList(items, query) {
    const filtered = query
        ? items.filter((i) => i.name.includes(query) ||
            (i.title || "").toLowerCase().includes(query) ||
            (i.description || "").toLowerCase().includes(query) ||
            (i.categories || []).some((c) => c.toLowerCase().includes(query)))
        : items;
    if (filtered.length === 0) {
        log.warn(query ? `No components matching "${query}"` : "No components found");
        return;
    }
    console.log();
    console.log(`${filtered.length} components${query ? ` matching "${query}"` : ""}`);
    console.log();
    const grouped = new Map();
    for (const item of filtered) {
        const cat = (item.categories || ["other"])[0];
        if (!grouped.has(cat))
            grouped.set(cat, []);
        grouped.get(cat).push(item);
    }
    for (const [category, catItems] of grouped) {
        console.log(`  ${category}`);
        for (const item of catItems) {
            const desc = item.description
                ? ` — ${item.description.slice(0, 60)}${item.description.length > 60 ? "..." : ""}`
                : "";
            console.log(`    ${item.name}${desc}`);
        }
        console.log();
    }
}
export async function docs(nameOrQuery, options = {}) {
    let registry;
    try {
        registry = await loadRegistry();
    }
    catch {
        log.error("Could not load the Substrate registry. Check your network connection.");
        process.exit(1);
    }
    if (options.list || !nameOrQuery) {
        formatList(registry.items, nameOrQuery?.toLowerCase());
        return;
    }
    const item = registry.items.find((i) => i.name === nameOrQuery);
    if (!item) {
        const matches = registry.items.filter((i) => i.name.includes(nameOrQuery.toLowerCase()) ||
            (i.title || "").toLowerCase().includes(nameOrQuery.toLowerCase()));
        if (matches.length === 1) {
            formatComponent(matches[0]);
        }
        else if (matches.length > 1) {
            log.warn(`No exact match for "${nameOrQuery}". Did you mean:`);
            console.log();
            for (const m of matches.slice(0, 10)) {
                console.log(`  ${m.name}${m.title ? ` — ${m.title}` : ""}`);
            }
            console.log();
        }
        else {
            log.error(`Component "${nameOrQuery}" not found in registry`);
        }
        return;
    }
    formatComponent(item);
}
//# sourceMappingURL=docs.js.map