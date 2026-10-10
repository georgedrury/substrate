"use client"

import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { Pane, PaneHeader, PaneLabel, PaneAction } from "@/registry/substrate/components/pane"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import type { Fill } from "@/registry/substrate/types"
import { ColourPicker } from "@/registry/substrate/components/colour-picker"
import { NumberSlider } from "@/registry/substrate/components/number-slider"

export function FillPane() {
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elements = useDocumentStore((s) => s.elements)
	const updateElement = useDocumentStore((s) => s.updateElement)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)

	const element = [...selectedIds].map((id) => elements[id]).filter(Boolean)[0]
	if (!element) return null

	const fill = element.fill

	const updateFill = (changes: Partial<Fill>) => {
		const current = element.fill ?? {
			type: "solid" as const,
			color: "oklch(0.85 0 0)",
			opacity: 1,
		}
		updateElement(element.id, { fill: { ...current, ...changes } })
	}

	const toggleFill = () => {
		pushSnapshot()
		updateElement(element.id, {
			fill: fill
				? null
				: { type: "solid", color: "oklch(0.85 0 0)", opacity: 1 },
		})
	}

	return (
		<Pane>
			<PaneHeader>
				<PaneLabel>Fill</PaneLabel>
				<PaneAction onClick={toggleFill}>
					<span className="text-[10px]">{fill ? "−" : "+"}</span>
				</PaneAction>
			</PaneHeader>
			{fill && (
				<div className="space-y-1">
					<Action>
						<ActionControls>
							<ColourPicker
								value={fill.color}
								onChange={(color) => {
									pushSnapshot()
									updateFill({ color })
								}}
							/>
							<span className="text-[11px] font-mono text-muted-foreground truncate">
								{fill.color}
							</span>
						</ActionControls>
					</Action>
					<Action>
						<ActionLabel>Opacity</ActionLabel>
						<ActionControls>
							<NumberSlider
								value={fill.opacity * 100}
								onChange={(v) => updateFill({ opacity: v / 100 })}
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
