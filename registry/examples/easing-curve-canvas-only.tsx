"use client"

import { useState } from "react"
import { EasingCurveCanvas } from "@/registry/substrate/components/easing-curve-editor"
import { EASING_PRESETS } from "@/registry/substrate/lib/easing"
import type { CubicBezier } from "@/registry/substrate/lib/easing"

export default function EasingCurveCanvasOnly() {
	const [bezier, setBezier] = useState<CubicBezier>(EASING_PRESETS["ease-in-out"])

	return <EasingCurveCanvas value={bezier} onChange={setBezier} width={200} height={160} />
}
