import chalk from "chalk";
export const log = {
    info: (msg) => console.log(chalk.cyan("ℹ"), msg),
    success: (msg) => console.log(chalk.green("✓"), msg),
    warn: (msg) => console.log(chalk.yellow("⚠"), msg),
    error: (msg) => console.error(chalk.red("✗"), msg),
    step: (msg) => console.log(chalk.dim("→"), msg),
    blank: () => console.log(),
    title: (msg) => {
        log.blank();
        console.log(chalk.bold(msg));
        log.blank();
    },
};
//# sourceMappingURL=logger.js.map