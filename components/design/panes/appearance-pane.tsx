"use client"

import { useCallback } from "react"
import { Slider } from "@/components/design/components/slider"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"
import { Pane, PaneLabel } from "../components/pane"
import { Action, ActionLabel, ActionControls } from "../components/action"

export function AppearancePane() {
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
		[element.id, dispatch, pushSnapshot],
	)

	return (
		<Pane>
			<PaneLabel>Appearance</PaneLabel>
			<Action>
				<ActionLabel>Opacity</ActionLabel>
				<ActionControls className="flex items-center gap-2">
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
				</ActionControls>
			</Action>
		</Pane>
	)
}
