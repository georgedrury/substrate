"use client"

import React, { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  CubicBezier,
  EASING_PRESETS,
  EasingPresetName,
  evaluateCubicBezier,
  isCubicBezierEqual,
} from "@/lib/substrate/easing"

/**
 * Canvas-based visualization of cubic bezier easing curves
 */
function EasingCurveCanvas({
  value,
  onChange,
  width = 200,
  height = 160,
  className,
}: {
  value: CubicBezier
  onChange: (bezier: CubicBezier) => void
  width?: number
  height?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragStateRef = useRef<{
    isDragging: boolean
    dragPoint: 1 | 2 | null
  }>({
    isDragging: false,
    dragPoint: null,
  })

  // Canvas colours are resolved once per draw, so redraw when the theme changes
  const [themeVersion, setThemeVersion] = useState(0)
  useEffect(() => {
    const redraw = () => setThemeVersion((version) => version + 1)
    const observer = new MutationObserver(redraw)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    })
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    media.addEventListener("change", redraw)
    return () => {
      observer.disconnect()
      media.removeEventListener("change", redraw)
    }
  }, [])

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    // Coordinate conversion: canvas space to bezier space [0,1]x[0,1]
    const toCanvasX = (x: number) => x * displayWidth
    const toCanvasY = (y: number) => displayHeight - y * displayHeight // Flip Y axis

    // The canvas cannot use CSS variables directly. Guides are drawn in the
    // element's text colour at low opacity; the curve and handles use
    // --easing-curve and --easing-handle when set, and the text colour otherwise.
    const styles = getComputedStyle(canvas)
    const ink = styles.color
    const curveColor = styles.getPropertyValue("--easing-curve").trim() || ink
    const handleColor = styles.getPropertyValue("--easing-handle").trim() || ink

    // Draw grid
    ctx.strokeStyle = ink
    ctx.globalAlpha = 0.08
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * displayWidth
      const y = (i / 4) * displayHeight
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, displayHeight)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(displayWidth, y)
      ctx.stroke()
    }

    // Draw diagonal reference line (linear)
    ctx.globalAlpha = 0.25
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    ctx.beginPath()
    ctx.moveTo(0, displayHeight)
    ctx.lineTo(displayWidth, 0)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Draw cubic bezier curve
    ctx.strokeStyle = curveColor
    ctx.lineWidth = 2
    ctx.beginPath()

    const steps = 100
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const y = evaluateCubicBezier(value, t)
      const px = toCanvasX(t)
      const py = toCanvasY(y)
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.stroke()

    // Draw control point handles (lines and circles)
    const handleRadius = 6
    const handleStrokeWidth = 1

    // Handle 1: (0,0) to (x1, y1)
    ctx.strokeStyle = ink
    ctx.globalAlpha = 0.35
    ctx.lineWidth = handleStrokeWidth
    ctx.beginPath()
    ctx.moveTo(toCanvasX(0), toCanvasY(0))
    ctx.lineTo(toCanvasX(value.x1), toCanvasY(value.y1))
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.fillStyle = handleColor
    ctx.beginPath()
    ctx.arc(toCanvasX(value.x1), toCanvasY(value.y1), handleRadius, 0, Math.PI * 2)
    ctx.fill()

    // Handle 2: (1,1) to (x2, y2)
    ctx.strokeStyle = ink
    ctx.globalAlpha = 0.35
    ctx.lineWidth = handleStrokeWidth
    ctx.beginPath()
    ctx.moveTo(toCanvasX(1), toCanvasY(1))
    ctx.lineTo(toCanvasX(value.x2), toCanvasY(value.y2))
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.fillStyle = handleColor
    ctx.beginPath()
    ctx.arc(toCanvasX(value.x2), toCanvasY(value.y2), handleRadius, 0, Math.PI * 2)
    ctx.fill()
  }, [value, themeVersion])

  // Get display dimensions for hit detection
  const getCanvasRect = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getBoundingClientRect()
  }

  // Convert mouse position to bezier coordinates
  const getPointerBezierCoords = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    const rect = getCanvasRect()
    if (!rect) return null

    const px = clientX - rect.left
    const py = clientY - rect.top

    return {
      x: px / rect.width,
      y: 1 - py / rect.height,
    }
  }

  // Distance from point to control point
  const distanceToPoint = (
    clientX: number,
    clientY: number,
    bezierX: number,
    bezierY: number
  ): number => {
    const rect = getCanvasRect()
    if (!rect) return Infinity

    const handleCanvasX = bezierX * rect.width
    const handleCanvasY = (1 - bezierY) * rect.height
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top

    const dx = canvasX - handleCanvasX
    const dy = canvasY - handleCanvasY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.setPointerCapture(e.pointerId)

    const dist1 = distanceToPoint(e.clientX, e.clientY, value.x1, value.y1)
    const dist2 = distanceToPoint(e.clientX, e.clientY, value.x2, value.y2)
    const hitThreshold = 10

    if (dist1 < dist2 && dist1 < hitThreshold) {
      dragStateRef.current = { isDragging: true, dragPoint: 1 }
    } else if (dist2 < hitThreshold) {
      dragStateRef.current = { isDragging: true, dragPoint: 2 }
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { isDragging, dragPoint } = dragStateRef.current
    if (!isDragging || !dragPoint) return

    const coords = getPointerBezierCoords(e.clientX, e.clientY)
    if (!coords) return

    // Clamp X to [0, 1], allow Y to overshoot
    const x = Math.max(0, Math.min(1, coords.x))
    const y = coords.y

    if (dragPoint === 1) {
      onChange({ ...value, x1: x, y1: y })
    } else {
      onChange({ ...value, x2: x, y2: y })
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.releasePointerCapture(e.pointerId)
    dragStateRef.current = { isDragging: false, dragPoint: null }
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: "crosshair",
      }}
      className={cn("block border border-input rounded-md bg-background text-foreground", className)}
      data-slot="easing-curve-canvas"
    />
  )
}

/**
 * Preset easing curve selector
 */
function EasingPresets({
  value,
  onChange,
  className,
}: {
  value: CubicBezier
  onChange: (bezier: CubicBezier) => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} data-slot="easing-presets">
      {(Object.entries(EASING_PRESETS) as Array<[EasingPresetName, CubicBezier]>).map(
        ([name, preset]) => {
          const isActive = isCubicBezierEqual(value, preset)
          return (
            <button
              key={name}
              onClick={() => onChange(preset)}
              className={cn(
                "px-2 py-1 rounded text-xs font-medium transition-colors",
                "border border-input bg-background hover:bg-muted",
                isActive && "bg-primary text-primary-foreground border-primary"
              )}
              data-slot="easing-preset-button"
            >
              {name}
            </button>
          )
        }
      )}
    </div>
  )
}

/**
 * Main easing curve editor component
 */
function EasingCurveEditor({
  value,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  value: CubicBezier
  onChange: (bezier: CubicBezier) => void
}) {
  return (
    <div
      className={cn("flex flex-col gap-4 w-full", className)}
      data-slot="easing-curve-editor"
      {...props}
    >
      <EasingCurveCanvas value={value} onChange={onChange} width={200} height={160} />
      <EasingPresets value={value} onChange={onChange} />
    </div>
  )
}

export { EasingCurveEditor, EasingCurveCanvas, EasingPresets }
