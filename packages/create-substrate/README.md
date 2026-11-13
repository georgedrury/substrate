# create-substrate

Scaffold a [Substrate](https://substrate.georgedrury.co.uk) playground: a Vite + React project with a creative surface, the toolbar and panels around it, and agent skills pre-installed.

```bash
npx create-substrate
```

You are asked for a project name and a surface type. The package manager is the one you ran it with. Pass flags to skip the prompts:

```bash
npx create-substrate my-editor --surface canvas-2d --pm pnpm
```

## Surfaces

| `--surface` | For |
| --- | --- |
| `canvas-2d` | Shape editors, whiteboards, diagram tools |
| `3d-scene` | Product viewers, architectural tools, shader playgrounds |
| `animation` | Keyframe editors, motion graphics, easing explorers |
| `node-editor` | Visual programming, shader graphs, data pipelines |
| `data-vis` | Charts, dashboards, analytics explorers |
| `image-gen` | AI image tools, prompt-driven workflows |
| `blank` | Scaffold only; bring your own surface |

## Options

| Flag | Description |
| --- | --- |
| `--surface <type>` | Surface type from the table above |
| `--pm <manager>` | Package manager: `npm`, `pnpm` or `bun`. Defaults to the one that ran the command |
| `-y, --yes` | Accept defaults for anything not passed: name `my-substrate-app`, surface `canvas-2d` |
| `--skip-install` | Skip dependency installation |
| `--skip-git` | Don't initialise a git repository |

With no terminal (a script or CI), `--surface` is required unless you pass `--yes`.

## What you get

- A starter page for the chosen surface, built from Substrate components copied into `src/components/substrate/`
- `AGENTS.md`, `CLAUDE.md` and skills in `.claude/skills/` and `.agents/skills/` so coding agents know which components exist and how to compose them
- `.mcp.json` registering the Substrate MCP server
- [`@substrate-kit/cli`](https://www.npmjs.com/package/@substrate-kit/cli) as a dev dependency, for adding more components later:

```bash
npx substrate-kit add colour-picker timeline
```

To add Substrate to an existing project instead, run `npx @substrate-kit/cli init`.

Docs: [substrate.georgedrury.co.uk/docs/create-substrate](https://substrate.georgedrury.co.uk/docs/create-substrate)

## Acknowledgements

The 3D scene and image generation starters use Substrate's `Controls`, which is built on [DialKit](https://github.com/joshpuckett/dialkit) by Josh Puckett (MIT). Those projects depend on the `dialkit` package.

## Licence

MIT, see [LICENSE](LICENSE).
