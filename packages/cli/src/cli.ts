import { Command } from "commander"
import { init } from "./commands/init.js"
import { add } from "./commands/add.js"
import { docs } from "./commands/docs.js"
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
		.action(async (components: string[], options) => {
			await add(components, { category: options.category, listCategories: options.listCategories })
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
		.command("mcp")
		.description("Start the Substrate MCP server (stdio transport)")
		.action(async () => {
			await startServer()
		})

	return program
}
