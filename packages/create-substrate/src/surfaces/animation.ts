import type { SurfaceConfig } from "./types.js"

export const animation: SurfaceConfig = {
  components: [
    "toolbar",
    "panel",
    "pane",
    "timeline",
    "easing-curve-editor",
    "slider",
    "number-input",
    "history-controls",
    "status-bar",
  ],
  extraDeps: {
    gsap: "^3.12.0",
  },
  app: () => `import { useState, useRef, useEffect } from "react"
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggle,
  ToolbarSeparator,
} from "@/components/substrate/toolbar"
import { Panel } from "@/components/substrate/panel"
import {
  Pane,
  PaneHeader,
  PaneLabel,
  PaneContent,
} from "@/components/substrate/pane"
import { Timeline } from "@/components/substrate/timeline"
import { EasingCurveEditor } from "@/components/substrate/easing-curve-editor"
import { NumberInput } from "@/components/substrate/number-input"
import { Slider } from "@/components/substrate/slider"
import { HistoryControls } from "@/components/substrate/history-controls"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import {
  RiPlayLine,
  RiPauseLine,
  RiStopLine,
  RiSkipBackLine,
} from "@remixicon/react"

interface Keyframe {
  id: string
  time: number
  value: number
}

interface Track {
  id: string
  label: string
  keyframes: Keyframe[]
}

const INITIAL_TRACKS: Track[] = [
  {
    id: "position-x",
    label: "Position X",
    keyframes: [
      { id: "k1", time: 0, value: 50 },
      { id: "k2", time: 30, value: 300 },
      { id: "k3", time: 60, value: 150 },
    ],
  },
  {
    id: "opacity",
    label: "Opacity",
    keyframes: [
      { id: "k4", time: 0, value: 100 },
      { id: "k5", time: 20, value: 30 },
      { id: "k6", time: 50, value: 100 },
    ],
  },
]

export default function App() {
  const [playing, setPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames] = useState(60)
  const [tracks] = useState(INITIAL_TRACKS)
  const [easing, setEasing] = useState<[number, number, number, number]>([0.4, 0, 0.2, 1])
  const animRef = useRef<number | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!playing) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }

    let frame = currentFrame
    const tick = () => {
      frame = (frame + 1) % totalFrames
      setCurrentFrame(frame)
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [playing])

  // Interpolate position and opacity from keyframes
  const posX = interpolate(tracks[0].keyframes, currentFrame)
  const opacity = interpolate(tracks[1].keyframes, currentFrame) / 100

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="relative flex flex-1 overflow-hidden">
        {/* Preview stage */}
        <div className="flex flex-1 items-center justify-center bg-canvas">
          <div
            ref={boxRef}
            className="size-20 rounded-lg bg-primary"
            style={{
              transform: \`translateX(\${posX - 150}px)\`,
              opacity,
            }}
          />
        </div>

        <Panel position="right">
          <Pane>
            <PaneHeader>
              <PaneLabel>Easing</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <EasingCurveEditor value={easing} onChange={setEasing} />
            </PaneContent>
          </Pane>
          <Pane>
            <PaneHeader>
              <PaneLabel>Keyframe</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="Frame" value={currentFrame} onChange={setCurrentFrame} min={0} max={totalFrames} />
                <div>
                  <label className="text-xs font-medium">Value</label>
                  <NumberInput value={0} onChange={() => {}} />
                </div>
              </div>
            </PaneContent>
          </Pane>
        </Panel>
      </div>

      {/* Timeline */}
      <div className="h-48 border-t border-border bg-panel">
        <Timeline
          tracks={tracks}
          currentFrame={currentFrame}
          totalFrames={totalFrames}
          onFrameChange={setCurrentFrame}
        />
      </div>

      <Toolbar>
        <ToolbarToggle
          value="back"
          tooltip="Go to start"
          onPressedChange={() => { setCurrentFrame(0); setPlaying(false) }}
        >
          <RiSkipBackLine className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          value="play"
          pressed={playing}
          tooltip={playing ? "Pause" : "Play"}
          shortcut="Space"
          onPressedChange={() => setPlaying(!playing)}
        >
          {playing ? <RiPauseLine className="size-4" /> : <RiPlayLine className="size-4" />}
        </ToolbarToggle>
        <ToolbarToggle
          value="stop"
          tooltip="Stop"
          onPressedChange={() => { setPlaying(false); setCurrentFrame(0) }}
        >
          <RiStopLine className="size-4" />
        </ToolbarToggle>
      </Toolbar>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem>Frame: {currentFrame} / {totalFrames}</StatusBarItem>
          <StatusBarItem>State: {playing ? "Playing" : "Stopped"}</StatusBarItem>
        </StatusBarSection>
        <StatusBarSection>
          <HistoryControls size="sm" />
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}

function interpolate(keyframes: Keyframe[], frame: number): number {
  if (keyframes.length === 0) return 0
  if (frame <= keyframes[0].time) return keyframes[0].value
  if (frame >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i]
    const b = keyframes[i + 1]
    if (frame >= a.time && frame <= b.time) {
      const t = (frame - a.time) / (b.time - a.time)
      return a.value + (b.value - a.value) * t
    }
  }
  return 0
}
`,
}
