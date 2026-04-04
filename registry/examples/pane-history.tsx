"use client"

import { useState, useCallback } from "react"
import { Pane, PaneHeader, PaneLabel } from "@/registry/substrate/components/pane"
import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import { HistoryButton } from "@/registry/substrate/components/history-controls"
import { NumberInput } from "@/registry/substrate/components/number-input"
import { RiArrowGoBackLine, RiArrowGoForwardLine } from "@remixicon/react"

export default function PaneHistory() {
	const [x, setX] = useState(120)
	const [y, setY] = useState(80)
	const [history, setHistory] = useState<{ x: number; y: number }[]>([])
	const [future, setFuture] = useState<{ x: number; y: number }[]>([])

	const pushSnapshot = useCallback(() => {
		setHistory((h) => [...h, { x, y }])
		setFuture([])
	}, [x, y])

	const undo = useCallback(() => {
		if (history.length === 0) return
		const prev = history[history.length - 1]
		setFuture((f) => [{ x, y }, ...f])
		setHistory((h) => h.slice(0, -1))
		setX(prev.x)
		setY(prev.y)
	}, [history, x, y])

	const redo = useCallback(() => {
		if (future.length === 0) return
		const next = future[0]
		setHistory((h) => [...h, { x, y }])
		setFuture((f) => f.slice(1))
		setX(next.x)
		setY(next.y)
	}, [future, x, y])

	return (
		<div className="w-[260px]">
			<Pane>
				<PaneHeader>
					<PaneLabel>Position</PaneLabel>
					<div data-slot="history-controls" className="inline-flex items-center gap-0.5">
						<HistoryButton onClick={undo} disabled={history.length === 0} aria-label="Undo">
							<RiArrowGoBackLine className="size-3.5" />
						</HistoryButton>
						<HistoryButton onClick={redo} disabled={future.length === 0} aria-label="Redo">
							<RiArrowGoForwardLine className="size-3.5" />
						</HistoryButton>
					</div>
				</PaneHeader>
				<div className="grid grid-cols-2 gap-2">
					<NumberInput label="X" value={x} onChange={setX} onStart={pushSnapshot} />
					<NumberInput label="Y" value={y} onChange={setY} onStart={pushSnapshot} />
				</div>
			</Pane>
		</div>
	)
}
