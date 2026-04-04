"use client"

import { useState } from "react"
import {
	StatusBar,
	StatusBarSection,
	StatusBarItem,
	StatusBarSeparator,
} from "@/registry/substrate/components/status-bar"
import { ZoomControls } from "@/registry/substrate/components/zoom-controls"

export default function StatusBarDemo() {
	const [zoom, setZoom] = useState(1)

	return (
		<div className="w-full border rounded-lg overflow-hidden">
			<StatusBar>
				<StatusBarSection align="left">
					<StatusBarItem>1200 × 800</StatusBarItem>
					<StatusBarSeparator />
					<StatusBarItem>3 objects</StatusBarItem>
				</StatusBarSection>
				<StatusBarSection align="center">
					<StatusBarItem>X: 583 Y: 151</StatusBarItem>
				</StatusBarSection>
				<StatusBarSection align="right">
					<ZoomControls zoom={zoom} onZoomChange={setZoom} />
				</StatusBarSection>
			</StatusBar>
		</div>
	)
}
