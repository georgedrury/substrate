import type { SurfaceConfig } from "./types.js"

export const imageGen: SurfaceConfig = {
  components: [
    "toolbar",
    "panel",
    "pane",
    "gallery",
    "text-area",
    "slider",
    "number-input",
    "progress-bar",
    "status-bar",
  ],
  app: () => `import { useState } from "react"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import {
  Pane,
  PaneHeader,
  PaneLabel,
  PaneContent,
} from "@/components/substrate/pane"
import { Gallery } from "@/components/substrate/gallery"
import { TextArea } from "@/components/substrate/text-area"
import { Slider } from "@/components/substrate/slider"
import { NumberInput } from "@/components/substrate/number-input"
import { ProgressBar } from "@/components/substrate/progress-bar"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import {
  RiSparklingLine,
  RiImageLine,
  RiSettings3Line,
} from "@remixicon/react"

interface Generation {
  id: string
  prompt: string
  timestamp: number
  placeholder: string
}

const PLACEHOLDER_COLOURS = [
  "from-indigo-500/20 to-purple-500/20",
  "from-emerald-500/20 to-cyan-500/20",
  "from-rose-500/20 to-orange-500/20",
  "from-blue-500/20 to-violet-500/20",
]

export default function App() {
  const [prompt, setPrompt] = useState("")
  const [steps, setSteps] = useState(30)
  const [cfg, setCfg] = useState(7)
  const [seed, setSeed] = useState(-1)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setProgress(0)

    // Simulate generation progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200))
      setProgress(i)
    }

    const gen: Generation = {
      id: crypto.randomUUID(),
      prompt: prompt.trim(),
      timestamp: Date.now(),
      placeholder: PLACEHOLDER_COLOURS[generations.length % PLACEHOLDER_COLOURS.length],
    }
    setGenerations((prev) => [gen, ...prev])
    setSelectedId(gen.id)
    setGenerating(false)
    setProgress(0)
  }

  const selected = generations.find((g) => g.id === selectedId)

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        <Panel position="left">
          <Pane>
            <PaneHeader>
              <PaneLabel>Prompt</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={4}
              />
            </PaneContent>
          </Pane>
          <Pane>
            <PaneHeader>
              <PaneLabel>Parameters</PaneLabel>
            </PaneHeader>
            <PaneContent className="space-y-3">
              <Slider
                label="Steps"
                min={1}
                max={100}
                value={[steps]}
                onValueChange={([v]) => setSteps(v)}
              />
              <Slider
                label="CFG scale"
                min={1}
                max={20}
                step={0.5}
                value={[cfg]}
                onValueChange={([v]) => setCfg(v)}
              />
              <NumberInput label="Seed" value={seed} onChange={setSeed} />
            </PaneContent>
          </Pane>
        </Panel>

        {/* Preview area */}
        <div className="flex flex-1 flex-col bg-canvas">
          <div className="flex flex-1 items-center justify-center p-8">
            {selected ? (
              <div className={\`flex aspect-square max-h-full w-full max-w-lg items-center justify-center rounded-lg bg-gradient-to-br \${selected.placeholder}\`}>
                <RiImageLine className="size-16 text-muted-foreground/30" />
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <RiSparklingLine className="mx-auto mb-3 size-12 opacity-30" />
                <p className="text-sm">Enter a prompt and generate</p>
              </div>
            )}
          </div>

          {generating && (
            <div className="px-8 pb-4">
              <ProgressBar value={progress} max={100} />
            </div>
          )}

          {/* Gallery history */}
          {generations.length > 0 && (
            <div className="border-t border-border p-3">
              <Gallery
                items={generations.map((g) => ({
                  id: g.id,
                  label: g.prompt.slice(0, 40),
                }))}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          )}
        </div>
      </div>

      <Toolbar>
        <ToolbarToggle
          value="generate"
          tooltip="Generate"
          shortcut="⌘↵"
          onPressedChange={handleGenerate}
          disabled={generating || !prompt.trim()}
        >
          <RiSparklingLine className="size-4" />
        </ToolbarToggle>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem label="Generations" value={String(generations.length)} />
          {generating && <StatusBarItem label="Progress" value={\`\${progress}%\`} />}
        </StatusBarSection>
        <StatusBarSection>
          <StatusBarItem label="Steps" value={String(steps)} />
          <StatusBarItem label="CFG" value={String(cfg)} />
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}
`,
}
