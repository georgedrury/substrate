import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "../utils/logger.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
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
export async function variables(component, options) {
    const registry = await loadRegistry();
    if (!registry) {
        log.error("Could not load the component registry");
        process.exit(1);
    }
    if (options.all) {
        const withVars = registry.items
            .map((item) => ({ item, keys: extractOverrideKeys(item) }))
            .filter(({ keys }) => keys.length > 0)
            .sort((a, b) => a.item.name.localeCompare(b.item.name));
        if (withVars.length === 0) {
            log.info("No components have theme variables");
            return;
        }
        log.blank();
        log.info(`${withVars.length} components with theme variables:`);
        log.blank();
        for (const { item, keys } of withVars) {
            console.log(`  ${item.name}`);
            for (const key of keys) {
                console.log(`    ${key}`);
            }
            console.log();
        }
        return;
    }
    if (!component) {
        log.error("Provide a component name, e.g. substrate variables panel");
        log.info("Use --all to list every component's variables");
        process.exit(1);
    }
    const item = registry.items.find((i) => i.name.toLowerCase() === component.toLowerCase());
    if (!item) {
        log.error(`Component "${component}" not found`);
        const query = component.toLowerCase();
        const suggestions = registry.items
            .filter((i) => i.name.toLowerCase().includes(query))
            .slice(0, 5);
        if (suggestions.length > 0) {
            log.info("Did you mean:");
            for (const s of suggestions) {
                console.log(`  ${s.name}`);
            }
        }
        process.exit(1);
    }
    const keys = extractOverrideKeys(item);
    if (keys.length === 0) {
        log.info("No theme variables — this component uses base theme values only");
        return;
    }
    log.blank();
    for (const key of keys) {
        console.log(`    ${key}`);
    }
    log.blank();
}
//# sourceMappingURL=variables.js.map