import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

// Both src/utils and dist/utils sit two levels below the package root
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

export const PACKAGE_ROOT = packageRoot

export const VERSION: string = (
	JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf-8")) as { version: string }
).version
