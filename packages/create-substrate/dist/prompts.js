import { createInterface } from "node:readline";
import chalk from "chalk";
import { SURFACE_OPTIONS } from "./surfaces/types.js";
function createRl() {
    return createInterface({ input: process.stdin, output: process.stdout });
}
export async function promptName() {
    const rl = createRl();
    return new Promise((resolve) => {
        rl.question(`  ${chalk.bold("Project name:")} `, (answer) => {
            rl.close();
            const name = answer.trim();
            if (!name) {
                console.error(chalk.red("  Project name is required"));
                process.exit(1);
            }
            resolve(name);
        });
    });
}
export async function promptSurface() {
    const options = SURFACE_OPTIONS;
    let cursor = 0;
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            resolve("canvas-2d");
            return;
        }
        process.stdin.setRawMode(true);
        process.stdin.resume();
        function render() {
            // Move cursor up to clear previous render (except first time)
            const lines = options.length + 2;
            process.stdout.write(`\x1B[${lines}A\x1B[J`);
            console.log(`  ${chalk.bold("Surface type:")}`);
            console.log();
            for (let i = 0; i < options.length; i++) {
                const opt = options[i];
                const selected = i === cursor;
                const bullet = selected ? chalk.cyan("●") : chalk.dim("○");
                const label = selected ? chalk.bold(opt.label) : opt.label;
                const desc = chalk.dim(opt.description);
                console.log(`  ${bullet} ${label.padEnd(20)} ${desc}`);
            }
        }
        // Initial render — print blank lines first so the clear works
        console.log(`  ${chalk.bold("Surface type:")}`);
        console.log();
        for (const opt of options) {
            const bullet = chalk.dim("○");
            const desc = chalk.dim(opt.description);
            console.log(`  ${bullet} ${opt.label.padEnd(20)} ${desc}`);
        }
        render();
        process.stdin.on("data", (data) => {
            const key = data.toString();
            if (key === "\x1B[A" || key === "k") {
                cursor = Math.max(0, cursor - 1);
                render();
            }
            else if (key === "\x1B[B" || key === "j") {
                cursor = Math.min(options.length - 1, cursor + 1);
                render();
            }
            else if (key === "\r" || key === "\n") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeAllListeners("data");
                console.log();
                resolve(options[cursor].value);
            }
            else if (key === "\x03") {
                process.stdin.setRawMode(false);
                process.exit(0);
            }
        });
    });
}
const PM_OPTIONS = [
    { value: "npm", label: "npm" },
    { value: "pnpm", label: "pnpm" },
    { value: "bun", label: "bun" },
];
export async function promptPackageManager() {
    let cursor = 0;
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            resolve("npm");
            return;
        }
        process.stdin.setRawMode(true);
        process.stdin.resume();
        function render() {
            process.stdout.write(`\x1B[1A\x1B[J`);
            const items = PM_OPTIONS.map((opt, i) => {
                const selected = i === cursor;
                return selected ? chalk.cyan.bold(opt.label) : chalk.dim(opt.label);
            }).join("   ");
            console.log(`  ${chalk.bold("Package manager:")}  ${items}`);
        }
        console.log(`  ${chalk.bold("Package manager:")}  ${PM_OPTIONS.map((o) => chalk.dim(o.label)).join("   ")}`);
        render();
        process.stdin.on("data", (data) => {
            const key = data.toString();
            if (key === "\x1B[D" || key === "h") {
                cursor = Math.max(0, cursor - 1);
                render();
            }
            else if (key === "\x1B[C" || key === "l") {
                cursor = Math.min(PM_OPTIONS.length - 1, cursor + 1);
                render();
            }
            else if (key === "\r" || key === "\n") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeAllListeners("data");
                console.log();
                resolve(PM_OPTIONS[cursor].value);
            }
            else if (key === "\x03") {
                process.stdin.setRawMode(false);
                process.exit(0);
            }
        });
    });
}
//# sourceMappingURL=prompts.js.map