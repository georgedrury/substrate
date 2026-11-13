"use client"

import { useEffect } from "react"
import { DesignCanvas } from "@/registry/substrate/canvas/design-canvas"
import { usePanelStore } from "@/registry/substrate/stores/panel-store"
import { useDocumentStore } from "@/registry/substrate/stores/document-store"
import { useCanvasTransform } from "@/registry/substrate/hooks/use-canvas-transform"
import { useToolStore } from "@/registry/substrate/stores/tool-store"

import { LayersPanel } from "../panels/layers-panel"
import { PropertiesPanel } from "../panels/properties-panel"
import { Tools } from "../panels/tools"

import {
	StatusBar,
	StatusBarSection,
	StatusBarItem,
	StatusBarSeparator,
} from "@/registry/substrate/components/status-bar"
import { ZoomControls } from "@/registry/substrate/components/zoom-controls"
import { HistoryControls } from "@/registry/substrate/components/history-controls"
import {
	CommandPalette,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
} from "@/registry/substrate/components/command-palette"
import { ShortcutOverlay } from "@/registry/substrate/components/shortcut-overlay"
import { toast } from "@/registry/substrate/components/toast"
import {
	createKeyboardShortcuts,
} from "@/registry/substrate/lib/keyboard-shortcuts"
import { useClipboard } from "@/registry/substrate/hooks/use-clipboard"

import {
	RiCursorLine,
	RiHand,
	RiSquareLine,
	RiCircleLine,
	RiSubtractLine,
	RiText,
	RiArtboardLine,
	RiGridLine,
} from "@remixicon/react"

import type { DesignElement } from "@/registry/substrate/types"

// ── Shortcut definitions ──

const SHORTCUT_GROUPS = [
	{
		heading: "Tools",
		shortcuts: [
			{ label: "Select", key: "V" },
			{ label: "Hand", key: "H" },
			{ label: "Rectangle", key: "R" },
			{ label: "Ellipse", key: "O" },
			{ label: "Line", key: "L" },
			{ label: "Text", key: "T" },
			{ label: "Frame", key: "F" },
		],
	},
	{
		heading: "Edit",
		shortcuts: [
			{ label: "Undo", key: "⌘+Z" },
			{ label: "Redo", key: "⌘+Shift+Z" },
			{ label: "Copy", key: "⌘+C" },
			{ label: "Cut", key: "⌘+X" },
			{ label: "Paste", key: "⌘+V" },
			{ label: "Delete", key: "⌫" },
			{ label: "Duplicate", key: "⌘+D" },
			{ label: "Select all", key: "⌘+A" },
		],
	},
	{
		heading: "View",
		shortcuts: [
			{ label: "Zoom in", key: "⌘+=" },
			{ label: "Zoom out", key: "⌘+-" },
			{ label: "Reset zoom", key: "⌘+0" },
			{ label: "Toggle grid", key: "G" },
			{ label: "Command palette", key: "⌘+K" },
			{ label: "Shortcuts", key: "?" },
		],
	},
]

// ── Clipboard hook wiring ──

function useEditorClipboard() {
	const elements = useDocumentStore((s) => s.elements)
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const addElement = useDocumentStore((s) => s.addElement)
	const deleteElements = useDocumentStore((s) => s.deleteElements)
	const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)
	const select = useDocumentStore((s) => s.select)

	useClipboard<DesignElement>({
		onCopy: () => {
			const items = [...selectedIds].map((id) => elements[id]).filter(Boolean)
			if (items.length > 0) toast.info(`Copied ${items.length} element${items.length > 1 ? "s" : ""}`)
			return items
		},
		onPaste: (items) => {
			pushSnapshot()
			const newIds: string[] = []
			for (const item of items) {
				const id = crypto.randomUUID()
				newIds.push(id)
				addElement({ ...item, id, x: item.x + 20, y: item.y + 20 } as DesignElement)
			}
			select(newIds)
			toast.info(`Pasted ${items.length} element${items.length > 1 ? "s" : ""}`)
		},
		onCut: () => {
			const items = [...selectedIds].map((id) => elements[id]).filter(Boolean)
			pushSnapshot()
			deleteElements([...selectedIds])
			toast.info(`Cut ${items.length} element${items.length > 1 ? "s" : ""}`)
			return items
		},
	})
}

// ── Keyboard shortcuts wiring ──

// DesignCanvas already installs the core shortcuts (tools, undo and redo,
// delete, duplicate, select all, zoom), so registering them again here would
// run each twice. Only what the canvas doesn't cover is added.
function useEditorShortcuts() {
	const toggleGrid = useDocumentStore((s) => s.toggleGrid)

	useEffect(() => {
		return createKeyboardShortcuts([
			{ key: "g", handler: () => toggleGrid(), label: "Toggle grid", group: "View" },
		])
	}, [toggleGrid])
}

