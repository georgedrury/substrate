import { RiStackLine } from "@remixicon/react"
import {
	EmptyState,
	EmptyStateIcon,
	EmptyStateTitle,
	EmptyStateDescription,
	EmptyStateAction,
} from "@/registry/substrate/components/empty-state"

export default function EmptyStateDemo() {
	return (
		<div className="w-[300px] border rounded-lg">
			<EmptyState>
				<EmptyStateIcon>
					<RiStackLine />
				</EmptyStateIcon>
				<EmptyStateTitle>No layers yet</EmptyStateTitle>
				<EmptyStateDescription>
					Create a shape or frame to get started with your design.
				</EmptyStateDescription>
				<EmptyStateAction>Create rectangle</EmptyStateAction>
			</EmptyState>
		</div>
	)
}
