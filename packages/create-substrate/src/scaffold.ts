import { join } from "node:path"
import chalk from "chalk"
import { ensureDir, writeFile, exists, copyDir, listDirs, resolveSkillsDir } from "./utils/fs.js"
import { exec, execSilent } from "./utils/shell.js"
import { log } from "./utils/logger.js"
import { getInstallCommand, type PackageManager } from "./utils/detect-pm.js"
import { CLI_RANGE, agentsSection } from "./utils/package-info.js"
import { surfaces, type SurfaceType } from "./surfaces/index.js"

export interface ScaffoldOptions {
  surface: SurfaceType
  packageManager: PackageManager
  skipInstall?: boolean
  skipGit?: boolean
}

const INSTALL_ATTEMPTS = 3

// SUBSTRATE_REGISTRY_URL points installs at a local registry for testing
const REGISTRY_BASE =
	process.env.SUBSTRATE_REGISTRY_URL ?? "https://substrate.georgedrury.co.uk/r"

function printBanner(): void {
  const banner = [
    "┌──────────────────────────────────┐",
    "│  ▓▓▓  substrate  ▓▓▓            │",
    "│  creative app framework          │",
    "└──────────────────────────────────┘",
  ]
  console.log()
  for (const line of banner) {
    console.log(chalk.bold(`  ${line}`))
  }
  console.log()
}

