"use client"

import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Pane, PaneHeader, PaneLabel, PaneAction } from "@/registry/substrate/components/pane"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { ColourPicker } from "@/registry/substrate/components/colour-picker"
import { NumberInput } from "@/registry/substrate/components/number-input"
import { NumberSlider } from "@/registry/substrate/components/number-slider"
import type { Stroke } from "@/registry/substrate/types"

export function StrokePane() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

	const element = [...selectedIds].map((id) => elements[id]).filter(Boolean)[0]
	if (!element) return null

	const stroke = element.stroke

	const updateStroke = (changes: Partial<Stroke>) => {
		const current = element.stroke ?? {
			color: "oklch(0.145 0 0)",
			width: 1,
			opacity: 1,
		}
		updateElement(element.id, { stroke: { ...current, ...changes } })
	}

	const toggleStroke = () => {
		pushSnapshot()
		updateElement(element.id, {
			stroke: stroke
				? null
				: { color: "oklch(0.145 0 0)", width: 1, opacity: 1 },
		})
	}

	return (
		<Pane>
			<PaneHeader>
				<PaneLabel>Stroke</PaneLabel>
				<PaneAction onClick={toggleStroke}>
					<span className="text-[10px]">{stroke ? "−" : "+"}</span>
				</PaneAction>
			</PaneHeader>
			{stroke && (
				<div className="space-y-1">
					<Action>
						<ActionControls>
							<ColourPicker
								value={stroke.color}
								onChange={(color) => {
									pushSnapshot()
									updateStroke({ color })
								}}
							/>
							<span className="text-[11px] font-mono text-muted-foreground truncate">
								{stroke.color}
							</span>
						</ActionControls>
					</Action>
					<Action>
						<ActionLabel>Width</ActionLabel>
						<ActionControls>
							<NumberInput
								value={stroke.width}
								onChange={(w) => updateStroke({ width: w })}
								onStart={() => pushSnapshot()}
								min={0}
								step={1}
								suffix="px"
							/>
						</ActionControls>
					</Action>
					<Action>
						<ActionLabel>Opacity</ActionLabel>
						<ActionControls>
							<NumberSlider
								value={stroke.opacity * 100}
								onChange={(v) => updateStroke({ opacity: v / 100 })}
								onStart={() => pushSnapshot()}
								min={0}
								max={100}
								step={1}
								suffix="%"
							/>
						</ActionControls>
					</Action>
				</div>
			)}
		</Pane>
	)
}
