"use client"

import { useEffect, useRef } from "react"
import { RiPlayLine, RiPauseLine, RiLoopLeftLine } from "@remixicon/react"
import { cn } from "@/lib/utils"
import { useAnimationStore } from "../stores/animation-store"

// ── Timeline ──

type TimelineProps = {
  duration?: number
}

function Timeline({
  duration = 5,
  className,
  children,
  ...props
}: TimelineProps & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline"
      className={cn("flex flex-col bg-panel border-t min-h-[200px]", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ── TimelineRuler ──

type TimelineRulerProps = {
  duration: number
  zoomLevel: number
}

function TimelineRuler({
  duration,
  zoomLevel,
  className,
  ...props
}: TimelineRulerProps & React.ComponentProps<"div">) {
  const tickCount = Math.ceil(duration)
  const tickSpacing = zoomLevel // pixels per second

  return (
    <div
      data-slot="timeline-ruler"
      className={cn("h-6 border-b bg-muted/30 flex items-stretch", className)}
      {...props}
    >
      <div className="relative w-32 border-r flex-shrink-0" />
      <div className="relative flex-1 overflow-hidden">
        {Array.from({ length: tickCount + 1 }).map((_, i) => {
          const seconds = i
          const minutes = Math.floor(seconds / 60)
          const secs = seconds % 60
          const timeLabel = `${minutes}:${secs.toString().padStart(2, "0")}`
          const x = seconds * tickSpacing

          return (
            <div
              key={i}
              className="absolute"
              style={{ left: `${x}px` }}
            >
              <div className="flex flex-col items-center h-full">
                <div className="h-2 w-px bg-border" />
                <div className="text-[10px] text-muted-foreground pt-0.5 whitespace-nowrap pr-1">
                  {timeLabel}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── TimelinePlayhead ──

type TimelinePlayheadProps = {
  time: number
  duration: number
  zoomLevel: number
}

function TimelinePlayhead({
  time,
  duration,
  zoomLevel,
  className,
  ...props
}: TimelinePlayheadProps & React.ComponentProps<"div">) {
  const x = Math.max(0, Math.min(time, duration)) * zoomLevel
  const isDragging = useRef(false)

  const handleMouseDown = () => {
    isDragging.current = true
  }

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const timeline = document.querySelector("[data-slot='timeline']")
      if (!timeline) return

      const rect = timeline.getBoundingClientRect()
      const relativeX = e.clientX - rect.left

      // Account for ruler width (w-32 = 128px)
      const trackX = relativeX - 128
      const newTime = Math.max(0, trackX / zoomLevel)

      useAnimationStore.setState({ currentTime: newTime })
    }

    if (isDragging.current) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [zoomLevel])

  return (
    <div
      data-slot="timeline-playhead"
      className={cn("absolute top-0 h-full pointer-events-none", className)}
      style={{ left: `${128 + x}px` }}
      {...props}
    >
      {/* Handle at top */}
      <div
        className="absolute -top-1.5 -left-2 w-4 h-4 rounded-xs bg-destructive border border-destructive-foreground cursor-ns-resize pointer-events-auto"
        onMouseDown={handleMouseDown}
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
      />
      {/* Vertical line */}
      <div className="w-0.5 h-full bg-destructive pointer-events-auto" />
    </div>
  )
}

// ── TimelineTrack ──

type TimelineTrackProps = {
  label: string
}

function TimelineTrack({
  label,
  className,
  children,
  ...props
}: TimelineTrackProps & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-track"
      className={cn(
        "flex items-center h-8 border-b hover:bg-accent/50 relative",
        className,
      )}
      {...props}
    >
      {/* Label area */}
      <div className="w-32 flex-shrink-0 border-r px-2 py-1 overflow-hidden">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
      </div>

      {/* Content area for keyframes */}
      <div className="relative flex-1 h-full">{children}</div>
    </div>
  )
}

// ── TimelineKeyframe ──

type TimelineKeyframeProps = {
  time: number
  duration: number
  zoomLevel: number
  selected?: boolean
  onSelect?: () => void
}

function TimelineKeyframe({
  time,
  duration,
  zoomLevel,
  selected = false,
  onSelect,
  className,
  ...props
}: TimelineKeyframeProps & React.ComponentProps<"div">) {
  const x = Math.max(0, Math.min(time, duration)) * zoomLevel
  const size = 10

  return (
    <div
      data-slot="timeline-keyframe"
      data-selected={selected || undefined}
      className={cn("absolute top-1/2 -translate-y-1/2 cursor-pointer", className)}
      style={{
        left: `${x}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={onSelect}
      {...props}
    >
      <div
        className={cn(
          "w-full h-full transition-colors",
          "data-selected:bg-primary data-selected:border-primary",
          selected ? "bg-primary border-primary" : "bg-muted-foreground border-muted-foreground",
        )}
        style={{
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
      />
    </div>
  )
}

// ── TimelineTransport ──

type TimelineTransportProps = Record<string, never>

function TimelineTransport({
  className,
  ...props
}: TimelineTransportProps & React.ComponentProps<"div">) {
  const { isPlaying, currentTime, duration, togglePlayback } = useAnimationStore(
    (s) => ({
      isPlaying: s.isPlaying,
      currentTime: s.currentTime,
      duration: s.duration,
      togglePlayback: s.togglePlayback,
    }),
  )

  const minutes = Math.floor(currentTime / 60)
  const seconds = (currentTime % 60).toFixed(2)
  const timeDisplay = `${minutes}:${seconds.padStart(5, "0")}`

  const durationMinutes = Math.floor(duration / 60)
  const durationSeconds = (duration % 60).toFixed(2)
  const durationDisplay = `${durationMinutes}:${durationSeconds.padStart(5, "0")}`

  return (
    <div
      data-slot="timeline-transport"
      className={cn(
        "flex items-center gap-3 px-4 py-2 border-t bg-muted/20",
        className,
      )}
      {...props}
    >
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlayback}
        className="inline-flex items-center justify-center rounded-md h-7 min-w-7 px-1 text-xs font-medium hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <RiPauseLine className="size-4" />
        ) : (
          <RiPlayLine className="size-4" />
        )}
      </button>

      {/* Time Display */}
      <div className="text-xs font-mono text-muted-foreground">
        {timeDisplay} / {durationDisplay}
      </div>

      {/* Loop Toggle */}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md h-7 min-w-7 px-1 text-xs font-medium hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all"
        aria-label="Loop"
      >
        <RiLoopLeftLine className="size-4" />
      </button>
    </div>
  )
}

export {
  Timeline,
  TimelineRuler,
  TimelinePlayhead,
  TimelineTrack,
  TimelineKeyframe,
  TimelineTransport,
}
