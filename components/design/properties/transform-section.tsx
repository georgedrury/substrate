"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"
import { Properties, PropertiesLabel } from "./properties"

export function TransformSection() {
  const { dispatch } = useCanvas()
  const { selectedElements } = useSelection()
  const { pushSnapshot } = useHistory()

  const element = selectedElements[0]
  if (!element) return null

  return (
    <Properties>
      <PropertiesLabel>Transform</PropertiesLabel>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="X" value={element.x} field="x" elementId={element.id} dispatch={dispatch} pushSnapshot={pushSnapshot} />
        <NumberField label="Y" value={element.y} field="y" elementId={element.id} dispatch={dispatch} pushSnapshot={pushSnapshot} />
        <NumberField label="W" value={element.width} field="width" elementId={element.id} dispatch={dispatch} pushSnapshot={pushSnapshot} />
        <NumberField label="H" value={element.height} field="height" elementId={element.id} dispatch={dispatch} pushSnapshot={pushSnapshot} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="R" value={element.rotation} field="rotation" elementId={element.id} dispatch={dispatch} pushSnapshot={pushSnapshot} />
      </div>
    </Properties>
  )
}

function NumberField({
  label,
  value,
  field,
  elementId,
  dispatch,
  pushSnapshot,
}: {
  label: string
  value: number
  field: string
  elementId: string
  dispatch: React.Dispatch<{ type: "UPDATE_ELEMENT"; id: string; changes: Record<string, number> }>
  pushSnapshot: () => void
}) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = parseFloat(e.target.value)
      if (isNaN(num)) return
      pushSnapshot()
      dispatch({
        type: "UPDATE_ELEMENT",
        id: elementId,
        changes: { [field]: num },
      })
    },
    [elementId, field, dispatch, pushSnapshot]
  )

  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-[11px] text-muted-foreground w-4 shrink-0">{label}</Label>
      <Input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={onChange}
        className="h-7 text-xs"
      />
    </div>
  )
}
