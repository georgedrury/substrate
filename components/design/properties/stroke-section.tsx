"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"
import type { Stroke } from "../types"

export function StrokeSection() {
  const { dispatch } = useCanvas()
  const { selectedElements } = useSelection()
  const { pushSnapshot } = useHistory()

  const element = selectedElements[0]
  if (!element) return null

  const stroke = element.stroke

  const updateStroke = useCallback(
    (changes: Partial<Stroke>) => {
      pushSnapshot()
      const current = element.stroke ?? { color: "oklch(0.145 0 0)", width: 1, opacity: 1 }
      dispatch({
        type: "UPDATE_ELEMENT",
        id: element.id,
        changes: { stroke: { ...current, ...changes } },
      })
    },
    [element, dispatch, pushSnapshot]
  )

  const toggleStroke = useCallback(() => {
    pushSnapshot()
    dispatch({
      type: "UPDATE_ELEMENT",
      id: element.id,
      changes: {
        stroke: stroke ? null : { color: "oklch(0.145 0 0)", width: 1, opacity: 1 },
      },
    })
  }, [element.id, stroke, dispatch, pushSnapshot])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Stroke
        </h3>
        <Button variant="ghost" size="icon-xs" onClick={toggleStroke} className="h-5 w-5">
          <span className="text-[10px]">{stroke ? "-" : "+"}</span>
        </Button>
      </div>
      {stroke && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded border border-border shrink-0"
              style={{ backgroundColor: stroke.color }}
            />
            <Input
              value={stroke.color}
              onChange={(e) => updateStroke({ color: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[11px] text-muted-foreground w-12 shrink-0">Width</Label>
            <Input
              type="number"
              value={stroke.width}
              onChange={(e) => updateStroke({ width: parseFloat(e.target.value) || 1 })}
              className="h-7 text-xs w-16"
              min={0}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[11px] text-muted-foreground w-12 shrink-0">Opacity</Label>
            <Slider
              value={[stroke.opacity * 100]}
              onValueChange={([v]) => updateStroke({ opacity: v / 100 })}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-[11px] text-muted-foreground w-8 text-right">
              {Math.round(stroke.opacity * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
