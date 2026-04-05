import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
export function ensureDir(dir) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}
export function writeFile(filePath, content) {
    ensureDir(dirname(filePath));
    writeFileSync(filePath, content, "utf-8");
}
export function copyDir(src, dest) {
    ensureDir(dest);
    const entries = readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        try {
            if (entry.isDirectory()) {
                copyDir(srcPath, destPath);
            }
            else {
                writeFileSync(destPath, readFileSync(srcPath));
            }
        }
        catch {
            // Skip files that can't be read
        }
    }
}
export function exists(path) {
    return existsSync(path);
}
export function listDirs(dir) {
    if (!existsSync(dir))
        return [];
    return readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
}
export function resolveSkillsDir() {
    const distDir = dirname(dirname(new URL(import.meta.url).pathname));
    const skillsDir = join(distDir, "skills");
    if (existsSync(skillsDir))
        return skillsDir;
    const pkgRoot = join(distDir, "..");
    const fallback = join(pkgRoot, "skills");
    if (existsSync(fallback))
        return fallback;
    throw new Error("Could not locate bundled skills directory");
}
//# sourceMappingURL=fs.js.map