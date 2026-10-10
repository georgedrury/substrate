# @substrate-kit/cli

Command line tool and MCP server for [Substrate](https://substrate.georgedrury.co.uk), a set of primitives for building creative tools.

Starting a new project? Use [`create-substrate`](https://www.npmjs.com/package/create-substrate), which installs this CLI for you.

To add Substrate to an existing project:

```bash
npx @substrate-kit/cli init
```

This installs the agent skills into `.claude/skills/`, writes `CLAUDE.md`, `components.json` and `.mcp.json`, and adds the CLI to your dev dependencies. After installing, the short command works:

```bash
npx substrate-kit add slider number-input colour-picker
```

## Commands

| Command | Description |
| --- | --- |
| `init` | Install skills and configuration in the current project |
| `create [name]` | Create a new playground project |
| `add [components...]` | Install components; opens a picker with no arguments |
| `docs [component]` | Read component documentation in the terminal |
| `browse [component]` | Open component documentation in the browser |
| `variables [component]` | Show the theme override variables for a component |
| `mcp` | Start the Substrate MCP server over stdio |

## Licence

MIT
