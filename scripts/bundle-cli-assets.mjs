// Copies what the CLI reads at runtime into packages/cli: the registry (for
// offline use) and the docs pages (for `get_docs`). Runs before publishing.
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const cli = join(root, "packages/cli")
const docsSource = join(root, "content/docs")
const docsDest = join(cli, "docs")

cpSync(join(root, "registry.json"), join(cli, "registry.json"))

rmSync(docsDest, { recursive: true, force: true })
let pages = 0
for (const section of ["components", "hooks", "utilities"]) {
	mkdirSync(join(docsDest, section), { recursive: true })
	for (const file of readdirSync(join(docsSource, section))) {
		if (!file.endsWith(".mdx")) continue
		cpSync(join(docsSource, section, file), join(docsDest, section, file))
		pages++
	}
}

console.log(`Bundled registry.json and ${pages} docs pages into packages/cli`)
