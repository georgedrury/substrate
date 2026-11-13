import { spawnSync } from "node:child_process";
import { log } from "../utils/logger.js";
import { docsUrl } from "../utils/docs.js";
import { loadRegistry, matchesQuery } from "../registry.js";
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
    console.log(`    ${docsUrl(item.name)}`);
    console.log();
}
function formatList(items, query) {
    const filtered = query ? items.filter((i) => matchesQuery(i, query)) : items;
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
function openInBrowser(url) {
    log.info(`Opening ${url}`);
    const [command, args] = process.platform === "darwin"
        ? ["open", [url]]
        : process.platform === "win32"
            ? ["cmd", ["/c", "start", "", url]]
            : ["xdg-open", [url]];
    const result = spawnSync(command, args, { stdio: "ignore" });
    if (result.error || result.status !== 0)
        log.error(`Could not open a browser. Visit: ${url}`);
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
        if (options.open && !nameOrQuery) {
            openInBrowser("https://substrate.georgedrury.co.uk/docs");
            return;
        }
        formatList(registry.items, nameOrQuery?.toLowerCase());
        return;
    }
    const query = nameOrQuery.toLowerCase();
    const item = registry.items.find((i) => i.name === query) ??
        (() => {
            const matches = registry.items.filter((i) => matchesQuery(i, query));
            return matches.length === 1 ? matches[0] : undefined;
        })();
    if (!item) {
        const matches = registry.items.filter((i) => matchesQuery(i, query));
        if (matches.length > 1) {
            log.warn(`No exact match for "${nameOrQuery}". Did you mean:`);
            console.log();
            for (const m of matches.slice(0, 10)) {
                console.log(`  ${m.name}${m.title ? ` — ${m.title}` : ""}`);
            }
            console.log();
        }
        else {
            log.error(`Component "${nameOrQuery}" not found in registry`);
            process.exitCode = 1;
        }
        return;
    }
    if (options.open) {
        openInBrowser(docsUrl(item.name));
        return;
    }
    formatComponent(item);
}
//# sourceMappingURL=docs.js.map