import { RiInformationLine } from "@remixicon/react"

type BannerProps = {
	title?: string
	description?: string | React.ReactNode
}

export function Banner({ title, description }: BannerProps) {
	return (
		<div className="my-3 rounded-lg border p-4">
			<div className="flex gap-3">
				<RiInformationLine className="size-5 shrink-0 mt-0.5" />
				<div>
					{title && <p className="font-medium text-sm">{title}</p>}
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			</div>
		</div>
	)
}
