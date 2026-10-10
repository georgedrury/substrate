import type { SurfaceConfig } from "./types.js"

export const imageGen: SurfaceConfig = {
  components: [
    "toolbar",
    "panel",
    "pane",
    "action",
    "gallery",
    "text-area",
    "controls",
    "number-input",
    "progress-bar",
    "status-bar",
    "empty-state",
  ],
  app: () => `import { useState } from "react"
import {
  Toolbar,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggle,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import {
  Pane,
  PaneHeader,
  PaneLabel,
  PaneAction,
  PaneContent,
} from "@/components/substrate/pane"
import { Action, ActionLabel, ActionControls } from "@/components/substrate/action"
import {
  Gallery,
  GalleryItem,
  GalleryImage,
  GalleryAction,
  GalleryEmpty,
} from "@/components/substrate/gallery"
import { TextArea } from "@/components/substrate/text-area"
import { Controls } from "@/components/substrate/controls"
import { useControlsController } from "@/hooks/substrate/use-controls"
import { NumberInput } from "@/components/substrate/number-input"
import { ProgressBar } from "@/components/substrate/progress-bar"
import {
  StatusBar,
  StatusBarSection,
  StatusBarItem,
  StatusBarSeparator,
} from "@/components/substrate/status-bar"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/substrate/empty-state"
import {
  RiSparklingLine,
  RiImageLine,
  RiShuffleLine,
  RiDeleteBinLine,
} from "@remixicon/react"

type AspectRatio = "1:1" | "3:2" | "2:3"

interface Settings {
  prompt: string
  steps: number
  cfg: number
  seed: number
  aspect: AspectRatio
}

interface Generation extends Settings {
  id: string
  src: string
}

const ASPECT_SIZES: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 768, height: 768 },
  "3:2": { width: 960, height: 640 },
  "2:3": { width: 640, height: 960 },
}

const ASPECT_RATIOS: AspectRatio[] = ["1:1", "3:2", "2:3"]

const MAX_SEED = 999999

function isAspectRatio(value: string): value is AspectRatio {
  return ASPECT_RATIOS.some((ratio) => ratio === value)
}

function hashString(text: string) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return hash
}

// Small deterministic PRNG so the same settings always give the same image
function createRandom(seed: number) {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Placeholder renderer: draws an abstract SVG from the settings and returns
// it as a data URL. Swap this for a call to your image model.
function renderPlaceholder({ prompt, steps, cfg, seed, aspect }: Settings) {
  const { width, height } = ASPECT_SIZES[aspect]
  const random = createRandom(seed + hashString(prompt))
  const hue = Math.floor(random() * 360)
  const saturation = Math.round(30 + cfg * 3)
  const count = 3 + Math.round(steps / 8)

  let shapes = ""
  for (let i = 0; i < count; i++) {
    const cx = Math.round(random() * width)
    const cy = Math.round(random() * height)
    const r = Math.round((0.08 + random() * 0.3) * Math.min(width, height))
    const shapeHue = (hue + Math.round(random() * 120) - 60 + 360) % 360
    const lightness = Math.round(40 + random() * 35)
    const opacity = (0.25 + random() * 0.45).toFixed(2)
    shapes += \`<circle cx="\${cx}" cy="\${cy}" r="\${r}" fill="hsl(\${shapeHue} \${saturation}% \${lightness}%)" opacity="\${opacity}"/>\`
  }

  const svg =
    \`<svg xmlns="http://www.w3.org/2000/svg" width="\${width}" height="\${height}" viewBox="0 0 \${width} \${height}">\` +
    \`<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">\` +
    \`<stop offset="0" stop-color="hsl(\${hue} \${saturation}% 22%)"/>\` +
    \`<stop offset="1" stop-color="hsl(\${(hue + 60) % 360} \${saturation}% 12%)"/>\` +
    \`</linearGradient><filter id="blur"><feGaussianBlur stdDeviation="24"/></filter></defs>\` +
    \`<rect width="\${width}" height="\${height}" fill="url(#bg)"/>\` +
    \`<g filter="url(#blur)">\${shapes}</g></svg>\`

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

function createGeneration(id: string, settings: Settings): Generation {
  return { ...settings, id, src: renderPlaceholder(settings) }
}

function randomSeed() {
  return Math.floor(Math.random() * (MAX_SEED + 1))
}

const INITIAL_GENERATIONS: Generation[] = [
  createGeneration("sample-1", {
    prompt: "Aurora over a frozen lake, long exposure",
    steps: 40,
    cfg: 8,
    seed: 1204,
    aspect: "3:2",
  }),
  createGeneration("sample-2", {
    prompt: "Soft studio portrait of a ceramic vase",
    steps: 24,
    cfg: 5,
    seed: 77,
    aspect: "1:1",
  }),
  createGeneration("sample-3", {
    prompt: "Neon city street in the rain at night",
    steps: 60,
    cfg: 12,
    seed: 5150,
    aspect: "2:3",
  }),
]

const TOOLBAR_BUTTON =
  "inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium outline-none transition-all hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"

export default function App() {
  const [prompt, setPrompt] = useState("Misty mountain valley at sunrise")
  // The Parameters pane is generated from this config. The controller form
  // of the hook adds setValues, used below to load a past result's settings.
  const parameters = useControlsController("Parameters", {
    steps: [30, 1, 100, 1],
    cfgScale: [7, 1, 20, 0.5],
  })
  const steps = parameters.values.steps
  const cfg = parameters.values.cfgScale
  const [seed, setSeed] = useState(-1)
  const [aspect, setAspect] = useState<AspectRatio>("1:1")
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generations, setGenerations] = useState<Generation[]>(INITIAL_GENERATIONS)
  const [selectedId, setSelectedId] = useState<string | null>(
    INITIAL_GENERATIONS[0]?.id ?? null,
  )

  const canGenerate = !generating && prompt.trim().length > 0
  const selected = generations.find((g) => g.id === selectedId)

  async function handleGenerate() {
    if (!canGenerate) return
    const settings: Settings = {
      prompt: prompt.trim(),
      steps,
      cfg,
      seed: seed < 0 ? randomSeed() : seed,
      aspect,
    }

    setGenerating(true)
    setProgress(0)

    // Simulated progress. Replace with your model's progress events.
    for (let step = 1; step <= 10; step++) {
      await new Promise((resolve) => setTimeout(resolve, 120))
      setProgress(step * 10)
    }

    const generation = createGeneration(crypto.randomUUID(), settings)
    setGenerations((prev) => [generation, ...prev])
    setSelectedId(generation.id)
    setGenerating(false)
    setProgress(0)
  }

  function handleRemove(id: string) {
    const remaining = generations.filter((g) => g.id !== id)
    setGenerations(remaining)
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? null)
  }

  function handleClear() {
    setGenerations([])
    setSelectedId(null)
  }

  // Load a previous result's settings back into the controls
  function handleSelect(generation: Generation) {
    setSelectedId(generation.id)
    setPrompt(generation.prompt)
    parameters.setValues({ steps: generation.steps, cfgScale: generation.cfg })
    setSeed(generation.seed)
    setAspect(generation.aspect)
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1">
        <Panel position="left" className="shrink-0">
          <Pane>
            <PaneHeader>
              <PaneLabel>Prompt</PaneLabel>
            </PaneHeader>
            <PaneContent className="space-y-2">
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    void handleGenerate()
                  }
                }}
                placeholder="Describe the image you want to generate..."
                minRows={4}
                aria-label="Prompt"
              />
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={!canGenerate}
                className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                <RiSparklingLine className="size-3.5" />
                {generating ? "Generating..." : "Generate"}
              </button>
              {generating && <ProgressBar value={progress} aria-label="Generation progress" />}
            </PaneContent>
          </Pane>
          <Controls panel="Parameters" />
          <Pane>
            <PaneHeader>
              <PaneLabel>Seed</PaneLabel>
              <PaneAction
                type="button"
                title="Random seed"
                aria-label="Random seed"
                onClick={() => setSeed(randomSeed())}
              >
                <RiShuffleLine />
              </PaneAction>
            </PaneHeader>
            <PaneContent className="space-y-1">
              <Action>
                <ActionLabel>Seed</ActionLabel>
                <ActionControls>
                  <NumberInput
                    className="flex-1"
                    aria-label="Seed"
                    value={seed}
                    onChange={(value) => setSeed(Math.round(value))}
                    min={-1}
                    max={MAX_SEED}
                    precision={0}
                  />
                </ActionControls>
              </Action>
              <p className="pt-1 text-[11px] text-muted-foreground">
                A seed of -1 picks a random seed for each generation.
              </p>
            </PaneContent>
          </Pane>
        </Panel>

        {/* Preview area */}
        <div className="flex min-w-0 flex-1 items-center justify-center bg-canvas p-8 pb-28">
          {selected ? (
            <img
              src={selected.src}
              alt={selected.prompt}
              className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
            />
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <RiImageLine />
              </EmptyStateIcon>
              <EmptyStateTitle>No image selected</EmptyStateTitle>
              <EmptyStateDescription>
                Enter a prompt and press Generate to create one.
              </EmptyStateDescription>
            </EmptyState>
          )}
        </div>

        <Panel position="right" className="shrink-0">
          <Pane>
            <PaneHeader>
              <PaneLabel>History</PaneLabel>
              <PaneAction
                type="button"
                title="Clear history"
                aria-label="Clear history"
                onClick={handleClear}
                disabled={generations.length === 0}
              >
                <RiDeleteBinLine />
              </PaneAction>
            </PaneHeader>
            <PaneContent>
              <Gallery columns={2}>
                {generations.length === 0 && <GalleryEmpty>No generations yet</GalleryEmpty>}
                {generations.map((generation) => (
                  <GalleryItem
                    key={generation.id}
                    selected={generation.id === selectedId}
                    onSelect={() => handleSelect(generation)}
                    title={generation.prompt}
                  >
                    <GalleryImage src={generation.src} alt={generation.prompt} />
                    <GalleryAction
                      type="button"
                      aria-label="Remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(generation.id)
                      }}
                    >
                      <RiDeleteBinLine className="size-3.5" />
                    </GalleryAction>
                  </GalleryItem>
                ))}
              </Gallery>
            </PaneContent>
          </Pane>
        </Panel>
      </div>

      <Toolbar>
        <ToolbarToggleGroup
          value={aspect}
          onValueChange={(value) => {
            if (isAspectRatio(value)) setAspect(value)
          }}
        >
          {ASPECT_RATIOS.map((ratio) => (
            <ToolbarToggle key={ratio} value={ratio} tooltip={"Aspect ratio " + ratio}>
              {ratio}
            </ToolbarToggle>
          ))}
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <button
          type="button"
          className={TOOLBAR_BUTTON}
          onClick={() => void handleGenerate()}
          disabled={!canGenerate}
          title="Generate (Ctrl/Cmd + Enter in the prompt)"
        >
          <RiSparklingLine className="size-4" />
          Generate
        </button>
      </Toolbar>

      <StatusBar>
        <StatusBarSection align="left">
          <StatusBarItem>Generations: {generations.length}</StatusBarItem>
          {generating && (
            <>
              <StatusBarSeparator />
              <StatusBarItem>Progress: {progress}%</StatusBarItem>
            </>
          )}
        </StatusBarSection>
        <StatusBarSection align="right">
          {selected && (
            <>
              <StatusBarItem>
                {ASPECT_SIZES[selected.aspect].width} × {ASPECT_SIZES[selected.aspect].height}
              </StatusBarItem>
              <StatusBarSeparator />
              <StatusBarItem>Seed: {selected.seed}</StatusBarItem>
              <StatusBarSeparator />
            </>
          )}
          <StatusBarItem>Steps: {steps}</StatusBarItem>
          <StatusBarSeparator />
          <StatusBarItem>CFG: {cfg}</StatusBarItem>
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
}
