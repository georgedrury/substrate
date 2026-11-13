# Substrate

Primitives for building creative tools: canvases, panels, panes, controls, timelines and node editors. Components are distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry), so the source is copied into your project.

Docs: [substrate.georgedrury.co.uk](https://substrate.georgedrury.co.uk)

## Usage

Scaffold a new playground:

```bash
npm create substrate@latest
```

Or add Substrate to an existing Vite or Next.js project, then install components by name:

```bash
npx @substrate-kit/cli init
npx substrate-kit add panel slider
```

Components are a standard shadcn registry, so `npx shadcn@latest add https://substrate.georgedrury.co.uk/r/panel` works too.

## Repository layout

| Path | Contents |
| --- | --- |
| `registry/substrate/` | Source for components, hooks, stores and utilities |
| `registry/examples/` | Demos rendered in the docs |
| `registry.json` | Registry manifest; `public/r/` is built from it |
| `content/docs/` | Documentation (fumadocs) |
| `components/design/` | The design editor demo built from the registry |
| `packages/cli/` | `@substrate-kit/cli`: CLI, MCP server and agent skills (the source of truth for skills) |
| `packages/create-substrate/` | `create-substrate`: project scaffolder |
| `scripts/` | Registry checks, skill sync, plugin build, scaffold test and release stamp |

## Development

```bash
npm install
npm run dev             # docs site on http://localhost:3000
npm run registry:build  # rebuild public/r after changing registry sources
npm run skills:sync     # copy packages/cli/skills to create-substrate and public/skills
```

Each package builds with `npm run build` from its own directory.

Registry sources import each other by their installed paths (`@/components/substrate/x`, `@/hooks/substrate/x`, `@/lib/substrate/x`, `@/stores/substrate/x`), which `tsconfig.json` maps back to `registry/substrate/`. `npm run registry:check` fails on imports that would not resolve after installation and on missing dependencies; `npm run registry:check -- --fix` rewrites the dependency lists.

## Testing and releasing

```bash
npx playwright install chromium   # once
npm run test:scaffold             # everything, against the local registry build
npm run test:scaffold -- animation blank
```

`test:scaffold` scaffolds every surface with a real install, builds each project, and loads it in a headless browser, failing on any runtime error. It also runs `substrate-kit init` on bare Vite and Next projects, installs every registry item into one project to typecheck them together, and checks that `substrate-kit add` works with no terminal attached.

Scaffolded projects download components from the deployed site, so release in this order:

1. `npm run release:check`, then push. Wait for the site to deploy.
2. `npm run test:scaffold -- --live` to test against the deployed registry.
3. Publish `packages/cli`, then `packages/create-substrate`. Publishing is refused unless the files match the last passing `release:check`, so any change after the check means running it again. `release:check` also builds the Claude plugin to `build/substrate.plugin` from the current skills and version.

## Acknowledgements

Substrate's `Controls` and `ControlsTimeline` are built on [DialKit](https://github.com/joshpuckett/dialkit) by Josh Puckett, used under its MIT licence. DialKit provides the config format, the headless store (values, persistence, versions) and the timeline's clip model and playback, and installed projects depend on the `dialkit` package. Substrate supplies the interface from its own components, and several behaviours follow DialKit's design: keyboard shortcuts, the shared easing and spring row, copying tuned values for an agent, and the timeline's loop region, zoom and resizable dock. Thank you to Josh for making it open source.

## Licence

MIT, see [LICENSE](LICENSE).
