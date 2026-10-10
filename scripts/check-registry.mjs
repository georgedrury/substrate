// Checks that every registry item installs cleanly on its own: imports use
// paths that exist after installation, and every import is covered by a
// declared dependency. Pass --fix to rewrite the dependency lists.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const registryPath = join(root, "registry.json")
const registry = JSON.parse(readFileSync(registryPath, "utf-8"))
const fix = process.argv.includes("--fix")

const BUILT_IN = new Set(["react", "react-dom"])
const itemUrl = (name) => `${registry.homepage}/r/${name}`

// "components/substrate/slider" -> the item that installs that file
const ownerByTarget = new Map()
for (const item of registry.items) {
	for (const file of item.files) {
		ownerByTarget.set(file.target.replace(/\.tsx?$/, ""), item.name)
	}
}

function packageName(specifier) {
	const parts = specifier.split("/")
	return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

const errors = []
let fixed = 0

for (const item of registry.items) {
	const registryDeps = new Set()
	const packages = new Set()

	for (const file of item.files) {
		const source = readFileSync(join(root, file.path), "utf-8")
		const specifiers = [...source.matchAll(/(?:from|import)\s+"([^"]+)"/g)].map((m) => m[1])

		for (const specifier of specifiers) {
			if (specifier.startsWith("./")) {
				// Same-folder imports stay valid, but may belong to another item
				const sibling = join(dirname(file.target), specifier).replace(/\\/g, "/")
				const owner = ownerByTarget.get(sibling)
				if (!owner) {
					errors.push(`${item.name}: "${specifier}" in ${file.path} matches no registry file`)
				} else if (owner !== item.name) {
					registryDeps.add(itemUrl(owner))
				}
			} else if (specifier.startsWith("../") || specifier.startsWith("@/registry/")) {
				errors.push(`${item.name}: "${specifier}" in ${file.path} will not resolve once installed`)
			} else if (specifier === "@/lib/utils") {
				continue
			} else if (specifier.startsWith("@/components/ui/")) {
				registryDeps.add(specifier.replace("@/components/ui/", ""))
			} else if (specifier.startsWith("@/")) {
				const owner = ownerByTarget.get(specifier.slice(2))
				if (!owner) {
					errors.push(`${item.name}: "${specifier}" in ${file.path} matches no registry file`)
				} else if (owner !== item.name) {
					registryDeps.add(itemUrl(owner))
				}
			} else if (!BUILT_IN.has(packageName(specifier))) {
				packages.add(packageName(specifier))
			}
		}
	}

	// Extra Substrate items are allowed (pane suggests panel); a bare name is
	// only valid for a shadcn component the item actually imports.
	const declaredRegistry = item.registryDependencies ?? []
	const declaredPackages = item.dependencies ?? []
	const strayNames = declaredRegistry.filter((dep) => !dep.startsWith("http") && !registryDeps.has(dep))
	const missingRegistry = [...registryDeps].filter((dep) => !declaredRegistry.includes(dep))
	const missingPackages = [...packages].filter((dep) => !declaredPackages.includes(dep))

	if (strayNames.length + missingRegistry.length + missingPackages.length === 0) continue

	if (fix) {
		const nextRegistry = [...declaredRegistry.filter((dep) => !strayNames.includes(dep)), ...missingRegistry]
		const nextPackages = [...declaredPackages, ...missingPackages]
		if (nextRegistry.length > 0) item.registryDependencies = nextRegistry
		else delete item.registryDependencies
		if (nextPackages.length > 0) item.dependencies = nextPackages
		fixed++
		continue
	}

	for (const dep of strayNames) {
		errors.push(`${item.name}: registryDependencies has "${dep}", which resolves to shadcn's registry but is not imported from @/components/ui`)
	}
	for (const dep of missingRegistry) errors.push(`${item.name}: registryDependencies is missing "${dep}"`)
	for (const dep of missingPackages) errors.push(`${item.name}: dependencies is missing "${dep}"`)
}

if (fixed > 0) {
	writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n")
	console.log(`Updated dependencies for ${fixed} items`)
}

if (errors.length > 0) {
	console.error(errors.join("\n"))
	console.error(`\n${errors.length} registry problem${errors.length === 1 ? "" : "s"}`)
	process.exit(1)
}

console.log(`Registry OK (${registry.items.length} items)`)
