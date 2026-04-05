import { execSync } from "node:child_process";
import { log } from "./logger.js";
export function exec(command, options = {}) {
    const { cwd, silent = false } = options;
    try {
        const result = execSync(command, {
            cwd,
            encoding: "utf-8",
            stdio: silent ? "pipe" : "inherit",
        });
        return typeof result === "string" ? result.trim() : "";
    }
    catch (error) {
        if (!silent) {
            log.error(`Command failed: ${command}`);
        }
        throw error;
    }
}
export function execSilent(command, cwd) {
    try {
        return exec(command, { cwd, silent: true });
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=shell.js.map