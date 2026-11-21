import { Command } from "commander"
import { init } from "./commands/init.js"
import { add } from "./commands/add.js"
import { docs } from "./commands/docs.js"
import { doctor } from "./commands/doctor.js"
import { update } from "./commands/update.js"
import { startServer } from "./mcp/server.js"
import { VERSION } from "./utils/version.js"

export function createCli(): Command {
	const program = new Command()

	program
		.name("substrate-kit")
		.description("Add Substrate components, skills and docs to a project")
		.version(VERSION)

	program
		.command("init")
		.description("Set up Substrate in the current project: skills, agent guidance, components.json and the MCP server")
		.option("--force", "Refresh existing skills and overwrite existing Substrate settings", false)
		.option("--skip-components-json", "Don't touch components.json", false)
		.action(async (options) => {
			await init({
				force: options.force,
				skipComponentsJson: options.skipComponentsJson,
			})
		})

	program
		.command("add")
		.description("Install Substrate components from substrate.georgedrury.co.uk")
		.argument("[components...]", "Component names to install (opens picker if omitted)")
		.option("--category <name>", "Install all components in a category")
		.option("--list-categories", "Show available categories and their components", false)
		.option("-y, --yes", "Skip shadcn's confirmation prompts", false)
		.action(async (components: string[], options) => {
			await add(components, { category: options.category, listCategories: options.listCategories, yes: options.yes })
		})

	program
		.command("docs")
		.description("Show component documentation: props, theme variables and usage")
		.argument("[component]", "Component name or search query")
		.option("--list", "List all components", false)
		.option("--open", "Open the docs page in your browser", false)
		.action(async (component: string | undefined, options) => {
			await docs(component, { list: options.list, open: options.open })
		})

	program
		.command("doctor")
		.description("Check which installed Substrate components are behind the registry or edited locally")
		.option("--json", "Print the report as JSON", false)
		.option("--check", "Exit with an error if anything needs attention (for CI)", false)
		.option("--adopt", "Start tracking the Substrate files already in this project", false)
		.option("--current", "With --adopt: treat them as matching the registry now (true straight after an install)", false)
		.action(async (options) => {
			await doctor({ json: options.json, check: options.check, adopt: options.adopt, current: options.current })
		})

	program
		.command("update")
		.description("Update installed components that are behind the registry")
		.argument("[components...]", "Components to update (all that are behind if omitted)")
		.option("--force", "Also replace components you edited or whose version is unknown, after backing them up", false)
		.option("--dry-run", "Show what would change without changing it", false)
		.action(async (components: string[], options) => {
			await update(components, { force: options.force, dryRun: options.dryRun })
		})

	program
		.command("mcp")
		.description("Start the Substrate MCP server (stdio transport)")
		.action(async () => {
			await startServer()
		})

	return program
}
