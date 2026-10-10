---
name: image-generation
description: "Build prompt-driven image creation tools with Substrate — generation controls, preview surfaces, galleries, and parameter tuning. Use when the app produces AI-generated visuals via an API. Triggers on: image generation, text-to-image, Stable Diffusion, fal.ai, Replicate, inpainting, outpainting, style transfer, texture generator, prompt, gallery, generation controls."
user-invocable: true
---

# Image generation

Guide to building prompt-driven image creation tools with Substrate — generation controls, preview surfaces, galleries, and parameter tuning.

## When to use this surface

Use an image generation surface when the app involves AI-generated visuals: text-to-image tools, style transfer, inpainting/outpainting editors, texture generators, or any workflow where users iterate on generated images through prompts and parameters.

## Surface setup

The image generation surface replaces the spatial canvas with a preview area and generation controls. The rendering engine is an API (such as fal.ai, Replicate, or a local Stable Diffusion endpoint) rather than a canvas or 3D renderer.

### Dependencies

```bash
npm install @fal-ai/client
```

For other providers, install their SDK instead. The architecture is provider-agnostic — wrap the API call in a generation function and swap providers without changing the UI.

### Environment

Store API keys in `.env.local`:

```
FAL_KEY=your-key-here
```

Create a server action or API route to proxy generation requests — never expose keys to the client.

## Architecture

Unlike spatial canvases, image generation is **request/response** rather than **continuous rendering**. The core loop is:

```
User adjusts parameters (prompt, model, seed, etc.)
  → Trigger generation (server action / API route)
    → Show loading state in preview
      → Display result in preview area
        → Optionally save to gallery/history
```

### Generation store

Create a Zustand store for generation state:

```ts
interface GenerationState {
  prompt: string
  negativePrompt: string
  model: string
  parameters: Record<string, number | string | boolean>
  isGenerating: boolean
  currentImage: string | null
  history: GenerationResult[]
  error: string | null
}

interface GenerationResult {
  id: string
  prompt: string
  imageUrl: string
  parameters: Record<string, number | string | boolean>
  timestamp: number
  seed: number
}
```

Actions: `setPrompt`, `setParameter`, `generate`, `saveToHistory`, `loadFromHistory`.

### Server action

```ts
"use server"

import { fal } from "@fal-ai/client"

export async function generateImage(params: GenerationParams) {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: params.prompt,
      image_size: params.size,
      num_inference_steps: params.steps,
      seed: params.seed,
    },
  })
  return result.data
}
```

## Layout

The image generation layout differs from the spatial canvas layout:

```
┌──────────┬────────────────────────┬──────────┐
│          │                        │          │
│  Left    │   Preview surface      │  Right   │
│  panel   │   (generated image)    │  panel   │
│          │                        │          │
│  History │                        │  Params  │
│  Gallery │                        │  Prompt  │
│          │                        │          │
└──────────┴────────────────────────┴──────────┘
                 [ Toolbar ]
```

### Preview surface

A simple container that displays the current image with zoom/pan controls:

```tsx
export function PreviewSurface() {
  const currentImage = useGenerationStore((s) => s.currentImage)
  const isGenerating = useGenerationStore((s) => s.isGenerating)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas">
      {isGenerating && <LoadingSpinner />}
      {currentImage && (
        <img
          src={currentImage}
          alt="Generated image"
          className="max-h-full max-w-full object-contain"
        />
      )}
      {!currentImage && !isGenerating && (
        <p className="text-canvas-foreground text-sm">
          Enter a prompt and generate
        </p>
      )}
    </div>
  )
}
```

## Wiring to Substrate chrome

### Toolbar

The toolbar serves a different purpose here — mode switching and actions rather than spatial tools:

| Action | Purpose | Shortcut |
|---|---|---|
| Generate | Trigger image generation | Cmd+Enter |
| Compare | Side-by-side with previous | C |
| Zoom to fit | Reset preview zoom | Cmd+0 |
| Save | Download current image | Cmd+S |
| Copy prompt | Copy prompt to clipboard | Cmd+Shift+C |

### Left panel — history and gallery

Show a scrollable grid of previously generated images. Clicking one loads it into the preview and restores its parameters. Use the Pane component for the container.

### Right panel — generation controls

Use Pane/Action/Slider to build parameter controls:

- **Prompt pane** — textarea for the prompt, optional negative prompt
- **Model pane** — dropdown to select the model/checkpoint
- **Parameters pane** — sliders for inference steps, CFG scale, seed, image size selector
- **Style pane** (optional) — style preset buttons, LoRA weight sliders

The Action/ActionLabel/ActionControls pattern works well for each parameter row.

## Interaction patterns

### Prompt editing

Use a textarea in the right panel. Bind Cmd+Enter globally to trigger generation — this is the primary interaction, equivalent to pressing play.

### Seed management

Show the current seed in the parameters pane. Provide a "randomise" button and a "lock" toggle. When locked, regenerating uses the same seed — useful for iterating on prompt wording while keeping composition stable.

### Image comparison

When the user presses C or selects compare mode, show the current and previous image side by side or with a slider divider. This helps evaluate prompt changes.

### Inpainting extension

For more advanced tools, the preview surface can include a canvas overlay for painting masks:

1. Add a "mask" tool to the toolbar
2. When active, overlay a transparent canvas on the preview image
3. Let the user paint white (inpaint) regions
4. Send the mask alongside the prompt to the API
5. Use the same `useCanvasDrag` pattern for brush strokes

This is where the 2D canvas skill and image generation skill intersect.

## Theming

The preview surface uses `bg-canvas` for its background. The generation controls in the right panel inherit panel theming. No special theming considerations beyond the standard Substrate tokens.

## What to build

Some examples of what this surface enables:

- **Prompt studio** — iterate on prompts with parameter controls, build a gallery of results
- **Texture generator** — generate tileable textures with specific material properties
- **Character designer** — generate character variations, save favourites, export sprite sheets
- **Mood board builder** — generate images for different themes, arrange in a gallery layout
- **Inpainting editor** — upload an image, mask regions, regenerate specific areas

## Related reference skills

- **substrate-scaffold** — Toolbar, Panel, StatusBar for the app shell
- **substrate-controls** — Slider, NumberInput, TextArea, Select for generation parameters
- **substrate-feedback** — Toast, ProgressBar for generation status, EmptyState for no results
- **substrate-canvas** — useViewport for inpainting canvas pan/zoom
