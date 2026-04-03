import chalk from "chalk"

export const log = {
  info: (msg: string) => console.log(chalk.cyan("ℹ"), msg),
  success: (msg: string) => console.log(chalk.green("✓"), msg),
  warn: (msg: string) => console.log(chalk.yellow("⚠"), msg),
  error: (msg: string) => console.error(chalk.red("✗"), msg),
  step: (msg: string) => console.log(chalk.dim("→"), msg),
  blank: () => console.log(),
  title: (msg: string) => {
    log.blank()
    console.log(chalk.bold(msg))
    log.blank()
  },
}
