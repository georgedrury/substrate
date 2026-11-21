#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadRegistry } from "../registry.js";
import { VERSION } from "../utils/version.js";
import { handleSearch } from "./tools/search.js";
import { handleGetComponent } from "./tools/get-component.js";
import { handleInstall } from "./tools/install.js";
import { handleGetDocs } from "./tools/get-docs.js";
import { handleCheckComponents, handleUpdateComponents } from "./tools/project-components.js";
export async function startServer() {
    const registry = await loadRegistry();
    const server = new McpServer({
        name: "substrate",
        version: VERSION,
    });
    server.tool("search_components", "Search the Substrate component registry by keyword, category, or description. Returns matching components with name, description, and category.", {
        query: z.string().optional().describe("Free-text search against component name, title, and description"),
        category: z.string().optional().describe("Filter by category: substrate, ui, canvas, lib, store"),
    }, async (args) => handleSearch(registry, args));
    server.tool("get_component", "Get details for a Substrate component: CSS variables and the theme override keys, dependencies, usage example, lineage, install command and docs link.", {
        name: z.string().describe("Component name (e.g. design-canvas, toolbar, panel)"),
    }, async (args) => handleGetComponent(registry, args));
    server.tool("install_components", "Install one or more Substrate components from substrate.georgedrury.co.uk into the current project. Runs shadcn add behind the scenes.", {
        components: z.array(z.string()).describe("Component names to install (e.g. ['design-canvas', 'toolbar', 'panel'])"),
    }, async (args) => handleInstall(registry, args));
    server.tool("get_docs", "Get the full documentation page for a component, hook or utility: install, usage, every prop and option, and theme variables. Use after get_component when you need to know how to use it.", {
        name: z.string().describe("Component, hook or utility name (e.g. controls, controls-timeline, use-undoable)"),
    }, async (args) => handleGetDocs(registry, args));
    server.tool("check_components", "Check which Substrate components installed in this project are behind the registry or have been edited locally. Read-only. Uses substrate.lock.json.", {}, async () => handleCheckComponents());
    server.tool("update_components", "Update Substrate components in this project that are behind the registry. Only components you have not edited are replaced; edited ones are left alone and reported. Use dry_run to preview.", {
        components: z.array(z.string()).optional().describe("Component names to update (omit for every one that is behind)"),
        dry_run: z.boolean().optional().describe("Report what would change without changing anything"),
    }, async (args) => handleUpdateComponents(args));
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
const isDirectRun = process.argv[1]?.includes("mcp/server");
if (isDirectRun) {
    startServer().catch((err) => {
        console.error("Failed to start Substrate MCP server:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map