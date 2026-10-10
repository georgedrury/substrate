// Copies the skills in packages/cli/skills (the source of truth) to the
// places that ship them: create-substrate's bundle, the docs downloads, and
// the surface guides bundled into this repo's own substrate-surfaces skill.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "packages/cli/skills")
const bundle = join(root, "packages/create-substrate/skills")
const downloads = join(root, "public/skills")
const surfaces = join(root, ".agents/skills/substrate-surfaces")

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

// The bundled guides are sub-files of one skill, so they carry no frontmatter
for (const file of readdirSync(surfaces)) {
	const name = file.replace(/\.md$/, "")
	const skill = join(source, name, "SKILL.md")
	if (file === "SKILL.md" || !existsSync(skill)) continue
	const body = readFileSync(skill, "utf-8").replace(/^---\n[\s\S]*?\n---\n+/, "")
	writeFileSync(join(surfaces, file), body)
}

console.log(`Synced ${names.length} skills`)
