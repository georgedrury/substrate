"use client"

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react"
import { useCanvas, type CanvasState } from "./canvas-context"

const MAX_HISTORY = 50

// ── State ──

interface HistoryState {
  past: CanvasState[]
  future: CanvasState[]
}

const initialState: HistoryState = {
  past: [],
  future: [],
}

// ── Actions ──

type HistoryAction =
  | { type: "PUSH"; snapshot: CanvasState }
  | { type: "SET_PAST_HEAD"; state: CanvasState; currentSnapshot: CanvasState }
  | { type: "SET_FUTURE_HEAD"; state: CanvasState; currentSnapshot: CanvasState }
  | { type: "CLEAR" }

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "PUSH":
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), action.snapshot],
        future: [],
      }

    case "SET_PAST_HEAD": {
      const past = state.past.slice(0, -1)
      return {
        past,
        future: [action.currentSnapshot, ...state.future],
      }
    }

    case "SET_FUTURE_HEAD": {
      const future = state.future.slice(1)
      return {
        past: [...state.past, action.currentSnapshot],
        future,
      }
    }

    case "CLEAR":
      return initialState

    default:
      return state
  }
}

// ── Context ──

interface HistoryContextValue {
  canUndo: boolean
  canRedo: boolean
  pushSnapshot: () => void
  undo: () => void
  redo: () => void
}

const HistoryContext = createContext<HistoryContextValue | null>(null)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(historyReducer, initialState)
  const { state: canvasState, dispatch: canvasDispatch } = useCanvas()

  const pushSnapshot = useCallback(() => {
    dispatch({ type: "PUSH", snapshot: canvasState })
  }, [canvasState])

  const undo = useCallback(() => {
    if (state.past.length === 0) return
    const previous = state.past[state.past.length - 1]
    dispatch({ type: "SET_PAST_HEAD", state: previous, currentSnapshot: canvasState })
    canvasDispatch({ type: "LOAD_STATE", state: previous })
  }, [state.past, canvasState, canvasDispatch])

  const redo = useCallback(() => {
    if (state.future.length === 0) return
    const next = state.future[0]
    dispatch({ type: "SET_FUTURE_HEAD", state: next, currentSnapshot: canvasState })
    canvasDispatch({ type: "LOAD_STATE", state: next })
  }, [state.future, canvasState, canvasDispatch])

  return (
    <HistoryContext.Provider
      value={{
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        pushSnapshot,
        undo,
        redo,
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider")
  return ctx
}
