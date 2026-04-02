"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"
import { Properties, PropertiesLabel } from "./properties"
import type { TextElement, TextStyle } from "../types"

const FONT_FAMILIES = [
  "sans-serif",
  "serif",
  "monospace",
  "var(--font-geist-sans)",
  "var(--font-geist-mono)",
]

const FONT_WEIGHTS = [
  { label: "Light", value: 300 },
  { label: "Regular", value: 400 },
  { label: "Medium", value: 500 },
  { label: "Semi Bold", value: 600 },
  { label: "Bold", value: 700 },
]

export function TextSection() {
  const { dispatch } = useCanvas()
  const { selectedElements } = useSelection()
  const { pushSnapshot } = useHistory()

  const element = selectedElements[0]
  if (!element || element.type !== "text") return null

  const textEl = element as TextElement
  const { textStyle } = textEl

  const updateTextStyle = useCallback(
    (changes: Partial<TextStyle>) => {
      pushSnapshot()
      dispatch({
        type: "UPDATE_ELEMENT",
        id: textEl.id,
        changes: { textStyle: { ...textStyle, ...changes } },
      })
    },
    [textEl.id, textStyle, dispatch, pushSnapshot]
  )

  return (
    <Properties>
      <PropertiesLabel>Text</PropertiesLabel>

      <div className="space-y-2">
        <Input
          value={textStyle.content}
          onChange={(e) => updateTextStyle({ content: e.target.value })}
          className="h-7 text-xs"
          placeholder="Text content"
        />

        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground w-12 shrink-0">Font</Label>
          <Select
            value={textStyle.fontFamily}
            onValueChange={(v) => updateTextStyle({ fontFamily: v })}
          >
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground w-12 shrink-0">Weight</Label>
          <Select
            value={String(textStyle.fontWeight)}
            onValueChange={(v) => updateTextStyle({ fontWeight: parseInt(v) })}
          >
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHTS.map((w) => (
                <SelectItem key={w.value} value={String(w.value)} className="text-xs">
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-[11px] text-muted-foreground w-6 shrink-0">Size</Label>
            <Input
              type="number"
              value={textStyle.fontSize}
              onChange={(e) => updateTextStyle({ fontSize: parseFloat(e.target.value) || 16 })}
              className="h-7 text-xs"
              min={1}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-[11px] text-muted-foreground w-6 shrink-0">LH</Label>
            <Input
              type="number"
              value={textStyle.lineHeight}
              onChange={(e) => updateTextStyle({ lineHeight: parseFloat(e.target.value) || 1.4 })}
              className="h-7 text-xs"
              step={0.1}
              min={0.5}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground w-12 shrink-0">Align</Label>
          <ToggleGroup
            type="single"
            value={textStyle.textAlign}
            onValueChange={(v) => {
              if (v) updateTextStyle({ textAlign: v as TextStyle["textAlign"] })
            }}
            spacing={0}
          >
            <ToggleGroupItem value="left" className="text-[10px] h-6 px-2">L</ToggleGroupItem>
            <ToggleGroupItem value="center" className="text-[10px] h-6 px-2">C</ToggleGroupItem>
            <ToggleGroupItem value="right" className="text-[10px] h-6 px-2">R</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </Properties>
  )
}
