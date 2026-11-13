import { create } from "zustand"
import type { DesignElement, Camera } from "@/lib/substrate/types"
import { generateId } from "@/lib/substrate/id"

const MAX_HISTORY = 50

// ── Snapshot (what gets saved for undo/redo) ──

export interface DocumentSnapshot {
  elements: Record<string, DesignElement>
  elementOrder: string[]
  camera: Camera
  showGrid: boolean
}

// Undo and redo cover the document's content only. Pan, zoom and the grid are
// view state: undoing an edit must not move the viewport back to where it was
// when that edit was made.
export type HistoryEntry = Pick<DocumentSnapshot, "elements" | "elementOrder">

// ── State + Actions ──

interface DocumentState extends DocumentSnapshot {
  // Selection
  selectedIds: Set<string>
  hoveredId: string | null

  // History
  past: HistoryEntry[]
  future: HistoryEntry[]

  // Element actions
  addElement: (element: DesignElement) => void
  updateElement: (id: string, changes: Partial<DesignElement>) => void
  deleteElements: (ids: string[]) => void
  reorderElement: (id: string, newIndex: number) => void
  /** Replace the whole stacking order, e.g. after a drag-to-reorder in a layer list */
  setElementOrder: (order: string[]) => void
  /** Clone elements (the selection by default), offset and selected. Records its own undo step. */
  duplicateElements: (ids?: string[]) => void

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

function takeSnapshot(state: DocumentState): HistoryEntry {
  return {
    elements: state.elements,
    elementOrder: state.elementOrder,
  }
}

// Ids of elements that undo or redo removed must not stay selected or hovered
function applyHistoryEntry(
  entry: HistoryEntry,
  state: DocumentState,
): Pick<DocumentState, "elements" | "elementOrder" | "selectedIds" | "hoveredId"> {
  const selectedIds = new Set([...state.selectedIds].filter((id) => entry.elements[id]))
  return {
    elements: entry.elements,
    elementOrder: entry.elementOrder,
    selectedIds: selectedIds.size === state.selectedIds.size ? state.selectedIds : selectedIds,
    hoveredId: state.hoveredId && entry.elements[state.hoveredId] ? state.hoveredId : null,
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

  setElementOrder: (order) =>
    set((s) => {
      const known = order.filter((id) => s.elements[id])
      const seen = new Set(known)
      // Anything the caller left out keeps its place at the end rather than vanishing
      return { elementOrder: [...known, ...s.elementOrder.filter((id) => !seen.has(id))] }
    }),

  duplicateElements: (ids) =>
    set((s) => {
      const source = new Set(ids ?? s.selectedIds)
      // Walk the stacking order so copies keep their relative z-order
      const originals = s.elementOrder.filter((id) => source.has(id))
      if (originals.length === 0) return s

      const elements = { ...s.elements }
      const elementOrder = [...s.elementOrder]
      const copies: string[] = []
      for (const id of originals) {
        const el = s.elements[id]
        const copyId = generateId()
        elements[copyId] = { ...el, id: copyId, name: `${el.name} Copy`, x: el.x + 20, y: el.y + 20 } as DesignElement
        elementOrder.push(copyId)
        copies.push(copyId)
      }

      return {
        elements,
        elementOrder,
        selectedIds: new Set(copies),
        past: [...s.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(s)],
        future: [],
      }
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
      ...applyHistoryEntry(previous, s),
      past: s.past.slice(0, -1),
      future: [takeSnapshot(s), ...s.future],
    })
  },

  redo: () => {
    const s = get()
    if (s.future.length === 0) return
    const next = s.future[0]
    set({
      ...applyHistoryEntry(next, s),
      past: [...s.past, takeSnapshot(s)],
      future: s.future.slice(1),
    })
  },

  loadState: (snapshot) =>
    set({
      ...snapshot,
    }),
}))
