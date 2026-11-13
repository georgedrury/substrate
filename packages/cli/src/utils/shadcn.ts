import { execFileSync } from "node:child_process"

export interface ShadcnAddOptions {
	cwd?: string
	/** Capture output instead of printing it (used by the MCP server) */
	silent?: boolean
	/** How many times to try before giving up (default 3) */
	attempts?: number
}

// Called between attempts so the caller can say it is retrying
export type RetryHandler = (attempt: number, error: unknown) => void

// One shadcn call installs every item, so shared dependencies are resolved
// once. shadcn asks before overwriting a file that differs from the registry;
// with no terminal to answer it exits successfully having written nothing,
// so answer "no" for it: existing files are kept and the rest are installed.
// A dropped request fails the whole call, so it is retried.
export function shadcnAdd(urls: string[], options: ShadcnAddOptions = {}, onRetry?: RetryHandler): void {
	const { cwd, silent = false, attempts = 3 } = options
	const interactive = !silent && process.stdin.isTTY === true
	const output = silent ? "pipe" : "inherit"
	const npx = process.platform === "win32" ? "npx.cmd" : "npx"

	for (let attempt = 1; ; attempt++) {
		try {
			execFileSync(npx, ["shadcn@latest", "add", ...urls], {
				cwd,
				encoding: "utf-8",
				stdio: interactive ? "inherit" : ["pipe", output, output],
				input: interactive ? undefined : "n\n".repeat(200),
			})
			return
		} catch (error) {
			if (attempt >= attempts) throw error
			onRetry?.(attempt, error)
		}
	}
}
