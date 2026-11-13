import { REGISTRY_BASE } from "../../registry.js";
import { shadcnAdd } from "../../utils/shadcn.js";
export async function handleInstall(registry, args) {
    const known = new Set(registry.items.map((i) => i.name));
    const unknown = args.components.filter((name) => !known.has(name));
    const valid = args.components.filter((name) => known.has(name));
    const results = unknown.map((name) => ({
        name,
        status: "not_found",
        error: `Component "${name}" not in registry`,
    }));
    if (valid.length > 0) {
        try {
            shadcnAdd(valid.map((name) => `${REGISTRY_BASE}/${name}`), { silent: true });
            for (const name of valid)
                results.push({ name, status: "installed" });
        }
        catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            for (const name of valid)
                results.push({ name, status: "failed", error });
        }
    }
    return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        isError: results.some((r) => r.status !== "installed"),
    };
}
//# sourceMappingURL=install.js.map