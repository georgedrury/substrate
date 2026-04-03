"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/design/components/slider"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"
import { Pane, PaneHeader, PaneLabel, PaneAction } from "../components/pane"
import { Action, ActionLabel, ActionControls } from "../components/action"
import type { Fill } from "../types"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"

export function FillPane() {
	const { dispatch } = useCanvas()
	const { selectedElements } = useSelection()
	const { pushSnapshot } = useHistory()

	const element = selectedElements[0]
	if (!element) return null

	const fill = element.fill

	const updateFill = useCallback(
		(changes: Partial<Fill>) => {
			pushSnapshot()
			const current = element.fill ?? {
				type: "solid" as const,
				color: "oklch(0.85 0 0)",
				opacity: 1,
			}
			dispatch({
				type: "UPDATE_ELEMENT",
				id: element.id,
				changes: { fill: { ...current, ...changes } },
			})
		},
		[element, dispatch, pushSnapshot],
	)

	const toggleFill = useCallback(() => {
		pushSnapshot()
		dispatch({
			type: "UPDATE_ELEMENT",
			id: element.id,
			changes: {
				fill: fill
					? null
					: { type: "solid", color: "oklch(0.85 0 0)", opacity: 1 },
			},
		})
	}, [element.id, fill, dispatch, pushSnapshot])

	return (
		<Pane>
			<PaneHeader>
				<PaneLabel>Fill</PaneLabel>
				<PaneAction onClick={toggleFill}>
					<span className="text-[10px]">{fill ? "-" : "+"}</span>
				</PaneAction>
			</PaneHeader>

			{fill && (
				<div className="space-y-2">
					<Action>
						<ActionLabel>Fill</ActionLabel>
						<ActionControls>
							<InputGroup>
								<InputGroupAddon>
									<div
										className="size-4 rounded border border-border shrink-0"
										style={{ backgroundColor: fill.color }}
									/>
								</InputGroupAddon>
								<InputGroupInput
									value={fill.color}
									onChange={(e) => updateFill({ color: e.target.value })}
									className="h-7 text-xs font-mono"
								/>
							</InputGroup>
						</ActionControls>
					</Action>
					<Action>
						<ActionLabel>Opacity</ActionLabel>
						<ActionControls>
							<Slider
								value={[fill.opacity * 100]}
								onValueChange={([v]) => updateFill({ opacity: v / 100 })}
								max={100}
								step={1}
								className="flex-1"
							/>
							<span className="text-[11px] text-muted-foreground w-8 text-right">
								{Math.round(fill.opacity * 100)}%
							</span>
						</ActionControls>
					</Action>
				</div>
			)}
		</Pane>
	)
}
