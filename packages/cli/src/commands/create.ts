import { join } from "node:path"
import chalk from "chalk"
import { exists, ensureDir, writeFile } from "../utils/fs.js"
import { exec, execSilent } from "../utils/shell.js"
import { log } from "../utils/logger.js"
import {
	detectPackageManager,
	getInstallCommand,
	type PackageManager,
} from "../utils/detect-pm.js"
import { init } from "./init.js"

function printBanner(): void {
	const banner = [
		"┌─────────────────────────────┐",
		"│  ▓▓▓  substrate  ▓▓▓       │",
		"│  canvas playground toolkit  │",
		"└─────────────────────────────┘",
	]
	console.log()
	for (const line of banner) {
		console.log(chalk.bold(`  ${line}`))
	}
	console.log()
}

const REGISTRY_BASE = "https://substrate.georgedrury.co.uk/r"

const CORE_COMPONENTS = [
	"design-canvas",
	"toolbar",
	"panel",
	"pane",
	"action",
	"slider",
]

export interface CreateOptions {
	skipInstall?: boolean
	skipGit?: boolean
	packageManager?: PackageManager
}

export async function create(
	projectName: string,
	options: CreateOptions = {},
): Promise<void> {
	const { skipInstall = false, skipGit = false, packageManager } = options

	const projectDir = join(process.cwd(), projectName)

	if (exists(projectDir)) {
		log.error(`Directory "${projectName}" already exists`)
		process.exit(1)
	}

	printBanner()
	log.title(`Creating Substrate playground: ${projectName}`)

	// 1. Create project directory
	ensureDir(projectDir)

	// 2. Write template files
	log.step("Scaffolding project files...")

	// package.json
	writeFile(join(projectDir, "package.json"), packageJson(projectName))

	// tsconfig.json
	writeFile(join(projectDir, "tsconfig.json"), tsconfig())

	// next.config.ts
	writeFile(join(projectDir, "next.config.ts"), nextConfig())

	// postcss.config.mjs
	writeFile(join(projectDir, "postcss.config.mjs"), postcssConfig())

	// .gitignore
	writeFile(join(projectDir, ".gitignore"), gitignore())

	// app/globals.css
	writeFile(join(projectDir, "app/globals.css"), globalsCss())

	// app/layout.tsx
	writeFile(join(projectDir, "app/layout.tsx"), rootLayout(projectName))

	// app/page.tsx (playground page)
	writeFile(join(projectDir, "app/page.tsx"), playgroundPage())

	// lib/utils.ts
	writeFile(join(projectDir, "lib/utils.ts"), utilsTs())

	log.success("Project files created")

	// 3. Install dependencies
	if (!skipInstall) {
		const pm = packageManager ?? detectPackageManager(projectDir)
		log.step(`Installing dependencies with ${pm}...`)
		exec(getInstallCommand(pm), { cwd: projectDir })
		log.success("Dependencies installed")

		// 4. Install core Substrate components
		log.step("Installing Substrate components...")
		for (const component of CORE_COMPONENTS) {
			const url = `${REGISTRY_BASE}/${component}`
			try {
				exec(`npx shadcn@latest add ${url}`, { cwd: projectDir })
				log.step(`  ${component}`)
			} catch {
				log.warn(
					`  Failed to install ${component} — you can add it later with: substrate add ${component}`,
				)
			}
		}
		log.success("Substrate components installed")
	} else {
		log.warn("Skipping dependency installation (--skip-install)")
	}

	// 5. Run init to install skills and CLAUDE.md
	const originalCwd = process.cwd()
	process.chdir(projectDir)
	await init({ force: true, skipComponentsJson: true })
	process.chdir(originalCwd)

	// 6. Initialise git
	if (!skipGit) {
		log.step("Initialising git repository...")
		execSilent("git init", projectDir)
		execSilent("git add -A", projectDir)
		execSilent(
			'git commit -m "Initial commit from substrate create"',
			projectDir,
		)
		log.success("Git repository initialised")
	}

	// Done
	log.title("Your Substrate playground is ready")
	log.info(`  cd ${projectName}`)
	log.info("  npm run dev")
	log.blank()
	log.info(
		"Open the project in Claude Code or Cowork to start building with Substrate skills.",
	)
	log.blank()
}

