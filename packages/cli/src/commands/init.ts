import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
	copyDir,
	exists,
	writeFile,
	resolveSkillsDir,
	listDirs,
} from "../utils/fs.js"
import { agentsSection, mergeSection, type MergeResult } from "../utils/agents-file.js"
import { VERSION } from "../utils/version.js"
import { log } from "../utils/logger.js"

const CLI_PACKAGE = "@substrate-kit/cli"
const REGISTRY_ENTRY = "https://substrate.georgedrury.co.uk/r/{name}"
const SKILL_DIRS = [join(".claude", "skills"), join(".agents", "skills")]

type Json = Record<string, unknown>

type PackageJson = {
	dependencies?: Record<string, string>
	devDependencies?: Record<string, string>
	[key: string]: unknown
}

export interface InitOptions {
	force?: boolean
	skipComponentsJson?: boolean
}

type Framework = "next" | "vite" | "unknown"

function readJson(path: string): Json | null {
	try {
		const parsed: unknown = JSON.parse(readFileSync(path, "utf-8"))
		return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
			? (parsed as Json)
			: null
	} catch {
		return null
	}
}

function asRecord(value: unknown): Json {
	return typeof value === "object" && value !== null && !Array.isArray(value)
		? (value as Json)
		: {}
}

function detectFramework(pkg: PackageJson | null): Framework {
	const deps = { ...pkg?.dependencies, ...pkg?.devDependencies }
	if (deps["next"]) return "next"
	if (deps["vite"]) return "vite"
	return "unknown"
}

// The stylesheet shadcn writes theme variables into: the project's own if it
// has one in the usual place, otherwise the framework's default.
function detectCssFile(cwd: string, framework: Framework): string {
	const candidates =
		framework === "next"
			? ["app/globals.css", "src/app/globals.css", "styles/globals.css", "src/styles/globals.css"]
			: ["src/index.css", "src/globals.css", "src/styles.css", "src/App.css"]
	return (
		candidates.find((file) => exists(join(cwd, file))) ??
		(framework === "next" ? "app/globals.css" : "src/globals.css")
	)
}

function newComponentsJson(cwd: string, framework: Framework): Json {
	return {
		$schema: "https://ui.shadcn.com/schema.json",
		style: "radix-mira",
		rsc: framework === "next",
		tsx: true,
		tailwind: {
			config: "",
			css: detectCssFile(cwd, framework),
			baseColor: "neutral",
			cssVariables: true,
			prefix: "",
		},
		iconLibrary: "remixicon",
		aliases: {
			components: "@/components",
			utils: "@/lib/utils",
			ui: "@/components/ui",
			lib: "@/lib",
			hooks: "@/hooks",
		},
		registries: { "@substrate": REGISTRY_ENTRY },
	}
}

function writeJson(path: string, value: Json, indent: string | number = 2): void {
	writeFile(path, JSON.stringify(value, null, indent) + "\n")
}

function initComponentsJson(cwd: string, framework: Framework, force: boolean): void {
	const path = join(cwd, "components.json")
	if (!exists(path)) {
		writeJson(path, newComponentsJson(cwd, framework))
		log.success(`Created components.json for ${framework === "next" ? "Next.js" : "Vite"}`)
		return
	}

	const existing = readJson(path)
	if (!existing) {
		log.warn("components.json could not be read as JSON, so it was left alone")
		return
	}

	// Only the Substrate registry is added; the project's own style choices stay
	const registries = asRecord(existing.registries)
	if (registries["@substrate"] && !force) {
		log.step("components.json already has the @substrate registry")
		return
	}
	writeJson(path, { ...existing, registries: { ...registries, "@substrate": REGISTRY_ENTRY } })
	log.success("Added the @substrate registry to components.json")
}

function initMcpJson(cwd: string, force: boolean): void {
	const path = join(cwd, ".mcp.json")
	const server = { command: "npx", args: ["-y", CLI_PACKAGE, "mcp"] }

	if (!exists(path)) {
		writeJson(path, { mcpServers: { substrate: server } })
		log.success("Created .mcp.json (Substrate MCP server registered)")
		return
	}

	const existing = readJson(path)
	if (!existing) {
		log.warn(".mcp.json could not be read as JSON, so it was left alone")
		return
	}

	const servers = asRecord(existing.mcpServers)
	if (servers["substrate"] && !force) {
		log.step(".mcp.json already registers the Substrate MCP server")
		return
	}
	writeJson(path, { ...existing, mcpServers: { ...servers, substrate: server } })
	log.success("Registered the Substrate MCP server in .mcp.json")
}

