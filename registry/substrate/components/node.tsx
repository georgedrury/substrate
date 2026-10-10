"use client"

import { cn } from "@/lib/utils"

// ── Port Types ──

const PORT_TYPES = [
	"number",
	"colour",
	"image",
	"geometry",
	"text",
	"boolean",
	"any",
] as const

type PortType = (typeof PORT_TYPES)[number]

const portColourVar: Record<PortType, string> = {
	number: "var(--color-node-port-number)",
	colour: "var(--color-node-port-colour)",
	image: "var(--color-node-port-image)",
	geometry: "var(--color-node-port-geometry)",
	text: "var(--color-node-port-text)",
	boolean: "var(--color-node-port-boolean)",
	any: "var(--color-node-port-any)",
}

// ── NodeCard ──

type NodeCardProps = {
	selected?: boolean
} & React.ComponentProps<"div">

function NodeCard({
	selected,
	className,
	...props
}: NodeCardProps) {
	return (
		<div
			data-slot="node-card"
			data-selected={selected || undefined}
			className={cn(
				"relative w-56 rounded-lg overflow-hidden",
				"bg-node-bg border border-node-border shadow-md",
				"transition-shadow",
				selected && "ring-2 ring-node-selected shadow-lg",
				className,
			)}
			{...props}
		/>
	)
}

// ── NodeHeader ──

type NodeHeaderProps = {
	colour?: string
} & React.ComponentProps<"div">

function NodeHeader({
	colour,
	className,
	children,
	...props
}: NodeHeaderProps) {
	return (
		<div
			data-slot="node-header"
			className={cn(
				"flex items-center gap-2 h-8 px-3 text-xs font-medium",
				"bg-node-header",
				className,
			)}
			style={colour ? { backgroundColor: colour } : undefined}
			{...props}
		>
			{children}
		</div>
	)
}

// ── NodeTitle ──

function NodeTitle({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="node-title"
			className={cn("flex-1 truncate", className)}
			{...props}
		/>
	)
}

// ── NodeBadge ──

function NodeBadge({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="node-badge"
			className={cn(
				"text-[10px] px-1.5 py-0.5 rounded bg-background/20 text-current/70",
				className,
			)}
			{...props}
		/>
	)
}

// ── NodeBody ──

function NodeBody({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="node-body"
			className={cn("p-3 space-y-2", className)}
			{...props}
		/>
	)
}

// ── NodePorts ──

function NodePorts({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="node-ports"
			className={cn("flex flex-col gap-1 py-2", className)}
			{...props}
		/>
	)
}

// ── NodePort ──

type NodePortProps = {
	type: PortType
	label: string
	direction: "input" | "output"
	connected?: boolean
} & React.ComponentProps<"div">

function NodePort({
	type,
	label,
	direction,
	connected,
	className,
	...props
}: NodePortProps) {
	const colour = portColourVar[type]

	return (
		<div
			data-slot="node-port"
			data-direction={direction}
			data-port-type={type}
			data-connected={connected || undefined}
			className={cn(
				"relative flex items-center gap-2 h-6 text-xs",
				// Padding on both sides keeps the label clear of the port dot
				"px-3",
				direction === "output" && "flex-row-reverse",
				className,
			)}
			{...props}
		>
			<NodePortDot
				colour={colour}
				connected={connected}
				className={cn(
					"absolute",
					direction === "input" ? "-left-1.5" : "-right-1.5",
				)}
			/>
			<span
				className={cn(
					"truncate text-muted-foreground",
					direction === "output" && "text-right",
				)}
			>
				{label}
			</span>
		</div>
	)
}

// ── NodePortDot ──

type NodePortDotProps = {
	colour: string
	connected?: boolean
} & React.ComponentProps<"span">

function NodePortDot({
	colour,
	connected,
	className,
	...props
}: NodePortDotProps) {
	return (
		<span
			data-slot="node-port-dot"
			className={cn(
				"size-3 rounded-full border-2 shrink-0 transition-colors",
				connected ? "border-transparent" : "border-current bg-node-bg",
				className,
			)}
			style={{
				borderColor: connected ? colour : undefined,
				backgroundColor: connected ? colour : undefined,
				color: colour,
			}}
			{...props}
		/>
	)
}

// ── NodePreview ──

function NodePreview({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="node-preview"
			className={cn(
				"mx-3 mb-3 rounded-md overflow-hidden bg-muted aspect-video",
				className,
			)}
			{...props}
		/>
	)
}

// ── NodeDivider ──

function NodeDivider({ className }: { className?: string }) {
	return (
		<div
			data-slot="node-divider"
			className={cn("h-px bg-border mx-3", className)}
		/>
	)
}

export {
	NodeCard,
	NodeHeader,
	NodeTitle,
	NodeBadge,
	NodeBody,
	NodePorts,
	NodePort,
	NodePortDot,
	NodePreview,
	NodeDivider,
	PORT_TYPES,
	portColourVar,
	type PortType,
	type NodeCardProps,
	type NodePortProps,
}