export async function scaffold(
  projectName: string,
  options: ScaffoldOptions,
): Promise<void> {
  const { surface, packageManager, skipInstall = false, skipGit = false } = options
  const projectDir = join(process.cwd(), projectName)
  const config = surfaces[surface]

  if (exists(projectDir)) {
    log.error(`Directory "${projectName}" already exists`)
    process.exit(1)
  }

  printBanner()
  log.title(`Creating Substrate playground: ${projectName}`)
  log.step(`Surface: ${surface}`)
  log.step(`Package manager: ${packageManager}`)
  log.blank()

  // 1. Scaffold project files
  ensureDir(projectDir)
  log.step("Scaffolding project files...")

  writeFile(join(projectDir, "package.json"), packageJson(projectName, config, options))
  writeFile(join(projectDir, "tsconfig.json"), tsconfig())
  writeFile(join(projectDir, "tsconfig.app.json"), tsconfigApp())
  writeFile(join(projectDir, "vite.config.ts"), viteConfig())
  writeFile(join(projectDir, "index.html"), indexHtml(projectName))
  writeFile(join(projectDir, ".gitignore"), gitignore())
  writeFile(join(projectDir, "src/main.tsx"), mainTsx())
  writeFile(join(projectDir, "src/App.tsx"), config.app())
  writeFile(join(projectDir, "src/globals.css"), globalsCss(config))
  writeFile(join(projectDir, "src/lib/utils.ts"), utilsTs())
  writeFile(join(projectDir, "src/vite-env.d.ts"), viteEnvDts())
  writeFile(join(projectDir, "components.json"), componentsJson())

  // Write any extra surface-specific files
  if (config.files) {
    for (const [path, content] of Object.entries(config.files)) {
      writeFile(join(projectDir, path), content())
    }
  }

  log.success("Project files created")

  const failedComponents: string[] = []
  let installFailed = false

  // 2. Install dependencies
  if (!skipInstall) {
    log.step(`Installing dependencies with ${packageManager}...`)
    try {
      exec(getInstallCommand(packageManager), { cwd: projectDir })
      log.success("Dependencies installed")
    } catch {
      // The project files are already written, so keep going and say how to finish
      installFailed = true
    }
  }

  if (!skipInstall && !installFailed) {
    // 3. Install Substrate components in one call so shared dependencies are
    // resolved once. The project is new, so overwriting is safe and avoids
    // prompts. Retry because one dropped request would otherwise leave a
    // broken project.
    log.step("Installing Substrate components...")
    const urls = config.components.map((component) => `${REGISTRY_BASE}/${component}`)
    let installed = false
    for (let attempt = 1; attempt <= INSTALL_ATTEMPTS && !installed; attempt++) {
      try {
        exec(`npx shadcn@latest add --yes --overwrite ${urls.join(" ")}`, { cwd: projectDir })
        installed = true
      } catch {
        if (attempt < INSTALL_ATTEMPTS) log.warn("  Retrying...")
      }
    }
    if (installed) {
      log.success("Substrate components installed")
    } else {
      failedComponents.push(...config.components)
    }
  } else if (skipInstall) {
    log.warn("Skipping dependency installation (--skip-install)")
  }

  // 4. Install skills
  log.step("Installing skills...")
  try {
    const skillsSource = resolveSkillsDir()
    const skillNames = listDirs(skillsSource)
    // .claude/skills is read by Claude Code, .agents/skills by other agents
    for (const dir of [".claude/skills", ".agents/skills"]) {
      for (const skillName of skillNames) {
        copyDir(join(skillsSource, skillName), join(projectDir, dir, skillName))
      }
    }
    log.success(`Installed ${skillNames.length} skills into .claude/skills and .agents/skills`)
  } catch {
    log.warn("Could not install skills — run 'npx @substrate-kit/cli init' to add them later")
  }

  // 5. Write the agent guidance once in AGENTS.md; CLAUDE.md imports it
  writeFile(join(projectDir, "AGENTS.md"), agentsSection())
  writeFile(join(projectDir, "CLAUDE.md"), "@AGENTS.md\n")
  log.success("Created AGENTS.md and CLAUDE.md")

  // 6. Write .mcp.json
  writeFile(join(projectDir, ".mcp.json"), mcpJson())
  log.success("Created .mcp.json")

  // 8. Initialise git
  if (!skipGit) {
    log.step("Initialising git repository...")
    execSilent("git init", projectDir)
    execSilent("git add -A", projectDir)
    execSilent('git commit -m "Initial commit from create-substrate"', projectDir)
    log.success("Git repository initialised")
  }

  if (installFailed) {
    const components = config.components.join(" ")
    log.blank()
    log.error(`${packageManager} could not install the dependencies. The project was created in ./${projectName}, without its Substrate components.`)
    log.blank()
    log.info("Read the error above first. If it mentions EACCES, EEXIST or permission denied on ~/.npm, the npm cache has files owned by another user, often from an earlier `sudo npm`. Fix it with:")
    log.info("  sudo chown -R $(id -u):$(id -g) ~/.npm")
    log.info("or retry with a throwaway cache:")
    log.info("  npm_config_cache=/tmp/npm-cache npm install")
    log.blank()
    log.info("Then finish the setup:")
    log.info(`  cd ${projectName}`)
    log.info(`  ${getInstallCommand(packageManager)}`)
    log.info(`  npx substrate-kit add ${components}`)
    log.blank()
    process.exitCode = 1
    return
  }

  if (failedComponents.length > 0) {
    log.blank()
    log.error(`These components could not be downloaded: ${failedComponents.join(", ")}`)
    log.error("The project will not build until they are installed. Check your connection, then run:")
    log.info(`  cd ${projectName}`)
    log.info(`  npx substrate-kit add ${failedComponents.join(" ")}`)
    log.blank()
    process.exitCode = 1
    return
  }

  // Done
  log.title("Your Substrate playground is ready")
  log.info(`  cd ${projectName}`)
  log.info(`  ${packageManager === "npm" ? "npm run" : packageManager} dev`)
  log.blank()
  log.info("Open the project in Claude Code or Cowork to start building with Substrate skills.")
  log.blank()
}

// --- Template functions ---

function packageJson(name: string, config: typeof surfaces[SurfaceType], _options: ScaffoldOptions): string {
  const deps: Record<string, string> = {
    react: "^19.1.0",
    "react-dom": "^19.1.0",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "@remixicon/react": "^4.9.0",
    "radix-ui": "^1.4.3",
    zustand: "^5.0.12",
    ...config.extraDeps,
  }

  const devDeps: Record<string, string> = {
    typescript: "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    vite: "^6.3.0",
    "@vitejs/plugin-react": "^4.4.0",
    "@substrate-kit/cli": CLI_RANGE,
    tailwindcss: "^4",
    "@tailwindcss/vite": "^4",
    "tw-animate-css": "^1.4.0",
    shadcn: "^4.1.2",
    ...config.extraDevDeps,
  }

  return JSON.stringify(
    {
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
    },
    null,
    2,
  )
}

function tsconfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        paths: {
          "@/*": ["./src/*"],
        },
      },
      files: [],
      references: [{ path: "./tsconfig.app.json" }],
    },
    null,
    2,
  )
}

function tsconfigApp(): string {
  return JSON.stringify(
    {
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
    },
    null,
    2,
  )
}

function viteConfig(): string {
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
`
}

function indexHtml(title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script>
      // Follow the system theme. To force one, remove this script and set
      // class="dark" (or nothing, for light) on <html>.
      const darkMode = window.matchMedia("(prefers-color-scheme: dark)")
      const applyTheme = () => document.documentElement.classList.toggle("dark", darkMode.matches)
      applyTheme()
      darkMode.addEventListener("change", applyTheme)
    </script>
  </head>
  <body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
}

function mainTsx(): string {
  return `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`
}

function globalsCss(config: typeof surfaces[SurfaceType]): string {
  const extra = config.cssVars ? `\n${config.cssVars}` : ""

  return `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

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
  --color-canvas-foreground: var(--canvas-foreground, var(--color-muted-foreground));
  --color-panel: var(--panel, var(--color-card));
  --color-panel-foreground: var(--panel-foreground, var(--color-card-foreground));
  /* Node port types */
  --color-node-port-number: var(--node-port-number, oklch(0.623 0.214 259.815));
  --color-node-port-colour: var(--node-port-colour, oklch(0.656 0.241 354.308));
  --color-node-port-image: var(--node-port-image, oklch(0.606 0.25 292.717));
  --color-node-port-geometry: var(--node-port-geometry, oklch(0.627 0.194 149.214));
  --color-node-port-text: var(--node-port-text, oklch(0.681 0.162 75.834));
  --color-node-port-boolean: var(--node-port-boolean, oklch(0.646 0.222 41.116));
  --color-node-port-any: var(--node-port-any, var(--muted-foreground));
  /* Node chrome */
  --color-node-bg: var(--node-bg, var(--card));
  --color-node-border: var(--node-border, var(--border));
  --color-node-header: var(--node-header, var(--muted));
  --color-node-selected: var(--node-selected, var(--ring));
  /* Animations used by collapsible-pane and progress-bar */
  --animate-collapsible-down: collapsible-down 150ms ease-out;
  --animate-collapsible-up: collapsible-up 150ms ease-out;
  --animate-progress-indeterminate: progress-indeterminate 1.5s ease-in-out infinite;
}

:root {
  color-scheme: light;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
  /* Substrate */
  --canvas: oklch(0.97 0 0);
  --canvas-foreground: oklch(0.556 0 0);
  --panel: oklch(1 0 0);
  --panel-foreground: oklch(0.145 0 0);${extra}
}

.dark {
  color-scheme: dark;
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
  /* Substrate */
  --canvas: oklch(17.764% 0.00002 271.152);
  --canvas-foreground: oklch(0.708 0 0);
  --panel: oklch(0.205 0 0);
  --panel-foreground: oklch(0.985 0 0);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Honour the system setting: no transitions or animations for people who
   asked for less motion */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@keyframes collapsible-down {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
}

@keyframes collapsible-up {
  from {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}

@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
`
}

function utilsTs(): string {
  return `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
}

function gitignore(): string {
  return `node_modules/
dist/
.DS_Store
*.pem
.env
.env*.local
*.tsbuildinfo
`
}

function viteEnvDts(): string {
  return `/// <reference types="vite/client" />
`
}

function componentsJson(): string {
  return JSON.stringify(
    {
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
    },
    null,
    2,
  )
}

function mcpJson(): string {
  return JSON.stringify(
    {
      mcpServers: {
        substrate: {
          command: "npx",
          args: ["-y", "@substrate-kit/cli", "mcp"],
        },
      },
    },
    null,
    2,
  ) + "\n"
}
