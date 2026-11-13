import { readFileSync } from "node:fs"
import { join } from "node:path"
import { exists, writeFile } from "./fs.js"
import { PACKAGE_ROOT } from "./version.js"

const START = "<!-- substrate:start -->"
const END = "<!-- substrate:end -->"

export function agentsSection(): string {
	const body = readFileSync(join(PACKAGE_ROOT, "templates", "agents-section.md"), "utf-8").trimEnd()
	return `${START}\n${body}\n${END}\n`
}

export type MergeResult = "created" | "added" | "updated" | "unchanged"

// Puts the Substrate guidance between markers so it can be refreshed later
// without touching anything the project wrote itself.
export function mergeSection(file: string, section: string): MergeResult {
	if (!exists(file)) {
		writeFile(file, section)
		return "created"
	}

	const current = readFileSync(file, "utf-8")
	const start = current.indexOf(START)
	const end = current.indexOf(END)

	let next: string
	let result: MergeResult
	if (start !== -1 && end > start) {
		next = current.slice(0, start) + section.trimEnd() + current.slice(end + END.length)
		result = "updated"
	} else {
		next = `${current.trimEnd()}\n\n${section}`
		result = "added"
	}

	if (next === current) return "unchanged"
	writeFile(file, next)
	return result
}
