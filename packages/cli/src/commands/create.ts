import { spawnSync } from "node:child_process"
import { log } from "../utils/logger.js"
import type { PackageManager } from "../utils/detect-pm.js"

export interface CreateOptions {
	surface?: string
	skipInstall?: boolean
	skipGit?: boolean
	packageManager?: PackageManager
}

// create-substrate owns the project templates; this command only forwards to
// it. SUBSTRATE_CREATE_BIN points at a local build of it for testing.
export function create(projectName: string | undefined, options: CreateOptions = {}): void {
	const args: string[] = []
	if (projectName) args.push(projectName)
	if (options.surface) args.push("--surface", options.surface)
	if (options.packageManager) args.push("--pm", options.packageManager)
	if (options.skipInstall) args.push("--skip-install")
	if (options.skipGit) args.push("--skip-git")

	const localBin = process.env.SUBSTRATE_CREATE_BIN
	const result = localBin
		? spawnSync("node", [localBin, ...args], { stdio: "inherit" })
		: spawnSync("npx", ["--yes", "create-substrate@latest", ...args], { stdio: "inherit" })

	if (result.error) {
		log.error(`Could not run create-substrate: ${result.error.message}`)
		process.exit(1)
	}
	process.exit(result.status ?? 1)
}
