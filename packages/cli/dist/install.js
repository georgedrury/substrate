import { shadcnAdd } from "./utils/shadcn.js";
import { REGISTRY_BASE, collectItems } from "./registry.js";
import { hashesBefore, recordAfterInstall } from "./lock.js";
/**
 * Install components with shadcn and record them in substrate.lock.json.
 * Throws if the install fails. Recording is best effort: if the registry can't
 * be read to work out what was written, the install still stands.
 */
export async function installAndRecord(root, components, options = {}) {
    // Note what is on disk first, so afterwards we can tell what was written
    let closure = null;
    try {
        closure = await collectItems(components);
    }
    catch {
        closure = null;
    }
    const before = closure ? hashesBefore(root, closure) : null;
    shadcnAdd(components.map((name) => `${REGISTRY_BASE}/${name}`), { cwd: root, silent: options.silent, yes: options.yes }, options.onRetry);
    const recorded = closure && before ? recordAfterInstall(root, closure, before) : 0;
    return { recorded };
}
//# sourceMappingURL=install.js.map