import { join } from "node:path";
import chalk from "chalk";
import { ensureDir, writeFile, exists, copyDir, listDirs, resolveSkillsDir } from "./utils/fs.js";
import { exec, execSilent } from "./utils/shell.js";
import { log } from "./utils/logger.js";
import { getInstallCommand } from "./utils/detect-pm.js";
import { surfaces } from "./surfaces/index.js";
const REGISTRY_BASE = "https://substrate.georgedrury.co.uk/r";
function printBanner() {
    const banner = [
        "┌──────────────────────────────────┐",
        "│  ▓▓▓  substrate  ▓▓▓            │",
        "│  creative app framework          │",
        "└──────────────────────────────────┘",
    ];
    console.log();
    for (const line of banner) {
        console.log(chalk.bold(`  ${line}`));
    }
    console.log();
}
export async function scaffold(projectName, options) {
    const { surface, packageManager, skipInstall = false, skipGit = false } = options;
    const projectDir = join(process.cwd(), projectName);
    const config = surfaces[surface];
    if (exists(projectDir)) {
        log.error(`Directory "${projectName}" already exists`);
        process.exit(1);
    }
    printBanner();
    log.title(`Creating Substrate playground: ${projectName}`);
    log.step(`Surface: ${surface}`);
    log.step(`Package manager: ${packageManager}`);
    log.blank();
    // 1. Scaffold project files
    ensureDir(projectDir);
    log.step("Scaffolding project files...");
    writeFile(join(projectDir, "package.json"), packageJson(projectName, config, options));
    writeFile(join(projectDir, "tsconfig.json"), tsconfig());
    writeFile(join(projectDir, "tsconfig.app.json"), tsconfigApp());
    writeFile(join(projectDir, "vite.config.ts"), viteConfig());
    writeFile(join(projectDir, "index.html"), indexHtml(projectName));
    writeFile(join(projectDir, ".gitignore"), gitignore());
    writeFile(join(projectDir, "src/main.tsx"), mainTsx());
    writeFile(join(projectDir, "src/App.tsx"), config.app());
    writeFile(join(projectDir, "src/globals.css"), globalsCss(config));
    writeFile(join(projectDir, "src/lib/utils.ts"), utilsTs());
    writeFile(join(projectDir, "src/vite-env.d.ts"), viteEnvDts());
    writeFile(join(projectDir, "components.json"), componentsJson());
    // Write any extra surface-specific files
    if (config.files) {
        for (const [path, content] of Object.entries(config.files)) {
            writeFile(join(projectDir, path), content());
        }
    }
    log.success("Project files created");
    // 2. Install dependencies
    if (!skipInstall) {
        log.step(`Installing dependencies with ${packageManager}...`);
        exec(getInstallCommand(packageManager), { cwd: projectDir });
        log.success("Dependencies installed");
        // 3. Install Substrate components
        log.step("Installing Substrate components...");
        for (const component of config.components) {
            const url = `${REGISTRY_BASE}/${component}`;
            try {
                exec(`npx shadcn@latest add ${url}`, { cwd: projectDir });
                log.step(`  ${component}`);
            }
            catch {
                log.warn(`  Failed to install ${component} — add later with: npx substrate-kit add ${component}`);
            }
        }
        log.success("Substrate components installed");
    }
    else {
        log.warn("Skipping dependency installation (--skip-install)");
    }
    // 4. Install skills
    log.step("Installing skills...");
    try {
        const skillsSource = resolveSkillsDir();
        const skillsDest = join(projectDir, ".claude", "skills");
        const skillNames = listDirs(skillsSource);
        for (const skillName of skillNames) {
            copyDir(join(skillsSource, skillName), join(skillsDest, skillName));
        }
        log.success(`Installed ${skillNames.length} skills`);
    }
    catch {
        log.warn("Could not install skills — run 'npx substrate-kit init' to add them later");
    }
    // 5. Write CLAUDE.md
    writeFile(join(projectDir, "CLAUDE.md"), claudeMd());
    log.success("Created CLAUDE.md");
    // 6. Write .mcp.json
    writeFile(join(projectDir, ".mcp.json"), mcpJson());
    log.success("Created .mcp.json");
    // 8. Initialise git
    if (!skipGit) {
        log.step("Initialising git repository...");
        execSilent("git init", projectDir);
        execSilent("git add -A", projectDir);
        execSilent('git commit -m "Initial commit from create-substrate"', projectDir);
        log.success("Git repository initialised");
    }
    // Done
    log.title("Your Substrate playground is ready");
    log.info(`  cd ${projectName}`);
    log.info(`  ${packageManager === "npm" ? "npm run" : packageManager} dev`);
    log.blank();
    log.info("Open the project in Claude Code or Cowork to start building with Substrate skills.");
    log.blank();
}
// --- Template functions ---
function packageJson(name, config, options) {
    const deps = {
        react: "^19.1.0",
        "react-dom": "^19.1.0",
        "class-variance-authority": "^0.7.1",
        clsx: "^2.1.1",
        "tailwind-merge": "^3.3.1",
        "@remixicon/react": "^4.9.0",
        "radix-ui": "^1.4.3",
        zustand: "^5.0.12",
        ...config.extraDeps,
    };
    const devDeps = {
        typescript: "^5",
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        vite: "^6.3.0",
        "@vitejs/plugin-react": "^4.4.0",
        tailwindcss: "^4",
        "@tailwindcss/vite": "^4",
        ...config.extraDevDeps,
    };
    return JSON.stringify({
        name,
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
            dev: "vite",
            build: "tsc -b && vite build",
            preview: "vite preview",
        },
        dependencies: deps,
        devDependencies: devDeps,
    }, null, 2);
}
function tsconfig() {
    return JSON.stringify({
        compilerOptions: {
            paths: {
                "@/*": ["./src/*"],
            },
        },
        files: [],
        references: [{ path: "./tsconfig.app.json" }],
    }, null, 2);
}
function tsconfigApp() {
    return JSON.stringify({
        compilerOptions: {
            target: "ES2020",
            useDefineForClassFields: true,
            lib: ["ES2020", "DOM", "DOM.Iterable"],
            module: "ESNext",
            skipLibCheck: true,
            moduleResolution: "bundler",
            allowImportingTsExtensions: true,
            isolatedModules: true,
            moduleDetection: "force",
            noEmit: true,
            jsx: "react-jsx",
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
            noUncheckedSideEffectImports: true,
            paths: {
                "@/*": ["./src/*"],
            },
        },
        include: ["src"],
    }, null, 2);
}
function viteConfig() {
    return `import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
`;
}
function indexHtml(title) {
    return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}
