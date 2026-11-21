# @substrate-kit/cli

Command line tool and MCP server for [Substrate](https://substrate.georgedrury.co.uk), a set of primitives for building creative tools.

Starting a new project? Use [`create-substrate`](https://www.npmjs.com/package/create-substrate), which installs this CLI for you.

To add Substrate to an existing project:

```bash
npx @substrate-kit/cli init
```

This detects whether the project uses Vite or Next, then:

- installs the agent skills into `.claude/skills/` and `.agents/skills/`
- adds a marked Substrate section to `CLAUDE.md` and `AGENTS.md`, or creates them. Running `init` again refreshes that section and leaves the rest of your files alone
- adds the `@substrate` registry to `components.json`, or writes one that matches your framework
- registers the MCP server in `.mcp.json`, keeping your other servers
- adds the CLI to your dev dependencies

After installing, the short command works:

```bash
npx substrate-kit add slider number-input colour-picker
```

## Commands

| Command | Description |
| --- | --- |
| `init` | Set up Substrate in the current project. `--force` refreshes existing skills |
| `add [components...]` | Install components in one call; opens a picker with no arguments |
| `docs [component]` | Read component documentation in the terminal. `--open` opens its docs page in the browser |
| `doctor` | Show which installed components are behind the registry or edited locally. `--json`, `--check` for CI |
| `update [components...]` | Update components that are behind. `--force` also replaces edited ones, after backing them up; `--dry-run` previews |
| `mcp` | Start the Substrate MCP server over stdio |

## Keeping components up to date

Components are copied into your project, so a fix in the registry doesn't reach you automatically. `substrate-kit add` records what it installs in `substrate.lock.json` (commit it). Then:

```bash
npx substrate-kit doctor     # which components are behind, which you have edited
npx substrate-kit update     # update the ones that are behind and unedited
npx substrate-kit update --force panel   # replace an edited one; your file is backed up to .substrate/backup first
```

Projects made before the lockfile existed can start tracking with `npx substrate-kit doctor --adopt`. Their versions are then unknown, so `update --force` is needed to refresh them once.

`update` only changes the components it names. shadcn would also overwrite a component's dependencies, including base components you have customised, so the files that change beyond the update are put back as they were.

## MCP server

`substrate-kit mcp` gives agents these tools: `search_components`, `get_component` (details and theme variables), `get_docs` (a component's full docs page), and `install_components`.

## Upgrading from 0.1

0.2.0 removes `create` (use `npx create-substrate`), `browse` (use `docs <name> --open`) and `variables` (theme variables are in `docs <name>` and the MCP `get_component` tool). The MCP `get_theme_variables` tool is folded into `get_component`.

## Acknowledgements

The `controls` and `controls-timeline` components that this CLI installs are built on [DialKit](https://github.com/joshpuckett/dialkit) by Josh Puckett (MIT). DialKit provides the config format, the store and the timeline model; Substrate supplies the interface. Installed projects depend on the `dialkit` package.

## Licence

MIT, see [LICENSE](LICENSE).
