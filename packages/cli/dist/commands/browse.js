import { execSync } from "node:child_process";
import { log } from "../utils/logger.js";
const DOCS_BASE = "https://substrate.georgedrury.co.uk/docs/components";
export function browse(component) {
    const url = component
        ? `${DOCS_BASE}/${component}`
        : "https://substrate.georgedrury.co.uk/docs";
    log.info(`Opening ${url}`);
    try {
        const platform = process.platform;
        if (platform === "darwin") {
            execSync(`open "${url}"`);
        }
        else if (platform === "win32") {
            execSync(`start "${url}"`);
        }
        else {
            execSync(`xdg-open "${url}"`);
        }
    }
    catch {
        log.error(`Could not open browser. Visit: ${url}`);
    }
}
//# sourceMappingURL=browse.js.map