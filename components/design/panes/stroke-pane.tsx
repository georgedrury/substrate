"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"
import { Pane, PaneHeader, PaneLabel, PaneAction } from "../components/pane"
import { Action, ActionLabel, ActionControls } from "../components/action"
import type { Stroke } from "../types"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"

export function StrokePane() {
	const { dispatch } = useCanvas()
	const { selectedElements } = useSelection()
	const { pushSnapshot } = useHistory()

	const element = selectedElements[0]
	if (!element) return null

	const stroke = element.stroke

	const updateStroke = useCallback(
		(changes: Partial<Stroke>) => {
			pushSnapshot()
			const current = element.stroke ?? {
				color: "oklch(0.145 0 0)",
				width: 1,
				opacity: 1,
			}
			dispatch({
				type: "UPDATE_ELEMENT",
				id: element.id,
				changes: { stroke: { ...current, ...changes } },
			})
		},
		[element, dispatch, pushSnapshot],
	)

	const toggleStroke = useCallback(() => {
		pushSnapshot()
		dispatch({
			type: "UPDATE_ELEMENT",
			id: element.id,
			changes: {
				stroke: stroke
					? null
					: { color: "oklch(0.145 0 0)", width: 1, opacity: 1 },
			},
		})
	}, [element.id, stroke, dispatch, pushSnapshot])

	return (
		<Pane>
			<PaneHeader>
				<PaneLabel>Stroke</PaneLabel>
				<PaneAction onClick={toggleStroke}>
					<span className="text-[10px]">{stroke ? "-" : "+"}</span>
				</PaneAction>
			</PaneHeader>
			{stroke && (
				<div className="space-y-2">
					<Action>
						<ActionLabel>Stroke</ActionLabel>
						<ActionControls>
							<InputGroup>
								<InputGroupAddon>
									<div
										className="size-4 rounded border border-border shrink-0"
										style={{ backgroundColor: stroke.color }}
									/>
								</InputGroupAddon>
								<InputGroupInput
									value={stroke.color}
									onChange={(e) => updateStroke({ color: e.target.value })}
									className="h-7 text-xs font-mono"
								/>
							</InputGroup>
						</ActionControls>
					</Action>
					<Action>
						<ActionLabel>Width</ActionLabel>
						<ActionControls>
							<Input
								type="number"
								value={stroke.width}
								onChange={(e) =>
									updateStroke({ width: parseFloat(e.target.value) || 1 })
								}
								className="text-xs"
								min={0}
							/>
						</ActionControls>
					</Action>
					<Action>
						<ActionLabel>Opacity</ActionLabel>
						<ActionControls className="flex items-center gap-2">
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
						</ActionControls>
					</Action>
				</div>
			)}
		</Pane>
	)
}
