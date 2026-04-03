"use client"

import {
	createContext,
	useContext,
	useReducer,
	useCallback,
	type ReactNode,
} from "react"
import type { LeftPanelId, RightPanelId } from "../types"

// ── State ──

export interface PanelState {
	leftPanel: LeftPanelId
	rightPanel: RightPanelId
	rightPanelOpen: boolean
}

const initialState: PanelState = {
	leftPanel: "layers",
	rightPanel: "properties",
	rightPanelOpen: true,
}

// ── Actions ──

type PanelAction =
	| { type: "SET_LEFT_PANEL"; panel: LeftPanelId }
	| { type: "SET_RIGHT_PANEL"; panel: RightPanelId }
	| { type: "TOGGLE_RIGHT_PANEL" }

function panelReducer(state: PanelState, action: PanelAction): PanelState {
	switch (action.type) {
		case "SET_LEFT_PANEL":
			return { ...state, leftPanel: action.panel }
		case "SET_RIGHT_PANEL":
			return { ...state, rightPanel: action.panel }
		case "TOGGLE_RIGHT_PANEL":
			return { ...state, rightPanelOpen: !state.rightPanelOpen }
		default:
			return state
	}
}

// ── Context ──

interface PanelContextValue {
	state: PanelState
	setLeftPanel: (panel: LeftPanelId) => void
	setRightPanel: (panel: RightPanelId) => void
	toggleRightPanel: () => void
}

const PanelContext = createContext<PanelContextValue | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(panelReducer, initialState)

	const setLeftPanel = useCallback(
		(panel: LeftPanelId) => dispatch({ type: "SET_LEFT_PANEL", panel }),
		[],
	)
	const setRightPanel = useCallback(
		(panel: RightPanelId) => dispatch({ type: "SET_RIGHT_PANEL", panel }),
		[],
	)
	const toggleRightPanel = useCallback(
		() => dispatch({ type: "TOGGLE_RIGHT_PANEL" }),
		[],
	)

	return (
		<PanelContext.Provider
			value={{ state, setLeftPanel, setRightPanel, toggleRightPanel }}
		>
			{children}
		</PanelContext.Provider>
	)
}

export function usePanel() {
	const ctx = useContext(PanelContext)
	if (!ctx) throw new Error("usePanel must be used within PanelProvider")
	return ctx
}
