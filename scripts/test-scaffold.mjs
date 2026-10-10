// End-to-end release test. Serves the locally built registry, then:
//   1. scaffolds every create-substrate surface, builds it and loads it in
//      a headless browser, failing on any runtime error
//   2. does the same through `substrate-kit create`, which forwards to it
//   3. installs every registry item into one project and typechecks it
//   4. runs `substrate-kit add` with no terminal over an existing component
// Usage: node scripts/test-scaffold.mjs [--live] [case...]   (default: all)
// --live tests against the deployed registry instead of the local build.
// --keep leaves the scaffolded projects on disk after a passing run.
import { spawn } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { createServer } from "node:http"
import { createServer as createTcpServer } from "node:net"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf-8"))
const SURFACES = ["canvas-2d", "3d-scene", "animation", "node-editor", "data-vis", "image-gen", "blank"]
const CASES = [...SURFACES, "cli-create", "cli-add", "all-items"]
const CONCURRENCY = 3
const COMMAND_TIMEOUT_MS = 10 * 60 * 1000

const live = process.argv.includes("--live")
const keep = process.argv.includes("--keep")
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"))
const unknown = requested.filter((name) => !CASES.includes(name))
if (unknown.length > 0) {
	console.error(`Unknown case: ${unknown.join(", ")}. Choose from ${CASES.join(", ")}`)
	process.exit(1)
}
const cases = requested.length > 0 ? requested : CASES

function run(command, args, options = {}) {
	return new Promise((resolve) => {
		const child = spawn(command, args, { ...options, stdio: ["ignore", "pipe", "pipe"] })
		let output = ""
		child.stdout.on("data", (chunk) => (output += chunk))
		child.stderr.on("data", (chunk) => (output += chunk))
		// A stalled install or prompt should fail with its output, not hang the run
		const timer = setTimeout(() => {
			output += `\nTimed out after ${COMMAND_TIMEOUT_MS / 60000} minutes`
			child.kill("SIGKILL")
		}, COMMAND_TIMEOUT_MS)
		child.on("close", (code) => {
			clearTimeout(timer)
			resolve({ code: code ?? 1, output })
		})
	})
}

