"use client"

import { toast } from "@/registry/substrate/components/toast"

export default function ToastDemo() {
	return (
		<div className="flex flex-wrap gap-2">
			<DemoButton onClick={() => toast("3 elements duplicated")}>
				Default
			</DemoButton>
			<DemoButton onClick={() => toast.success("Exported to PNG")}>
				Success
			</DemoButton>
			<DemoButton onClick={() => toast.error("Failed to save", { description: "Network unavailable" })}>
				Error
			</DemoButton>
			<DemoButton onClick={() => toast.undo("Deleted 2 elements", () => {})}>
				With undo
			</DemoButton>
		</div>
	)
}

function DemoButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="h-7 px-3 rounded-md border text-xs text-muted-foreground hover:bg-muted transition-colors"
		>
			{children}
		</button>
	)
}
