#!/usr/bin/env node

import { Command } from "commander"
import { scaffold } from "./scaffold.js"
import { promptName, promptSurface, promptPackageManager } from "./prompts.js"
import type { SurfaceType } from "./surfaces/types.js"
import type { PackageManager } from "./utils/detect-pm.js"

const program = new Command()

program
  .name("create-substrate")
  .description("Scaffold a Substrate creative tool playground")
  .version("0.1.6")
  .argument("[project-name]", "Name for the new project")
  .option("--surface <type>", "Surface type (canvas-2d, 3d-scene, animation, node-editor, data-vis, image-gen, blank)")
  .option("--pm <manager>", "Package manager (npm, pnpm, bun)")
  .option("--skip-install", "Skip dependency installation", false)
  .option("--skip-git", "Don't initialise a git repository", false)
  .action(async (projectName: string | undefined, options) => {
    const name = projectName || await promptName()
    const surface = (options.surface as SurfaceType) || await promptSurface()
    const pm = (options.pm as PackageManager) || await promptPackageManager()

    await scaffold(name, {
      surface,
      packageManager: pm,
      skipInstall: options.skipInstall,
      skipGit: options.skipGit,
    })
  })

program.parse()
