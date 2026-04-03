import { existsSync } from "node:fs"
import { join } from "node:path"

export type PackageManager = "npm" | "pnpm" | "bun"

export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) {
    return "bun"
  }
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm"
  }
  return "npm"
}

export function getInstallCommand(pm: PackageManager): string {
  return `${pm} install`
}

export function getRunCommand(pm: PackageManager, script: string): string {
  if (pm === "npm") return `npm run ${script}`
  return `${pm} ${script}`
}
