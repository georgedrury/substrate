// Copies the skills in packages/cli/skills (the source of truth) to the
// places that ship them: create-substrate's bundle and the docs downloads.
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "packages/cli/skills")
const bundle = join(root, "packages/create-substrate/skills")
const downloads = join(root, "public/skills")

const names = readdirSync(source, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)

rmSync(bundle, { recursive: true, force: true })
cpSync(source, bundle, { recursive: true })

rmSync(downloads, { recursive: true, force: true })
mkdirSync(downloads, { recursive: true })
for (const name of names) {
	cpSync(join(source, name, "SKILL.md"), join(downloads, `${name}.md`))
}

console.log(`Synced ${names.length} skills`)
