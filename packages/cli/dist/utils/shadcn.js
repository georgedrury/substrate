import { execFileSync } from "node:child_process";
// One shadcn call installs every item, so shared dependencies are resolved
// once. shadcn asks before overwriting a file that differs from the registry;
// with no terminal to answer it exits successfully having written nothing,
// so answer "no" for it: existing files are kept and the rest are installed.
// A dropped request fails the whole call, so it is retried.
export function shadcnAdd(urls, options = {}, onRetry) {
    const { cwd, silent = false, yes = false, overwrite = false, attempts = 3 } = options;
    const interactive = !silent && process.stdin.isTTY === true;
    const output = silent ? "pipe" : "inherit";
    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    for (let attempt = 1;; attempt++) {
        try {
            execFileSync(npx, ["shadcn@latest", "add", ...(yes ? ["--yes"] : []), ...(overwrite ? ["--overwrite"] : []), ...urls], {
                cwd,
                encoding: "utf-8",
                stdio: interactive ? "inherit" : ["pipe", output, output],
                input: interactive ? undefined : "n\n".repeat(200),
            });
            return;
        }
        catch (error) {
            if (attempt >= attempts)
                throw error;
            onRetry?.(attempt, error);
        }
    }
}
//# sourceMappingURL=shadcn.js.map