// Serve public/r as the live site does (/r/name -> name.json), with item
// URLs pointed back at this server so dependencies resolve locally too.
const server = createServer((req, res) => {
	const name = (req.url ?? "").replace(/^\/r\//, "").replace(/\.json$/, "")
	const file = join(root, "public/r", `${name}.json`)
	if (!/^[a-z0-9-]+$/.test(name) || !existsSync(file)) {
		res.writeHead(404).end()
		return
	}
	const body = readFileSync(file, "utf-8").replaceAll(`${registry.homepage}/r/`, `${base}/`)
	res.writeHead(200, { "content-type": "application/json" }).end(body)
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const base = live ? `${registry.homepage}/r` : `http://127.0.0.1:${server.address().port}/r`
console.log(`Registry: ${base}`)
const env = {
	...process.env,
	SUBSTRATE_REGISTRY_URL: base,
	SUBSTRATE_CREATE_BIN: join(root, "packages/create-substrate/dist/index.js"),
	CI: "1",
}

const workspace = mkdtempSync(join(tmpdir(), "substrate-test-"))
const browser = await chromium.launch()

function freePort() {
	return new Promise((resolve) => {
		const probe = createTcpServer()
		probe.listen(0, "127.0.0.1", () => {
			const { port } = probe.address()
			probe.close(() => resolve(port))
		})
	})
}

// Serve the built app and load it, collecting anything the page throws
async function smoke(cwd) {
	const port = await freePort()
	// Run vite directly so that killing it does not leave a server behind
	const vite = join(cwd, "node_modules/vite/bin/vite.js")
	const args = [vite, "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"]
	const preview = spawn("node", args, { cwd, env, stdio: "ignore" })
	const url = `http://127.0.0.1:${port}/`
	const problems = []

	try {
		let up = false
		for (let attempt = 0; attempt < 60 && !up; attempt++) {
			await new Promise((resolve) => setTimeout(resolve, 500))
			up = await fetch(url).then((res) => res.ok, () => false)
		}
		if (!up) return ["preview server did not start"]

		const page = await browser.newPage()
		page.on("pageerror", (error) => problems.push(`uncaught: ${error.message}`))
		page.on("console", (message) => {
			if (message.type() === "error") problems.push(`console.error: ${message.text()}`)
		})
		await page.goto(url, { waitUntil: "networkidle" })
		await page.waitForTimeout(1500)
		const rendered = await page.evaluate(() => document.body.innerText.trim().length > 0 || document.querySelector("canvas") !== null)
		if (!rendered) problems.push("page rendered nothing")
		await page.close()
	} finally {
		preview.kill()
	}
	return problems
}

async function scaffoldAndBuild(name, command) {
	const cwd = join(workspace, name)
	const scaffold = await run("node", command, { cwd: workspace, env })
	if (scaffold.code !== 0) return { ok: false, stage: "scaffold", output: scaffold.output }
	// The scaffolders warn and carry on when a component fails to install
	if (/Failed to install|Could not install/.test(scaffold.output)) {
		return { ok: false, stage: "component install", output: scaffold.output }
	}
	const build = await run("npm", ["run", "build"], { cwd, env })
	if (build.code !== 0) return { ok: false, stage: "build", output: build.output }
	const problems = await smoke(cwd)
	if (problems.length > 0) return { ok: false, stage: "runtime", output: problems.join("\n") }
	return { ok: true }
}

async function allItems() {
	const scaffolder = join(root, "packages/create-substrate/dist/index.js")
	const args = [scaffolder, "all-items", "--surface", "blank", "--pm", "npm", "--skip-git"]
	const scaffold = await run("node", args, { cwd: workspace, env })
	if (scaffold.code !== 0) return { ok: false, stage: "scaffold", output: scaffold.output }

	const cwd = join(workspace, "all-items")
	const urls = registry.items.map((item) => `${base}/${item.name}`)
	const add = await run("npx", ["shadcn@latest", "add", "--yes", "--overwrite", ...urls], { cwd, env })
	if (add.code !== 0) return { ok: false, stage: "install all items", output: add.output }

	const check = await run("npx", ["tsc", "-b"], { cwd, env })
	if (check.code !== 0) return { ok: false, stage: "typecheck", output: check.output }
	return { ok: true }
}

// number-slider depends on number-input, which is already installed and
// differs from the registry copy once shadcn strips "use client". shadcn then
// asks whether to overwrite, and with no terminal used to write nothing.
async function cliAdd() {
	const scaffolder = join(root, "packages/create-substrate/dist/index.js")
	const cli = join(root, "packages/cli/dist/index.js")
	const cwd = join(workspace, "cli-add")
	const scaffold = await run("node", [scaffolder, "cli-add", "--surface", "blank", "--pm", "npm", "--skip-git"], { cwd: workspace, env })
	if (scaffold.code !== 0) return { ok: false, stage: "scaffold", output: scaffold.output }

	const first = await run("node", [cli, "add", "number-input"], { cwd, env })
	if (first.code !== 0) return { ok: false, stage: "add number-input", output: first.output }
	const second = await run("node", [cli, "add", "number-slider"], { cwd, env })
	if (second.code !== 0) return { ok: false, stage: "add number-slider", output: second.output }
	if (!existsSync(join(cwd, "src/components/substrate/number-slider.tsx"))) {
		return { ok: false, stage: "add number-slider", output: `number-slider.tsx was not written\n${second.output}` }
	}

	const check = await run("npx", ["tsc", "-b"], { cwd, env })
	if (check.code !== 0) return { ok: false, stage: "typecheck", output: check.output }
	return { ok: true }
}

function runCase(name) {
	if (name === "all-items") return allItems()
	if (name === "cli-add") return cliAdd()
	if (name === "cli-create") {
		return scaffoldAndBuild(name, [join(root, "packages/cli/dist/index.js"), "create", name, "--surface", "blank", "--skip-git", "--package-manager", "npm"])
	}
	return scaffoldAndBuild(name, [join(root, "packages/create-substrate/dist/index.js"), name, "--surface", name, "--pm", "npm", "--skip-git"])
}

const results = new Map()
const queue = [...cases]
await Promise.all(
	Array.from({ length: CONCURRENCY }, async () => {
		while (queue.length > 0) {
			const name = queue.shift()
			const result = await runCase(name)
			results.set(name, result)
			console.log(`${result.ok ? "PASS" : "FAIL"}  ${name}${result.ok ? "" : `  (${result.stage})`}`)
			if (!result.ok) {
				console.log(`\n--- ${name}: ${result.stage} ---\n${result.output.trim().split("\n").slice(-60).join("\n")}\n`)
			}
		}
	}),
)
server.close()
await browser.close()

const failures = cases.filter((name) => !results.get(name).ok)
if (failures.length > 0) {
	console.log(`\n${failures.length} of ${cases.length} failed. Projects kept in ${workspace}`)
	process.exit(1)
}
if (keep) console.log(`\nProjects kept in ${workspace}`)
else rmSync(workspace, { recursive: true, force: true })
console.log(`\nAll ${cases.length} passed`)
