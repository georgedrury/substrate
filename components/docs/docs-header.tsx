import { differenceInDays, formatDistanceToNow } from "date-fns"

type DocsHeaderProps = {
	title: string
	description?: string
	updated?: Date
}

export default function DocsHeader({
	title,
	description,
	updated,
}: DocsHeaderProps) {
	return (
		<div className="mb-12 space-y-2">
			<h1 className="!mt-0 text-5xl ">{title}</h1>

			{description && (
				<p className="text-lg text-muted-foreground">{description}</p>
			)}

			{updated && (
				<p className="text-xs text-muted-foreground">
					Updated{" "}
					{differenceInDays(new Date(), updated) === 0
						? "today"
						: formatDistanceToNow(updated, { addSuffix: true })}
				</p>
			)}
		</div>
	)
}
