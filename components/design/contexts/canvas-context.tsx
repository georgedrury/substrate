"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { DesignElement, Camera } from "../types"

// ── State ──

export interface CanvasState {
  elements: Record<string, DesignElement>
  elementOrder: string[]
  camera: Camera
}

const initialState: CanvasState = {
  elements: {},
  elementOrder: [],
  camera: { x: 0, y: 0, zoom: 1 },
}

// ── Actions ──

export type CanvasAction =
  | { type: "ADD_ELEMENT"; element: DesignElement }
  | { type: "UPDATE_ELEMENT"; id: string; changes: Partial<DesignElement> }
  | { type: "DELETE_ELEMENTS"; ids: string[] }
  | { type: "REORDER_ELEMENT"; id: string; newIndex: number }
  | { type: "SET_CAMERA"; camera: Partial<Camera> }
  | { type: "LOAD_STATE"; state: CanvasState }

// ── Reducer ──

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "ADD_ELEMENT":
      return {
        ...state,
        elements: { ...state.elements, [action.element.id]: action.element },
        elementOrder: [...state.elementOrder, action.element.id],
      }

    case "UPDATE_ELEMENT": {
      const existing = state.elements[action.id]
      if (!existing) return state
      return {
        ...state,
        elements: {
          ...state.elements,
          [action.id]: { ...existing, ...action.changes } as DesignElement,
        },
      }
    }

    case "DELETE_ELEMENTS": {
      const idSet = new Set(action.ids)
      const elements = { ...state.elements }
      for (const id of action.ids) delete elements[id]
      return {
        ...state,
        elements,
        elementOrder: state.elementOrder.filter((id) => !idSet.has(id)),
      }
    }

    case "REORDER_ELEMENT": {
      const order = state.elementOrder.filter((id) => id !== action.id)
      order.splice(action.newIndex, 0, action.id)
      return { ...state, elementOrder: order }
    }

    case "SET_CAMERA":
      return {
        ...state,
        camera: { ...state.camera, ...action.camera },
      }

    case "LOAD_STATE":
      return action.state

    default:
      return state
  }
}

// ── Context ──

interface CanvasContextValue {
  state: CanvasState
  dispatch: React.Dispatch<CanvasAction>
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(canvasReducer, initialState)
  return (
    <CanvasContext.Provider value={{ state, dispatch }}>
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const ctx = useContext(CanvasContext)
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider")
  return ctx
}
