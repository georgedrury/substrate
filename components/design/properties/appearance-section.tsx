"use client"

import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"

export function AppearanceSection() {
  const { dispatch } = useCanvas()
  const { selectedElements } = useSelection()
  const { pushSnapshot } = useHistory()

  const element = selectedElements[0]
  if (!element) return null

  const updateOpacity = useCallback(
    (opacity: number) => {
      pushSnapshot()
      dispatch({
        type: "UPDATE_ELEMENT",
        id: element.id,
        changes: { opacity },
      })
    },
    [element.id, dispatch, pushSnapshot]
  )

  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        Appearance
      </h3>
      <div className="flex items-center gap-2">
        <Label className="text-[11px] text-muted-foreground w-12 shrink-0">Opacity</Label>
        <Slider
          value={[element.opacity * 100]}
          onValueChange={([v]) => updateOpacity(v / 100)}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-[11px] text-muted-foreground w-8 text-right">
          {Math.round(element.opacity * 100)}%
        </span>
      </div>
    </div>
  )
}
