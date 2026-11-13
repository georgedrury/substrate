import { existsSync } from "node:fs";
import { join } from "node:path";
export function isPackageManager(value) {
    return value === "npm" || value === "pnpm" || value === "bun";
}
// npm, pnpm and bun all set npm_config_user_agent to e.g. "pnpm/9.1.0 npm/? ...",
// so the tool that ran `create-substrate` is the one the user prefers.
export function detectRunningPackageManager(userAgent = process.env.npm_config_user_agent) {
    const name = userAgent?.split(" ")[0]?.split("/")[0];
    return name && isPackageManager(name) ? name : null;
}
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