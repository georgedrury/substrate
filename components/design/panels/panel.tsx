import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type PanelProps = {
	position?: "left" | "right"
	variant?: "tool" | "default"
}

export function Panel({
	className,
	children,
	position = "right",
	variant = "default",
	...props
}: PanelProps & React.ComponentProps<"div">) {
	return (
		<div
			data-position={position}
			data-variant={variant}
			data-slot="panel"
			className={cn(
				"w-70 h-full bg-background data-[position=right]:border-l data-[position=left]:border-r",
				className,
			)}
			{...props}
		>
			<ScrollArea>
				<div
					data-variant={variant}
					className="space-y-3 h-full py-2 data-[variant=tool]:flex data-[variant=tool]:flex-col data-[variant=tool]:justify-between"
				>
					{children}
				</div>
			</ScrollArea>
		</div>
	)
}
