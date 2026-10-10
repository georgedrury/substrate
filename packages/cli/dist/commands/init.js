import { readFileSync } from "node:fs";
import { join } from "node:path";
import { copyDir, exists, writeFile, resolveSkillsDir, listDirs, } from "../utils/fs.js";
import { log } from "../utils/logger.js";
const CLI_PACKAGE = "@substrate-kit/cli";
const CLI_RANGE = "^0.1.1";
function claudeMd() {
    return `# Substrate

This project uses [Substrate](https://substrate.georgedrury.co.uk) — a creative app framework that provides scaffold (toolbar, panels, panes, stores, shortcuts) around different surface types.

## Skills

Substrate skills are installed in \`.claude/skills/\`. They are organised into two groups:

### Surface guides (how to build)

- **scaffold-playground** — bootstrapping a new playground
- **canvas-2d** / **3d-scene** / **animation** / **image-generation** / **data-visualisation** — surface-specific architecture
- **composing-panels** / **wire-interactions** / **create-custom-tool** / **theming** — workflow guides
- **install-components** — full catalogue of available components + how to install via \`substrate-kit add\`

### Component reference (what to use)

- **substrate-scaffold** — Toolbar, Panel, Pane, DocumentTabs, StatusBar, ZoomControls, Breadcrumbs, Resizer
- **substrate-controls** — NumberInput, Slider, NumberSlider, Select, Toggle, TextArea, ColourPicker, ActionControls
- **substrate-canvas** — useViewport, useSelection, useDragReorder, snap, boundingBox, hit testing
- **substrate-nodes** — Node cards, typed ports, port colour theming
- **substrate-feedback** — Toast, ProgressBar, Badge, EmptyState, CommandPalette, ContextMenu, ShortcutOverlay
- **substrate-interaction** — useUndoable, useClipboard, createKeyboardShortcuts, HistoryControls, LayerList, TreeList

## Install components

**Always prefer existing Substrate components over writing custom ones.** Substrate ships sliders, number inputs, toggles, colour pickers, context menus, command palettes, toolbars, panels, timelines, and more — see the \`install-components\` skill for the full catalogue.

\`\`\`bash
# Core scaffold
npx substrate-kit add design-canvas toolbar panel pane action slider

# Surface components
npx substrate-kit add surface timeline gallery colour-picker easing-curve-editor

# Interactive picker (no args)
npx substrate-kit add
\`\`\`

Do **not** run \`npx shadcn@latest add\` directly for Substrate components — always go through \`substrate-kit add\`.

## Registry

Components are installed from \`substrate.georgedrury.co.uk/r/\` via the Substrate CLI, which wraps shadcn under the hood.
`;
}
function componentsJson() {
    return JSON.stringify({
        $schema: "https://ui.shadcn.com/schema.json",
        style: "radix-mira",
        rsc: true,
        tsx: true,
        tailwind: {
            config: "",
            css: "app/globals.css",
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
        registries: {
            "@substrate": "https://substrate.georgedrury.co.uk/r/{name}",
        },
    }, null, 2);
}
export async function init(options = {}) {
    const cwd = process.cwd();
    const { force = false, skipComponentsJson = false } = options;
    log.title("Initialising Substrate");
    // 1. Copy skills
    const skillsSource = resolveSkillsDir();
    const skillsDest = join(cwd, ".claude", "skills");
    const skillNames = listDirs(skillsSource);
    if (skillNames.length === 0) {
        log.error("No skills found in the bundled skills directory");
        process.exit(1);
    }
    let copiedCount = 0;
    let skippedCount = 0;
    for (const skillName of skillNames) {
        const dest = join(skillsDest, skillName);
        if (exists(dest) && !force) {
            skippedCount++;
            continue;
        }
        copyDir(join(skillsSource, skillName), dest);
        copiedCount++;
        log.step(`Installed skill: ${skillName}`);
    }
    if (copiedCount > 0) {
        log.success(`Installed ${copiedCount} skill${copiedCount === 1 ? "" : "s"}`);
    }
    if (skippedCount > 0) {
        log.warn(`Skipped ${skippedCount} existing skill${skippedCount === 1 ? "" : "s"} (use --force to overwrite)`);
    }
    // 2. Generate CLAUDE.md
    const claudeMdPath = join(cwd, "CLAUDE.md");
    if (exists(claudeMdPath) && !force) {
        log.warn("CLAUDE.md already exists (use --force to overwrite)");
    }
    else {
        writeFile(claudeMdPath, claudeMd());
        log.success("Created CLAUDE.md");
    }
    // 3. Write components.json
    if (!skipComponentsJson) {
        const componentsJsonPath = join(cwd, "components.json");
        if (exists(componentsJsonPath) && !force) {
            log.warn("components.json already exists (use --force to overwrite)");
        }
        else {
            writeFile(componentsJsonPath, componentsJson());
            log.success("Created components.json");
        }
    }
    // 4. Write .mcp.json
    const mcpJsonPath = join(cwd, ".mcp.json");
    if (exists(mcpJsonPath) && !force) {
        log.warn(".mcp.json already exists (use --force to overwrite)");
    }
    else {
        const mcpConfig = {
            mcpServers: {
                substrate: {
                    command: "npx",
                    args: ["-y", "@substrate-kit/cli", "mcp"],
                },
            },
        };
        writeFile(mcpJsonPath, JSON.stringify(mcpConfig, null, 2) + "\n");
        log.success("Created .mcp.json (Substrate MCP server registered)");
    }
    // 5. Add the CLI as a dev dependency so `npx substrate-kit` resolves locally
    const packageJsonPath = join(cwd, "package.json");
    if (exists(packageJsonPath)) {
        const raw = readFileSync(packageJsonPath, "utf-8");
        const pkg = JSON.parse(raw);
        if (!pkg.dependencies?.[CLI_PACKAGE] && !pkg.devDependencies?.[CLI_PACKAGE]) {
            pkg.devDependencies = { ...pkg.devDependencies, [CLI_PACKAGE]: CLI_RANGE };
            const indent = raw.includes("\n\t") ? "\t" : 2;
            writeFile(packageJsonPath, JSON.stringify(pkg, null, indent) + "\n");
            log.success(`Added ${CLI_PACKAGE} to devDependencies (install to use npx substrate-kit)`);
        }
    }
    log.blank();
    log.info("Substrate is ready. Claude can now use the skills for creative app development.");
}
//# sourceMappingURL=init.js.map