function packageJson(name: string): string {
	return JSON.stringify(
		{
			name,
			version: "0.1.0",
			private: true,
			scripts: {
				dev: "next dev",
				build: "next build",
				start: "next start",
				lint: "eslint",
			},
			dependencies: {
				next: "^15.5.0",
				react: "^19.1.0",
				"react-dom": "^19.1.0",
				"class-variance-authority": "^0.7.1",
				clsx: "^2.1.1",
				"tailwind-merge": "^3.3.1",
				"@remixicon/react": "^4.9.0",
				"radix-ui": "^1.4.3",
				zustand: "^5.0.12",
			},
			devDependencies: {
				typescript: "^5",
				"@types/node": "^20",
				"@types/react": "^19",
				"@types/react-dom": "^19",
				tailwindcss: "^4",
				"@tailwindcss/postcss": "^4",
				"tw-animate-css": "^1.4.0",
				eslint: "^9",
				"eslint-config-next": "^15.5.0",
			},
		},
		null,
		2,
	)
}

function tsconfig(): string {
	return JSON.stringify(
		{
			compilerOptions: {
				target: "ES2017",
				lib: ["dom", "dom.iterable", "esnext"],
				allowJs: true,
				skipLibCheck: true,
				strict: true,
				noEmit: true,
				esModuleInterop: true,
				module: "esnext",
				moduleResolution: "bundler",
				resolveJsonModule: true,
				isolatedModules: true,
				jsx: "preserve",
				incremental: true,
				plugins: [{ name: "next" }],
				paths: {
					"@/*": ["./*"],
				},
			},
			include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
			exclude: ["node_modules"],
		},
		null,
		2,
	)
}

function nextConfig(): string {
	return `import type { NextConfig } from "next"

const nextConfig: NextConfig = {}

export default nextConfig
`
}

function postcssConfig(): string {
	return `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
`
}

function gitignore(): string {
	return `node_modules/
.next/
out/
build/
.DS_Store
*.pem
.env
.env*.local
*.tsbuildinfo
next-env.d.ts
`
}

function globalsCss(): string {
	return `@import "tailwindcss";
@import "tw-animate-css";

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
  --canvas: oklch(.97 0.0 0);
  --canvas-foreground: oklch(0.556 0 0);
  --panel: oklch(1 0 0);
  --panel-foreground: oklch(0.145 0 0);
}

.dark {
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
`
}

function rootLayout(projectName: string): string {
	return `import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "${projectName}",
  description: "Built with Substrate",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
`
}

function playgroundPage(): string {
	return `"use client"

import { DesignCanvas } from "@/registry/substrate/canvas/design-canvas"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
  ToolbarSeparator,
} from "@/registry/substrate/components/toolbar"
import { Panel } from "@/registry/substrate/components/panel"
import { useToolStore } from "@/registry/substrate/stores/tool-store"
import { usePanelStore } from "@/registry/substrate/stores/panel-store"
import {
  RiCursorLine,
  RiHand,
  RiSquareLine,
  RiCircleLine,
  RiSubtractLine,
  RiText,
  RiArtboard2Line,
} from "@remixicon/react"

export default function PlaygroundPage() {
  const activeTool = useToolStore((s) => s.activeTool)
  const setTool = useToolStore((s) => s.setTool)
  const leftPanel = usePanelStore((s) => s.leftPanel)
  const rightPanel = usePanelStore((s) => s.rightPanel)

  return (
    <div className="h-screen w-screen">
      {leftPanel && (
        <Panel position="left">
          {/* Add layer panel here */}
        </Panel>
      )}

      <DesignCanvas />

      {rightPanel && (
        <Panel position="right">
          {/* Add properties panel here */}
        </Panel>
      )}

      <Toolbar>
        <ToolbarToggleGroup value={activeTool} onValueChange={setTool}>
          <ToolbarToggle value="select" tooltip="Select" shortcut="V">
            <RiCursorLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="hand" tooltip="Hand" shortcut="H">
            <RiHand className="size-4" />
          </ToolbarToggle>

          <ToolbarSeparator />

          <ToolbarToggle value="rectangle" tooltip="Rectangle" shortcut="R">
            <RiSquareLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="ellipse" tooltip="Ellipse" shortcut="O">
            <RiCircleLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="line" tooltip="Line" shortcut="L">
            <RiSubtractLine className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="text" tooltip="Text" shortcut="T">
            <RiText className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle value="frame" tooltip="Frame" shortcut="F">
            <RiArtboard2Line className="size-4" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>
    </div>
  )
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
