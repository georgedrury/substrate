import type { SurfaceConfig } from "./types.js"

export const animation: SurfaceConfig = {
  components: [
    "panel",
    "pane",
    "timeline",
    "animation-store",
    "easing-curve-editor",
    "easing",
    "number-input",
    "status-bar",
  ],
  extraDeps: {
    gsap: "^3.12.0",
  },
  app: () => `import { useEffect, useState } from "react"
import { Panel } from "@/components/substrate/panel"
import {
  Pane,
  PaneHeader,
  PaneLabel,
  PaneContent,
} from "@/components/substrate/pane"
import {
  Timeline,
  TimelineRuler,
  TimelinePlayhead,
  TimelineTrack,
  TimelineKeyframe,
  TimelineTransport,
} from "@/components/substrate/timeline"
import { EasingCurveEditor } from "@/components/substrate/easing-curve-editor"
import { NumberInput } from "@/components/substrate/number-input"
import { StatusBar, StatusBarSection, StatusBarItem } from "@/components/substrate/status-bar"
import { useAnimationStore } from "@/stores/substrate/animation-store"
import { evaluateCubicBezier, type CubicBezier } from "@/lib/substrate/easing"

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

// Keyframe times are in seconds, matching the animation store
const TRACKS: Track[] = [
  {
    id: "position-x",
    label: "Position X",
    keyframes: [
      { id: "k1", time: 0, value: -150 },
      { id: "k2", time: 2.5, value: 150 },
      { id: "k3", time: 5, value: -150 },
    ],
  },
  {
    id: "opacity",
    label: "Opacity",
    keyframes: [
      { id: "k4", time: 0, value: 100 },
      { id: "k5", time: 1.5, value: 30 },
      { id: "k6", time: 4, value: 100 },
    ],
  },
]

export default function App() {
  const duration = useAnimationStore((s) => s.duration)
  const currentTime = useAnimationStore((s) => s.currentTime)
  const isPlaying = useAnimationStore((s) => s.isPlaying)
  const zoomLevel = useAnimationStore((s) => s.zoomLevel)
  const selectedKeyframeIds = useAnimationStore((s) => s.selectedKeyframeIds)
  const selectKeyframe = useAnimationStore((s) => s.selectKeyframe)
  const setCurrentTime = useAnimationStore((s) => s.setCurrentTime)
  const setDuration = useAnimationStore((s) => s.setDuration)
  const [easing, setEasing] = useState<CubicBezier>({ x1: 0.4, y1: 0, x2: 0.2, y2: 1 })

  // Advance the store's clock while playing, looping at the end
  useEffect(() => {
    if (!isPlaying) return

    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const state = useAnimationStore.getState()
      const next = state.currentTime + (now - last) / 1000
      last = now
      state.setCurrentTime(next >= state.duration ? 0 : next)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying])

  const posX = interpolate(TRACKS[0].keyframes, currentTime, easing)
  const opacity = interpolate(TRACKS[1].keyframes, currentTime, easing) / 100

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* Preview stage */}
        <div className="flex flex-1 items-center justify-center bg-canvas">
          <div
            className="size-20 rounded-lg bg-primary"
            style={{
              transform: \`translateX(\${posX}px)\`,
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
              <PaneLabel>Playback</PaneLabel>
            </PaneHeader>
            <PaneContent>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="T"
                  value={currentTime}
                  onChange={setCurrentTime}
                  min={0}
                  max={duration}
                  step={0.1}
                  suffix="s"
                />
                <NumberInput
                  label="D"
                  value={duration}
                  onChange={setDuration}
                  min={1}
                  max={30}
                  step={0.5}
                  suffix="s"
                />
              </div>
            </PaneContent>
          </Pane>
        </Panel>
      </div>

      <Timeline>
        <TimelineRuler duration={duration} zoomLevel={zoomLevel} />
        <div className="relative flex-1 overflow-y-auto">
          {TRACKS.map((track) => (
            <TimelineTrack key={track.id} label={track.label}>
              {track.keyframes.map((keyframe) => (
                <TimelineKeyframe
                  key={keyframe.id}
                  time={keyframe.time}
                  duration={duration}
                  zoomLevel={zoomLevel}
                  selected={selectedKeyframeIds.has(keyframe.id)}
                  onSelect={() => selectKeyframe(keyframe.id)}
                />
              ))}
            </TimelineTrack>
          ))}
          <TimelinePlayhead time={currentTime} duration={duration} zoomLevel={zoomLevel} />
        </div>
        <TimelineTransport />
      </Timeline>

      <StatusBar>
        <StatusBarSection>
          <StatusBarItem>Time: {currentTime.toFixed(2)}s / {duration.toFixed(2)}s</StatusBarItem>
          <StatusBarItem>State: {isPlaying ? "Playing" : "Stopped"}</StatusBarItem>
        </StatusBarSection>
      </StatusBar>
    </div>
  )
}

// Value at a given time, easing between the surrounding keyframes
function interpolate(keyframes: Keyframe[], time: number, easing: CubicBezier): number {
  if (keyframes.length === 0) return 0
  if (time <= keyframes[0].time) return keyframes[0].value
  const last = keyframes[keyframes.length - 1]
  if (time >= last.time) return last.value

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i]
    const b = keyframes[i + 1]
    if (time >= a.time && time <= b.time) {
      const t = evaluateCubicBezier(easing, (time - a.time) / (b.time - a.time))
      return a.value + (b.value - a.value) * t
    }
  }
  return 0
}
`,
}
