import { join } from "node:path";
import { copyDir, exists, writeFile, resolveSkillsDir, listDirs, } from "../utils/fs.js";
import { log } from "../utils/logger.js";
function claudeMd() {
    return `# Substrate

This project uses [Substrate](https://substrate.georgedrury.co.uk) — a creative app framework that provides chrome (toolbar, panels, panes, stores, shortcuts) around different surface types.

## Skills

Substrate skills are installed in \`.claude/skills/\`. They teach Claude how to:

- Scaffold creative apps with different surfaces (2D canvas, 3D scenes, animation, image generation, data visualisation)
- Compose panels and property editors
- Wire interactions and keyboard shortcuts
- Theme components and canvas rendering

## Install components

\`\`\`bash
# Core chrome
npx substrate add design-canvas toolbar panel pane action slider

# Surface components
npx substrate add surface timeline gallery colour-picker easing-curve-editor
\`\`\`

## Registry

Components are installed from \`substrate.georgedrury.co.uk/r/\` via the shadcn CLI.
`;
}
function componentsJson() {
    return JSON.stringify({
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: true,
        tsx: true,
        tailwind: {
            config: "",
            css: "app/globals.css",
            baseColor: "neutral",
            cssVariables: true,
        },
        aliases: {
            components: "@/components",
            utils: "@/lib/utils",
            ui: "@/components/ui",
            lib: "@/lib",
            hooks: "@/hooks",
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
                    args: ["-y", "substrate", "mcp"],
                },
            },
        };
        writeFile(mcpJsonPath, JSON.stringify(mcpConfig, null, 2) + "\n");
        log.success("Created .mcp.json (Substrate MCP server registered)");
    }
    log.blank();
    log.info("Substrate is ready. Claude can now use the skills for creative app development.");
}
//# sourceMappingURL=init.js.map