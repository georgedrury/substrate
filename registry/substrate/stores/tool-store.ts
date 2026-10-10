import { create } from "zustand"
import type { ToolType } from "@/lib/substrate/types"

interface ToolState {
  activeTool: ToolType
  previousTool: ToolType | null
  setTool: (tool: ToolType) => void
  setTemporaryTool: (tool: ToolType) => void
  restoreTool: () => void
}

export const useToolStore = create<ToolState>()((set) => ({
  activeTool: "select",
  previousTool: null,

  setTool: (tool) =>
    set({ activeTool: tool, previousTool: null }),

  setTemporaryTool: (tool) =>
    set((s) => ({
      activeTool: tool,
      previousTool: s.previousTool ?? s.activeTool,
    })),

  restoreTool: () =>
    set((s) => {
      if (!s.previousTool) return s
      return { activeTool: s.previousTool, previousTool: null }
    }),
}))