// ── Command palette items ──

function EditorCommandPalette() {
	const setTool = useToolStore((s) => s.setTool)
	const toggleGrid = useDocumentStore((s) => s.toggleGrid)
	const undo = useDocumentStore((s) => s.undo)
	const redo = useDocumentStore((s) => s.redo)
	const deselectAll = useDocumentStore((s) => s.deselectAll)

	return (
		<CommandPalette>
			<CommandInput placeholder="Search actions…" />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Tools">
					<CommandItem onSelect={() => setTool("select")}>
						<RiCursorLine className="size-4" /> Select
						<CommandShortcut>V</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => setTool("hand")}>
						<RiHand className="size-4" /> Hand
						<CommandShortcut>H</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => setTool("rectangle")}>
						<RiSquareLine className="size-4" /> Rectangle
						<CommandShortcut>R</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => setTool("ellipse")}>
						<RiCircleLine className="size-4" /> Ellipse
						<CommandShortcut>O</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => setTool("line")}>
						<RiSubtractLine className="size-4" /> Line
						<CommandShortcut>L</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => setTool("text")}>
						<RiText className="size-4" /> Text
						<CommandShortcut>T</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => setTool("frame")}>
						<RiArtboardLine className="size-4" /> Frame
						<CommandShortcut>F</CommandShortcut>
					</CommandItem>
				</CommandGroup>
				<CommandGroup heading="Edit">
					<CommandItem onSelect={() => undo()}>
						Undo <CommandShortcut>⌘Z</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => redo()}>
						Redo <CommandShortcut>⌘⇧Z</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => deselectAll()}>
						Deselect all <CommandShortcut>Esc</CommandShortcut>
					</CommandItem>
				</CommandGroup>
				<CommandGroup heading="View">
					<CommandItem onSelect={() => toggleGrid()}>
						<RiGridLine className="size-4" /> Toggle grid
						<CommandShortcut>G</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandPalette>
	)
}

// ── Status bar ──

function EditorStatusBar() {
	const zoom = useDocumentStore((s) => s.camera.zoom)
	const { setZoom, zoomToFit } = useCanvasTransform()
	const selectedIds = useDocumentStore((s) => s.selectedIds)
	const elementOrder = useDocumentStore((s) => s.elementOrder)
	const activeTool = useToolStore((s) => s.activeTool)
	const showGrid = useDocumentStore((s) => s.showGrid)

	return (
		<StatusBar>
			<StatusBarSection align="left">
				<StatusBarItem>{activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}</StatusBarItem>
				<StatusBarSeparator />
				{selectedIds.size > 0 ? (
					<StatusBarItem>{selectedIds.size} selected</StatusBarItem>
				) : (
					<StatusBarItem>{elementOrder.length} element{elementOrder.length !== 1 ? "s" : ""}</StatusBarItem>
				)}
				{showGrid && (
					<>
						<StatusBarSeparator />
						<StatusBarItem>Grid</StatusBarItem>
					</>
				)}
			</StatusBarSection>

			<StatusBarSection align="center">
				<HistoryControls size="sm" />
			</StatusBarSection>

			<StatusBarSection align="right">
				<ZoomControls
					zoom={zoom}
					onZoomChange={setZoom}
					onZoomToFit={zoomToFit}
					min={0.1}
					max={10}
					step={0.1}
				/>
			</StatusBarSection>
		</StatusBar>
	)
}

// ── Main layout ──

function EditorLayout() {
	const leftPanel = usePanelStore((s) => s.leftPanel)
	const rightPanelOpen = usePanelStore((s) => s.rightPanelOpen)

	useEditorShortcuts()
	useEditorClipboard()

	return (
		<div className="flex h-screen w-screen flex-col overflow-hidden">
			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left panel */}
				{leftPanel === "layers" && <LayersPanel />}

				{/* Toolbar (floating, positioned by the component itself) */}
				<Tools />

				{/* Canvas */}
				<div className="relative flex-1">
					<DesignCanvas />
				</div>

				{/* Right panel */}
				{rightPanelOpen && <PropertiesPanel />}
			</div>

			{/* Status bar */}
			<EditorStatusBar />

			{/* Overlays */}
			<EditorCommandPalette />
			<ShortcutOverlay groups={SHORTCUT_GROUPS} />
		</div>
	)
}

export function DesignEditor() {
	return <EditorLayout />
}
