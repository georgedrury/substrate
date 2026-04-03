"use client"

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	value: string
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
	const [hasCopied, setHasCopied] = React.useState(false)

	React.useEffect(() => {
		if (hasCopied) {
			const timeout = setTimeout(() => {
				setHasCopied(false)
			}, 2000)

			return () => clearTimeout(timeout)
		}
	}, [hasCopied])

	const copyToClipboard = () => {
		navigator.clipboard.writeText(value)
		setHasCopied(true)
	}

	return (
		<Button
			size="icon"
			variant="ghost"
			className={cn(
				"absolute right-4 top-4 z-10 size-6 text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3",
				className,
			)}
			onClick={copyToClipboard}
			{...props}
		>
			<span className="sr-only">Copy</span>
			{hasCopied ? <RiCheckLine /> : <RiFileCopyLine />}
		</Button>
	)
}
