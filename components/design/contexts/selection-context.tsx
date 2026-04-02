"use client"

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from "react"
import type { DesignElement } from "../types"
import { useCanvas } from "./canvas-context"

// ── State ──

export interface SelectionState {
  selectedIds: Set<string>
  hoveredId: string | null
}

const initialState: SelectionState = {
  selectedIds: new Set(),
  hoveredId: null,
}

// ── Actions ──

export type SelectionAction =
  | { type: "SELECT"; ids: string[]; append?: boolean }
  | { type: "DESELECT_ALL" }
  | { type: "TOGGLE"; id: string }
  | { type: "SET_HOVERED"; id: string | null }

// ── Reducer ──

function selectionReducer(
  state: SelectionState,
  action: SelectionAction
): SelectionState {
  switch (action.type) {
    case "SELECT": {
      if (action.append) {
        const next = new Set(state.selectedIds)
        for (const id of action.ids) next.add(id)
        return { ...state, selectedIds: next }
      }
      return { ...state, selectedIds: new Set(action.ids) }
    }

    case "DESELECT_ALL":
      if (state.selectedIds.size === 0) return state
      return { ...state, selectedIds: new Set() }

    case "TOGGLE": {
      const next = new Set(state.selectedIds)
      if (next.has(action.id)) next.delete(action.id)
      else next.add(action.id)
      return { ...state, selectedIds: next }
    }

    case "SET_HOVERED":
      if (state.hoveredId === action.id) return state
      return { ...state, hoveredId: action.id }

    default:
      return state
  }
}

// ── Context ──

interface SelectionContextValue {
  state: SelectionState
  dispatch: React.Dispatch<SelectionAction>
  selectedElements: DesignElement[]
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(selectionReducer, initialState)
  const { state: canvasState } = useCanvas()

  const selectedElements = useMemo(() => {
    const result: DesignElement[] = []
    for (const id of state.selectedIds) {
      const el = canvasState.elements[id]
      if (el) result.push(el)
    }
    return result
  }, [state.selectedIds, canvasState.elements])

  return (
    <SelectionContext.Provider value={{ state, dispatch, selectedElements }}>
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider")
  return ctx
}
