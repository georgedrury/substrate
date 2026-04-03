"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useHistory } from "../contexts/history-context"
import { Pane, PaneLabel } from "../components/pane"

export function AlignmentPane() {
	const { dispatch } = useCanvas()
	const { selectedElements } = useSelection()
	const { pushSnapshot } = useHistory()

	if (selectedElements.length < 2) return null

	const align = useCallback(
		(
			direction: "left" | "center-h" | "right" | "top" | "center-v" | "bottom",
		) => {
			pushSnapshot()
			const els = selectedElements

			switch (direction) {
				case "left": {
					const minX = Math.min(...els.map((e) => e.x))
					for (const el of els) {
						dispatch({
							type: "UPDATE_ELEMENT",
							id: el.id,
							changes: { x: minX },
						})
					}
					break
				}
				case "center-h": {
					const minX = Math.min(...els.map((e) => e.x))
					const maxX = Math.max(...els.map((e) => e.x + e.width))
					const center = (minX + maxX) / 2
					for (const el of els) {
						dispatch({
							type: "UPDATE_ELEMENT",
							id: el.id,
							changes: { x: center - el.width / 2 },
						})
					}
					break
				}
				case "right": {
					const maxX = Math.max(...els.map((e) => e.x + e.width))
					for (const el of els) {
						dispatch({
							type: "UPDATE_ELEMENT",
							id: el.id,
							changes: { x: maxX - el.width },
						})
					}
					break
				}
				case "top": {
					const minY = Math.min(...els.map((e) => e.y))
					for (const el of els) {
						dispatch({
							type: "UPDATE_ELEMENT",
							id: el.id,
							changes: { y: minY },
						})
					}
					break
				}
				case "center-v": {
					const minY = Math.min(...els.map((e) => e.y))
					const maxY = Math.max(...els.map((e) => e.y + e.height))
					const center = (minY + maxY) / 2
					for (const el of els) {
						dispatch({
							type: "UPDATE_ELEMENT",
							id: el.id,
							changes: { y: center - el.height / 2 },
						})
					}
					break
				}
				case "bottom": {
					const maxY = Math.max(...els.map((e) => e.y + e.height))
					for (const el of els) {
						dispatch({
							type: "UPDATE_ELEMENT",
							id: el.id,
							changes: { y: maxY - el.height },
						})
					}
					break
				}
			}
		},
		[selectedElements, dispatch, pushSnapshot],
	)

	return (
		<Pane>
			<PaneLabel>Alignment</PaneLabel>
			<div className="flex gap-1">
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={() => align("left")}
					title="Align Left"
					className="h-7 w-7 text-[10px]"
				>
					AL
				</Button>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={() => align("center-h")}
					title="Align Center"
					className="h-7 w-7 text-[10px]"
				>
					AC
				</Button>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={() => align("right")}
					title="Align Right"
					className="h-7 w-7 text-[10px]"
				>
					AR
				</Button>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={() => align("top")}
					title="Align Top"
					className="h-7 w-7 text-[10px]"
				>
					AT
				</Button>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={() => align("center-v")}
					title="Align Middle"
					className="h-7 w-7 text-[10px]"
				>
					AM
				</Button>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={() => align("bottom")}
					title="Align Bottom"
					className="h-7 w-7 text-[10px]"
				>
					AB
				</Button>
			</div>
		</Pane>
	)
}
