import { create } from "zustand"
import type { LeftPanelId, RightPanelId } from "@/lib/substrate/types"

interface PanelState {
  leftPanel: LeftPanelId
  rightPanel: RightPanelId
  rightPanelOpen: boolean
  setLeftPanel: (panel: LeftPanelId) => void
  setRightPanel: (panel: RightPanelId) => void
  toggleRightPanel: () => void
}

export const usePanelStore = create<PanelState>()((set) => ({
  leftPanel: "layers",
  rightPanel: "properties",
  rightPanelOpen: true,

  setLeftPanel: (panel) =>
    set({ leftPanel: panel }),

  setRightPanel: (panel) =>
    set({ rightPanel: panel }),

  toggleRightPanel: () =>
    set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
}))
