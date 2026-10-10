#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadRegistry } from "./registry.js";
import { handleSearch } from "./tools/search.js";
import { handleGetComponent } from "./tools/get-component.js";
import { handleInstall } from "./tools/install.js";
import { handleGetThemeVariables } from "./tools/theme.js";
export async function startServer() {
    const registry = await loadRegistry();
    const server = new McpServer({
        name: "substrate",
        version: "0.1.3",
    });
    server.tool("search_components", "Search the Substrate component registry by keyword, category, or description. Returns matching components with name, description, and category.", {
        query: z.string().optional().describe("Free-text search against component name, title, and description"),
        category: z.string().optional().describe("Filter by category: substrate, ui, canvas, lib, store"),
    }, async (args) => handleSearch(registry, args));
    server.tool("get_component", "Get full details for a specific Substrate component including CSS variables, dependencies, usage example, and lineage.", {
        name: z.string().describe("Component name (e.g. design-canvas, toolbar, panel)"),
    }, async (args) => handleGetComponent(registry, args));
    server.tool("install_components", "Install one or more Substrate components from substrate.georgedrury.co.uk into the current project. Runs shadcn add behind the scenes.", {
        components: z.array(z.string()).describe("Component names to install (e.g. ['design-canvas', 'toolbar', 'panel'])"),
    }, async (args) => handleInstall(registry, args));
    server.tool("get_theme_variables", "Get the CSS variable map for Substrate components, showing the full fallback chain. Useful for building or customising themes.", {
        components: z.array(z.string()).optional().describe("Component names to get variables for (omit for all)"),
    }, async (args) => handleGetThemeVariables(registry, args));
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