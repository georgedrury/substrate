#!/usr/bin/env node

import { Command } from "commander"
import chalk from "chalk"
import { scaffold } from "./scaffold.js"
import { promptName, promptSurface } from "./prompts.js"
import { SURFACE_OPTIONS, type SurfaceType } from "./surfaces/types.js"
import { detectRunningPackageManager, isPackageManager } from "./utils/detect-pm.js"
import { VERSION } from "./utils/package-info.js"

const DEFAULT_NAME = "my-substrate-app"
const DEFAULT_SURFACE: SurfaceType = "canvas-2d"
const surfaceValues = SURFACE_OPTIONS.map((option) => option.value)

function fail(message: string): never {
  console.error(chalk.red(`  ${message}`))
  process.exit(1)
}

const program = new Command()

program
  .name("create-substrate")
  .description("Scaffold a Substrate creative tool playground")
  .version(VERSION)
  .argument("[project-name]", "Name for the new project")
  .option("--surface <type>", `Surface type (${surfaceValues.join(", ")})`)
  .option("--pm <manager>", "Package manager (npm, pnpm, bun). Defaults to the one that ran this command")
  .option("--skip-install", "Skip dependency installation", false)
  .option("--skip-git", "Don't initialise a git repository", false)
  .option("-y, --yes", `Accept defaults for anything not passed (name ${DEFAULT_NAME}, surface ${DEFAULT_SURFACE})`, false)
  .action(async (projectName: string | undefined, options) => {
    if (options.surface && !surfaceValues.includes(options.surface)) {
      fail(`Unknown surface "${options.surface}". Choose from ${surfaceValues.join(", ")}`)
    }
    if (options.pm && !isPackageManager(options.pm)) {
      fail(`Unknown package manager "${options.pm}". Choose from npm, pnpm, bun`)
    }

    const name = projectName || (options.yes ? DEFAULT_NAME : await promptName())
    const surface: SurfaceType =
      (options.surface as SurfaceType | undefined) ?? (options.yes ? DEFAULT_SURFACE : await promptSurface())
    const pm = options.pm ?? detectRunningPackageManager() ?? "npm"

    await scaffold(name, {
      surface,
      packageManager: pm,
      skipInstall: options.skipInstall,
      skipGit: options.skipGit,
    })
  })

program.parse()
