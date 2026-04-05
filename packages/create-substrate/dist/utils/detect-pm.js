import { existsSync } from "node:fs";
import { join } from "node:path";
export function detectPackageManager(cwd) {
    if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) {
        return "bun";
    }
    if (existsSync(join(cwd, "pnpm-lock.yaml"))) {
        return "pnpm";
    }
    return "npm";
}
export function getInstallCommand(pm) {
    return `${pm} install`;
}
export function getRunCommand(pm, script) {
    if (pm === "npm")
        return `npm run ${script}`;
    return `${pm} ${script}`;
}
//# sourceMappingURL=detect-pm.js.map