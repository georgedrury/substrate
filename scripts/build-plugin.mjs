// Builds build/substrate.plugin (a Claude plugin) from the current skills and
// the CLI's version, so it can never lag behind what is published.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const cli = join(root, "packages/cli")
const { version } = JSON.parse(readFileSync(join(cli, "package.json"), "utf-8"))
const manifestPath = join(cli, ".claude-plugin/plugin.json")
const manifest = { ...JSON.parse(readFileSync(manifestPath, "utf-8")), version }

// Keep the committed manifest in step with the package version too
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, "\t")}\n`)

const staging = mkdtempSync(join(tmpdir(), "substrate-plugin-"))
try {
	mkdirSync(join(staging, ".claude-plugin"))
	writeFileSync(join(staging, ".claude-plugin/plugin.json"), `${JSON.stringify(manifest, null, "\t")}\n`)
	cpSync(join(cli, "skills"), join(staging, "skills"), { recursive: true })

	const out = join(root, "build/substrate.plugin")
	mkdirSync(dirname(out), { recursive: true })
	rmSync(out, { force: true })
	execFileSync("zip", ["-qr", out, ".claude-plugin", "skills"], { cwd: staging })
	console.log(`Built build/substrate.plugin (${version})`)
} finally {
	rmSync(staging, { recursive: true, force: true })
}
