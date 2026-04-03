"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Pane, PaneLabel } from "@/registry/substrate/components/pane"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import type { TextElement, TextStyle } from "@/registry/substrate/types"
import { RiAlignCenter, RiAlignLeft, RiAlignRight } from "@remixicon/react"

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

export function TextPane() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

	const element = [...selectedIds].map((id) => elements[id]).filter(Boolean)[0]
	if (!element || element.type !== "text") return null

	const textEl = element as TextElement
	const { textStyle } = textEl

	const updateTextStyle = useCallback(
		(changes: Partial<TextStyle>) => {
			pushSnapshot()
			updateElement(textEl.id, { textStyle: { ...textStyle, ...changes } })
		},
		[textEl.id, textStyle, updateElement, pushSnapshot],
	)

	return (
		<Pane>
			<PaneLabel>Text</PaneLabel>

			<div className="space-y-2">
				<Action>
					<ActionLabel>Text</ActionLabel>
					<ActionControls>
						<Input
							value={textStyle.content}
							onChange={(e) => updateTextStyle({ content: e.target.value })}
							className="h-7 text-xs"
							placeholder="Text content"
						/>
					</ActionControls>
				</Action>
				<Action>
					<ActionLabel>Font</ActionLabel>
					<ActionControls>
						<Select
							value={textStyle.fontFamily}
							onValueChange={(v) => updateTextStyle({ fontFamily: v })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FONT_FAMILIES.map((f) => (
									<SelectItem key={f} value={f}>
										{f}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</ActionControls>
				</Action>

				<Action>
					<ActionLabel>Weight</ActionLabel>
					<ActionControls>
						<Select
							value={String(textStyle.fontWeight)}
							onValueChange={(v) =>
								updateTextStyle({ fontWeight: parseInt(v) })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FONT_WEIGHTS.map((w) => (
									<SelectItem key={w.value} value={String(w.value)}>
										{w.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</ActionControls>
				</Action>

				<Action>
					<ActionLabel>Size</ActionLabel>
					<ActionControls>
						<Input
							type="number"
							value={textStyle.fontSize}
							onChange={(e) =>
								updateTextStyle({
									fontSize: parseFloat(e.target.value) || 16,
								})
							}
							min={1}
						/>
					</ActionControls>
				</Action>
				<Action>
					<ActionLabel>Line height</ActionLabel>
					<ActionControls>
						<Input
							type="number"
							value={textStyle.lineHeight}
							onChange={(e) =>
								updateTextStyle({
									lineHeight: parseFloat(e.target.value) || 1.4,
								})
							}
							step={0.1}
							min={0.5}
						/>
					</ActionControls>
				</Action>

				<Action>
					<ActionLabel>Align</ActionLabel>
					<ActionControls>
						<ToggleGroup
							type="single"
							value={textStyle.textAlign}
							onValueChange={(v) => {
								if (v)
									updateTextStyle({ textAlign: v as TextStyle["textAlign"] })
							}}
							spacing={0}
							className="h-7"
						>
							<ToggleGroupItem value="left" className="h-7">
								<RiAlignLeft />
							</ToggleGroupItem>
							<ToggleGroupItem value="center" className="h-7">
								<RiAlignCenter />
							</ToggleGroupItem>
							<ToggleGroupItem value="right" className="h-7">
								<RiAlignRight />
							</ToggleGroupItem>
						</ToggleGroup>
					</ActionControls>
				</Action>
			</div>
		</Pane>
	)
}
