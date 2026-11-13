"use client"

import { useState } from "react"
import { SpringEditor } from "@/registry/substrate/components/spring-editor"
import type { Spring } from "@/registry/substrate/lib/spring"

export default function SpringEditorDemo() {
	const [spring, setSpring] = useState<Spring>({
		type: "spring",
		visualDuration: 0.4,
		bounce: 0.3,
	})

	return (
		<div className="flex w-64 flex-col gap-3">
			<SpringEditor value={spring} onChange={setSpring} />
			<code className="text-xs text-muted-foreground">{JSON.stringify(spring)}</code>
		</div>
	)
}
