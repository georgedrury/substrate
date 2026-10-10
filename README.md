# Substrate

Primitives for building creative tools: canvases, panels, panes, controls, timelines and node editors. Components are distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry), so the source is copied into your project.

Docs: [substrate.georgedrury.co.uk](https://substrate.georgedrury.co.uk)

## Usage

Scaffold a new playground:

```bash
npm create substrate@latest
```

Or add a component to an existing shadcn project:

```bash
npx shadcn@latest add https://substrate.georgedrury.co.uk/r/panel
```

## Repository layout

| Path | Contents |
| --- | --- |
| `registry/substrate/` | Source for components, hooks, stores and utilities |
| `registry/examples/` | Demos rendered in the docs |
| `registry.json` | Registry manifest; `public/r/` is built from it |
| `content/docs/` | Documentation (fumadocs) |
| `components/design/` | The design editor demo built from the registry |
| `packages/cli/` | `@substrate-kit/cli`: CLI, MCP server and agent skills |
| `packages/create-substrate/` | `create-substrate`: project scaffolder |

## Development

```bash
npm install
npm run dev             # docs site on http://localhost:3000
npm run registry:build  # rebuild public/r after changing registry sources
```

Each package builds with `npm run build` from its own directory.

## Licence

MIT
