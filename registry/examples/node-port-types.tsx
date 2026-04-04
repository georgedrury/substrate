"use client"

import {
	NodePortDot,
	PORT_TYPES,
	portColourVar,
} from "@/registry/substrate/components/node"

export default function NodePortTypes() {
	return (
		<div className="flex flex-wrap gap-4">
			{PORT_TYPES.map((type) => (
				<div key={type} className="flex items-center gap-2">
					<NodePortDot colour={portColourVar[type]} connected />
					<span className="text-xs text-muted-foreground">{type}</span>
				</div>
			))}
		</div>
	)
}