function mainTsx() {
    return `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;
}
function globalsCss(config) {
    const extra = config.cssVars ? `\n${config.cssVars}` : "";
    return `@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  /* Substrate */
  --color-canvas: var(--canvas, var(--color-background));
  --color-canvas-foreground: var(--canvas-foreground, var(--color-foreground-muted));
  --color-panel: var(--panel, var(--color-card));
  --color-panel-foreground: var(--panel-foreground, var(--color-card-foreground));
}

:root {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --radius: 0.625rem;
  /* Substrate */
  --canvas: oklch(17.764% 0.00002 271.152);
  --canvas-foreground: oklch(0.708 0 0);
  --panel: oklch(0.205 0 0);
  --panel-foreground: oklch(0.985 0 0);${extra}
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
}
function utilsTs() {
    return `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
}
function gitignore() {
    return `node_modules/
dist/
.DS_Store
*.pem
.env
.env*.local
*.tsbuildinfo
`;
}
function viteEnvDts() {
    return `/// <reference types="vite/client" />
`;
}
function componentsJson() {
    return JSON.stringify({
        $schema: "https://ui.shadcn.com/schema.json",
        style: "radix-mira",
        rsc: false,
        tsx: true,
        tailwind: {
            config: "",
            css: "src/globals.css",
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
function mcpJson() {
    return JSON.stringify({
        mcpServers: {
            substrate: {
                command: "npx",
                args: ["-y", "@substrate-kit/cli", "mcp"],
            },
        },
    }, null, 2) + "\n";
}
function claudeMd() {
    return `# Substrate

This project uses [Substrate](https://substrate.georgedrury.co.uk) — a creative app framework that provides scaffold (toolbar, panels, panes, stores, shortcuts) around different surface types.

## Skills

Substrate skills are installed in \`.claude/skills/\`. They are organised into two groups:

### Surface guides (how to build)

- **scaffold-playground** — bootstrapping a new playground
- **canvas-2d** / **3d-scene** / **animation** / **image-generation** / **data-visualisation** — surface-specific architecture
- **composing-panels** / **wire-interactions** / **create-custom-tool** / **theming** — workflow guides

### Component reference (what to use)

- **substrate-scaffold** — Toolbar, Panel, Pane, DocumentTabs, StatusBar, ZoomControls, Breadcrumbs, Resizer
- **substrate-controls** — NumberInput, Slider, NumberSlider, Select, Toggle, TextArea, ColourPicker, ActionControls
- **substrate-canvas** — useViewport, useSelection, useDragReorder, snap, boundingBox, hit testing
- **substrate-nodes** — Node cards, typed ports, port colour theming
- **substrate-feedback** — Toast, ProgressBar, Badge, EmptyState, CommandPalette, ContextMenu, ShortcutOverlay
- **substrate-interaction** — useUndoable, useClipboard, createKeyboardShortcuts, HistoryControls, LayerList, TreeList

## Install components

\`\`\`bash
# Core scaffold
npx substrate-kit add design-canvas toolbar panel pane action slider

# Surface components
npx substrate-kit add surface timeline gallery colour-picker easing-curve-editor
\`\`\`

## Registry

Components are installed from \`substrate.georgedrury.co.uk/r/\` via the shadcn CLI.
`;
}
//# sourceMappingURL=scaffold.js.map