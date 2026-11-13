# Substrate

This project uses [Substrate](https://substrate.georgedrury.co.uk), a set of primitives for building creative tools: scaffold (toolbar, panels, panes, shortcuts), canvas and node helpers, and config-driven controls.

## Use Substrate components first

Components are installed into the project with the Substrate CLI, which wraps shadcn. Never run `npx shadcn@latest add` for them directly.

```bash
npx substrate-kit add panel slider toolbar   # install by name, in one call
npx substrate-kit add                        # interactive picker
npx substrate-kit docs <component>           # props, CSS variables, usage
npx substrate-kit docs <component> --open    # open its docs page in the browser
npx substrate-kit docs --list                # every component
```

Before writing a custom slider, input, panel, timeline or colour picker, check `docs --list`. If the Substrate MCP server is connected, use `search_components`, `get_component` and `get_docs` instead of the commands above, and `install_components` to install.

## Tune values with Controls

For parameters you want to adjust live (sizes, colours, springs, toggles), describe them as an object and render them with `Controls` instead of building a form:

```tsx
const card = useControls("Card", {
  radius: [16, 0, 48],        // [default, min, max, step?] slider
  colour: "#a78bfa",          // colour picker
  visible: true,              // toggle
  motion: { type: "spring", visualDuration: 0.3, bounce: 0.2 },
})
// <Panel><Controls /></Panel> renders every registered panel
```

The returned values keep the shape of the config. Panels have versions, reset, keyboard shortcuts (`shortcuts` option) and a copy button that gives an agent the tuned values to paste back in as the new defaults. Install with `npx substrate-kit add controls`, and read `docs controls` for every control type and option.

## Tune animation with the timeline

For motion, define clips with `useControlsTimeline` and bind `clip.current` to your UI. `ControlsTimeline` is the editor: scrub, move and resize clips, edit curves, and copy the tuned timing back as defaults. Install with `npx substrate-kit add controls-timeline`, and read `docs controls-timeline` for clip types, looping and zoom.

## Skills

Substrate skills are in `.claude/skills/` and `.agents/skills/`. Surface guides explain how to build each kind of tool (`scaffold-playground`, `canvas-2d`, `3d-scene`, `animation`, `image-generation`, `data-visualisation`) and workflows (`composing-panels`, `wire-interactions`, `create-custom-tool`, `theming`). Component references (`substrate-scaffold`, `substrate-controls`, `substrate-canvas`, `substrate-nodes`, `substrate-feedback`, `substrate-interaction`) say what to use. `install-components` lists everything available.
