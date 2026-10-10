import { create } from "zustand"
import type { DesignElement, Camera } from "@/lib/substrate/types"

const MAX_HISTORY = 50

// ── Snapshot (what gets saved for undo/redo) ──

export interface DocumentSnapshot {
  elements: Record<string, DesignElement>
  elementOrder: string[]
  camera: Camera
  showGrid: boolean
}

// ── State + Actions ──

interface DocumentState extends DocumentSnapshot {
  // Selection
  selectedIds: Set<string>
  hoveredId: string | null

  // History
  past: DocumentSnapshot[]
  future: DocumentSnapshot[]

  // Element actions
  addElement: (element: DesignElement) => void
  updateElement: (id: string, changes: Partial<DesignElement>) => void
  deleteElements: (ids: string[]) => void
  reorderElement: (id: string, newIndex: number) => void

  // Camera actions
  setCamera: (camera: Partial<Camera>) => void
  toggleGrid: () => void

  // Selection actions
  select: (ids: string[], append?: boolean) => void
  deselectAll: () => void
  toggleSelection: (id: string) => void
  setHovered: (id: string | null) => void

  // History actions
  pushSnapshot: () => void
  undo: () => void
  redo: () => void
  loadState: (snapshot: DocumentSnapshot) => void
}

function takeSnapshot(state: DocumentState): DocumentSnapshot {
  return {
    elements: state.elements,
    elementOrder: state.elementOrder,
    camera: state.camera,
    showGrid: state.showGrid,
  }
}

export const useDocumentStore = create<DocumentState>()((set, get) => ({
  // Initial state
  elements: {},
  elementOrder: [],
  camera: { x: 0, y: 0, zoom: 1 },
  showGrid: false,

  selectedIds: new Set<string>(),
  hoveredId: null,

  past: [],
  future: [],

  // ── Element actions ──

  addElement: (element) =>
    set((s) => ({
      elements: { ...s.elements, [element.id]: element },
      elementOrder: [...s.elementOrder, element.id],
    })),

  updateElement: (id, changes) =>
    set((s) => {
      const existing = s.elements[id]
      if (!existing) return s
      return {
        elements: {
          ...s.elements,
          [id]: { ...existing, ...changes } as DesignElement,
        },
      }
    }),

  deleteElements: (ids) =>
    set((s) => {
      const idSet = new Set(ids)
      const elements = { ...s.elements }
      for (const id of ids) delete elements[id]
      return {
        elements,
        elementOrder: s.elementOrder.filter((id) => !idSet.has(id)),
      }
    }),

  reorderElement: (id, newIndex) =>
    set((s) => {
      const order = s.elementOrder.filter((eid) => eid !== id)
      order.splice(newIndex, 0, id)
      return { elementOrder: order }
    }),

  // ── Camera actions ──

  setCamera: (camera) =>
    set((s) => ({ camera: { ...s.camera, ...camera } })),

  toggleGrid: () =>
    set((s) => ({ showGrid: !s.showGrid })),

  // ── Selection actions ──

  select: (ids, append) =>
    set((s) => {
      if (append) {
        const next = new Set(s.selectedIds)
        for (const id of ids) next.add(id)
        return { selectedIds: next }
      }
      return { selectedIds: new Set(ids) }
    }),

  deselectAll: () =>
    set((s) => {
      if (s.selectedIds.size === 0) return s
      return { selectedIds: new Set<string>() }
    }),

  toggleSelection: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    }),

  setHovered: (id) =>
    set((s) => {
      if (s.hoveredId === id) return s
      return { hoveredId: id }
    }),

  // ── History actions ──

  pushSnapshot: () =>
    set((s) => ({
      past: [...s.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(s)],
      future: [],
    })),

  undo: () => {
    const s = get()
    if (s.past.length === 0) return
    const previous = s.past[s.past.length - 1]
    set({
      ...previous,
      past: s.past.slice(0, -1),
      future: [takeSnapshot(s), ...s.future],
      // Preserve selection and hover
      selectedIds: s.selectedIds,
      hoveredId: s.hoveredId,
    })
  },

  redo: () => {
    const s = get()
    if (s.future.length === 0) return
    const next = s.future[0]
    set({
      ...next,
      past: [...s.past, takeSnapshot(s)],
      future: s.future.slice(1),
      selectedIds: s.selectedIds,
      hoveredId: s.hoveredId,
    })
  },

  loadState: (snapshot) =>
    set({
      ...snapshot,
    }),
}))
