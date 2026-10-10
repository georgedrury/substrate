import { execSync } from "node:child_process";
// shadcn asks before overwriting a file that differs from the registry. With
// no terminal to answer, it exits successfully having written nothing, so
// answer "no" for it: existing files are kept and the rest are installed.
export function shadcnAdd(url, options = {}) {
    const { cwd, silent = false } = options;
    const interactive = !silent && process.stdin.isTTY === true;
    const output = silent ? "pipe" : "inherit";
    execSync(`npx shadcn@latest add ${url}`, {
        cwd,
        encoding: "utf-8",
        stdio: interactive ? "inherit" : ["pipe", output, output],
        input: interactive ? undefined : "n\n".repeat(200),
    });
}
//# sourceMappingURL=shadcn.js.map