import { execSync } from "node:child_process";
// SUBSTRATE_REGISTRY_URL points installs at a local registry for testing
const REGISTRY_BASE = process.env.SUBSTRATE_REGISTRY_URL ?? "https://substrate.georgedrury.co.uk/r";
export async function handleInstall(registry, args) {
    const results = [];
    for (const name of args.components) {
        const item = registry.items.find((i) => i.name === name);
        if (!item) {
            results.push({
                name,
                status: "not_found",
                error: `Component "${name}" not in registry`,
            });
            continue;
        }
        const url = `${REGISTRY_BASE}/${name}`;
        try {
            execSync(`npx shadcn@latest add ${url}`, {
                encoding: "utf-8",
                stdio: "pipe",
            });
            results.push({ name, status: "installed" });
        }
        catch (err) {
            results.push({
                name,
                status: "failed",
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(results, null, 2),
            },
        ],
    };
}
//# sourceMappingURL=install.js.map