import { Command } from "commander";
import { init } from "./commands/init.js";
import { add } from "./commands/add.js";
import { create } from "./commands/create.js";
import { docs } from "./commands/docs.js";
import { browse } from "./commands/browse.js";
import { variables } from "./commands/variables.js";
import { startServer } from "./mcp/server.js";
export function createCli() {
    const program = new Command();
    program
        .name("substrate-kit")
        .description("Scaffold interactive canvas playgrounds with Substrate primitives")
        .version("0.1.3");
    program
        .command("init")
        .description("Initialise Substrate skills and configuration in the current project")
        .option("--force", "Overwrite existing skills and CLAUDE.md", false)
        .option("--skip-components-json", "Don't touch components.json", false)
        .action(async (options) => {
        await init({
            force: options.force,
            skipComponentsJson: options.skipComponentsJson,
        });
    });
    program
        .command("create")
        .description("Create a new Substrate playground project (alias for npx create-substrate)")
        .argument("[project-name]", "Name for the new project")
        .option("--surface <type>", "Surface type (canvas-2d, 3d-scene, animation, node-editor, data-vis, image-gen, blank)")
        .option("--skip-install", "Skip dependency installation", false)
        .option("--skip-git", "Don't initialise git", false)
        .option("--package-manager <pm>", "Force package manager (npm, pnpm, bun)")
        .action((projectName, options) => {
        create(projectName, {
            surface: options.surface,
            skipInstall: options.skipInstall,
            skipGit: options.skipGit,
            packageManager: options.packageManager,
        });
    });
    program
        .command("add")
        .description("Install Substrate components from substrate.georgedrury.co.uk")
        .argument("[components...]", "Component names to install (opens picker if omitted)")
        .option("--category <name>", "Install all components in a category")
        .option("--list-categories", "Show available categories and their components", false)
        .action(async (components, options) => {
        await add(components, { category: options.category, listCategories: options.listCategories });
    });
    program
        .command("docs")
        .description("View component documentation in the terminal")
        .argument("[component]", "Component name or search query")
        .option("--list", "List all components", false)
        .action(async (component, options) => {
        await docs(component, { list: options.list });
    });
    program
        .command("browse")
        .description("Open component docs in the browser")
        .argument("[component]", "Component name (opens docs home if omitted)")
        .action((component) => {
        browse(component);
    });
    program
        .command("variables")
        .description("Show theme override variables for a component")
        .argument("[component]", "Component name (e.g. panel, design-canvas)")
        .option("--all", "List all components with theme variables", false)
        .action(async (component, options) => {
        await variables(component, { all: options.all });
    });
    program
        .command("mcp")
        .description("Start the Substrate MCP server (stdio transport)")
        .action(async () => {
        await startServer();
    });
    return program;
}
//# sourceMappingURL=cli.js.map