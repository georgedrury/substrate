import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

// Both src/utils and dist/utils sit two levels below the package root
export const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

export const VERSION: string = (
  JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf-8")) as { version: string }
).version

// The CLI version the generated project depends on. Keep in step with
// packages/cli/package.json when it gains a new minor version.
// SUBSTRATE_CLI_SPEC points it at a local tarball for testing before publish.
export const CLI_RANGE = process.env.SUBSTRATE_CLI_SPEC ?? "^0.2.1"

// Agent guidance shared with `substrate-kit init`; copied here by
// scripts/sync-skills.mjs, with markers so `init` can refresh it later.
export function agentsSection(): string {
  const body = readFileSync(join(PACKAGE_ROOT, "templates", "agents-section.md"), "utf-8").trimEnd()
  return `<!-- substrate:start -->\n${body}\n<!-- substrate:end -->\n`
}
