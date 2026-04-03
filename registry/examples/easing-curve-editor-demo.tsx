"use client"

import { useState } from "react"
import { EasingCurveEditor } from "@/registry/substrate/components/easing-curve-editor"
import { EASING_PRESETS, cubicBezierToString } from "@/registry/substrate/lib/easing"
import type { CubicBezier } from "@/registry/substrate/lib/easing"

export default function EasingCurveEditorDemo() {
	const [bezier, setBezier] = useState<CubicBezier>(EASING_PRESETS["ease-in-out"])

	return (
		<div className="flex flex-col items-center gap-3 w-[220px]">
			<EasingCurveEditor value={bezier} onChange={setBezier} />
			<code className="text-xs text-muted-foreground">{cubicBezierToString(bezier)}</code>
		</div>
	)
}
