"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

const subscribeNever = () => () => {}

const THEMES = [
	{ value: "light", label: "Light", icon: RiSunLine },
	{ value: "dark", label: "Dark", icon: RiMoonLine },
	{ value: "system", label: "System", icon: RiComputerLine },
]

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme()

	// The stored theme is only known in the browser, so nothing is marked
	// active during server rendering and hydration
	const mounted = useSyncExternalStore(
		subscribeNever,
		() => true,
		() => false,
	)

	return (
		<div
			role="radiogroup"
			aria-label="Theme"
			className={cn("inline-flex w-fit gap-0.5 rounded-md border p-0.5", className)}
		>
			{THEMES.map(({ value, label, icon: Icon }) => {
				const active = mounted && theme === value
				return (
					<button
						key={value}
						type="button"
						role="radio"
						aria-checked={active}
						aria-label={label}
						title={label}
						onClick={() => setTheme(value)}
						className={cn(
							"flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors",
							"hover:text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
							active && "bg-accent text-accent-foreground",
						)}
					>
						<Icon className="size-3.5" />
					</button>
				)
			})}
		</div>
	)
}
