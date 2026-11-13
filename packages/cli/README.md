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
| `mcp` | Start the Substrate MCP server over stdio |

## MCP server

`substrate-kit mcp` gives agents these tools: `search_components`, `get_component` (details and theme variables), `get_docs` (a component's full docs page), and `install_components`.

## Upgrading from 0.1

0.2.0 removes `create` (use `npx create-substrate`), `browse` (use `docs <name> --open`) and `variables` (theme variables are in `docs <name>` and the MCP `get_component` tool). The MCP `get_theme_variables` tool is folded into `get_component`.

## Licence

MIT
