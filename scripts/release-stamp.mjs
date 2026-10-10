// Ties a publish to a passing release check without rerunning it.
//   record: store a fingerprint of the working tree (run after the tests pass)
//   verify: fail unless the tree still matches that fingerprint
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const stampPath = join(root, ".release-check")

// Hash every tracked and untracked file (ignored files excluded) by staging
// the tree into a throwaway index, leaving the real index untouched.
function fingerprint() {
	const dir = mkdtempSync(join(tmpdir(), "substrate-index-"))
	const env = { ...process.env, GIT_INDEX_FILE: join(dir, "index") }
	try {
		execFileSync("git", ["add", "-A"], { cwd: root, env })
		return execFileSync("git", ["write-tree"], { cwd: root, env, encoding: "utf-8" }).trim()
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
}

const command = process.argv[2]

if (command === "record") {
	writeFileSync(stampPath, `${fingerprint()}\n`)
	console.log("Recorded passing release check")
} else if (command === "verify") {
	const recorded = existsSync(stampPath) ? readFileSync(stampPath, "utf-8").trim() : null
	if (recorded !== fingerprint()) {
		console.error(
			recorded
				? "Files have changed since the last passing release check."
				: "No passing release check has been recorded.",
		)
		console.error("Run `npm run release:check` from the repository root, then publish again.")
		process.exit(1)
	}
	console.log("Release check matches the current files")
} else {
	console.error("Usage: node scripts/release-stamp.mjs <record|verify>")
	process.exit(1)
}
