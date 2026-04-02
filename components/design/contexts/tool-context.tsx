"use client"

import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  type ReactNode,
} from "react"
import type { ToolType } from "../types"

// ── State ──

interface ToolState {
  activeTool: ToolType
  previousTool: ToolType | null
}

const initialState: ToolState = {
  activeTool: "select",
  previousTool: null,
}

// ── Actions ──

type ToolAction =
  | { type: "SET_TOOL"; tool: ToolType }
  | { type: "SET_TEMPORARY_TOOL"; tool: ToolType }
  | { type: "RESTORE_TOOL" }

function toolReducer(state: ToolState, action: ToolAction): ToolState {
  switch (action.type) {
    case "SET_TOOL":
      return { activeTool: action.tool, previousTool: null }

    case "SET_TEMPORARY_TOOL":
      return {
        activeTool: action.tool,
        previousTool: state.previousTool ?? state.activeTool,
      }

    case "RESTORE_TOOL":
      if (!state.previousTool) return state
      return { activeTool: state.previousTool, previousTool: null }

    default:
      return state
  }
}

// ── Context ──

interface ToolContextValue {
  activeTool: ToolType
  setTool: (tool: ToolType) => void
  setTemporaryTool: (tool: ToolType) => void
  restoreTool: () => void
}

const ToolContext = createContext<ToolContextValue | null>(null)

export function ToolProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toolReducer, initialState)

  const setTool = useCallback(
    (tool: ToolType) => dispatch({ type: "SET_TOOL", tool }),
    []
  )
  const setTemporaryTool = useCallback(
    (tool: ToolType) => dispatch({ type: "SET_TEMPORARY_TOOL", tool }),
    []
  )
  const restoreTool = useCallback(
    () => dispatch({ type: "RESTORE_TOOL" }),
    []
  )

  return (
    <ToolContext.Provider
      value={{ activeTool: state.activeTool, setTool, setTemporaryTool, restoreTool }}
    >
      {children}
    </ToolContext.Provider>
  )
}

export function useTool() {
  const ctx = useContext(ToolContext)
  if (!ctx) throw new Error("useTool must be used within ToolProvider")
  return ctx
}