function describe(file: string, result: MergeResult): void {
	if (result === "created") log.success(`Created ${file}`)
	else if (result === "added") log.success(`Added a Substrate section to ${file}`)
	else if (result === "updated") log.success(`Updated the Substrate section in ${file}`)
	else log.step(`${file} is up to date`)
}

// CLAUDE.md and AGENTS.md both get the guidance, unless CLAUDE.md just imports
// AGENTS.md, in which case adding it to both would load it twice.
function initAgentFiles(cwd: string): void {
	const claude = join(cwd, "CLAUDE.md")
	const agents = join(cwd, "AGENTS.md")
	const section = agentsSection()

	if (!exists(claude) && !exists(agents)) {
		describe("AGENTS.md", mergeSection(agents, section))
		writeFile(claude, "@AGENTS.md\n")
		log.success("Created CLAUDE.md (imports AGENTS.md)")
		return
	}

	const claudeImportsAgents =
		exists(claude) && exists(agents) && /^@AGENTS\.md\s*$/m.test(readFileSync(claude, "utf-8"))

	if (exists(agents)) describe("AGENTS.md", mergeSection(agents, section))
	if (exists(claude) && !claudeImportsAgents) describe("CLAUDE.md", mergeSection(claude, section))
}

function initSkills(cwd: string, force: boolean): void {
	const source = resolveSkillsDir()
	const skillNames = listDirs(source)
	if (skillNames.length === 0) {
		log.error("No skills found in the bundled skills directory")
		process.exit(1)
	}

	let copied = 0
	let skipped = 0
	for (const dir of SKILL_DIRS) {
		for (const name of skillNames) {
			const dest = join(cwd, dir, name)
			if (exists(dest) && !force) {
				skipped++
				continue
			}
			copyDir(join(source, name), dest)
			copied++
		}
	}

	if (copied > 0) {
		log.success(`Installed ${skillNames.length} skills into ${SKILL_DIRS.join(" and ")}`)
	}
	if (skipped > 0) {
		log.warn(`Skipped ${skipped} existing skill folder${skipped === 1 ? "" : "s"} (use --force to refresh them)`)
	}
}

export async function init(options: InitOptions = {}): Promise<void> {
	const cwd = process.cwd()
	const { force = false, skipComponentsJson = false } = options

	log.title("Initialising Substrate")

	const packageJsonPath = join(cwd, "package.json")
	const rawPackageJson = exists(packageJsonPath) ? readFileSync(packageJsonPath, "utf-8") : null
	const pkg = rawPackageJson ? (JSON.parse(rawPackageJson) as PackageJson) : null
	const framework = detectFramework(pkg)

	if (!pkg) {
		log.warn("No package.json here. Run this from the root of your project.")
	} else if (framework === "unknown") {
		log.warn("Could not tell whether this is a Next.js or Vite project, so Vite settings are used")
	}

	initSkills(cwd, force)
	initAgentFiles(cwd)
	if (!skipComponentsJson) initComponentsJson(cwd, framework === "next" ? "next" : "vite", force)
	initMcpJson(cwd, force)

	// The CLI is added as a dev dependency so `npx substrate-kit` resolves locally
	if (pkg && rawPackageJson) {
		if (!pkg.dependencies?.[CLI_PACKAGE] && !pkg.devDependencies?.[CLI_PACKAGE]) {
			pkg.devDependencies = { ...pkg.devDependencies, [CLI_PACKAGE]: `^${VERSION}` }
			const indent = rawPackageJson.includes("\n\t") ? "\t" : 2
			writeFile(packageJsonPath, JSON.stringify(pkg, null, indent) + "\n")
			log.success(`Added ${CLI_PACKAGE} to devDependencies (install to use npx substrate-kit)`)
		}
	}

	log.blank()
	log.info("Substrate is ready. Agents in this project can now use the skills and the MCP server.")
}
