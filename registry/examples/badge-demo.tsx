import { Badge } from "@/registry/substrate/components/badge"

export default function BadgeDemo() {
	return (
		<div className="flex flex-wrap gap-2">
			<Badge>Rectangle</Badge>
			<Badge variant="secondary">Frame</Badge>
			<Badge variant="outline">Draft</Badge>
			<Badge variant="muted">Locked</Badge>
		</div>
	)
}
