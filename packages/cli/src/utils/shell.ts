import { execSync } from "node:child_process"
import { log } from "./logger.js"

export interface ExecOptions {
  cwd?: string
  silent?: boolean
}

export function exec(command: string, options: ExecOptions = {}): string {
  const { cwd, silent = false } = options
  try {
    const result = execSync(command, {
      cwd,
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    })
    return typeof result === "string" ? result.trim() : ""
  } catch (error) {
    if (!silent) {
      log.error(`Command failed: ${command}`)
    }
    throw error
  }
}

export function execSilent(command: string, cwd?: string): string | null {
  try {
    return exec(command, { cwd, silent: true })
  } catch {
    return null
  }
}
