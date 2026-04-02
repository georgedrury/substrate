"use client"

import type { ReactNode } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CanvasProvider } from "../contexts/canvas-context"
import { SelectionProvider } from "../contexts/selection-context"
import { ToolProvider } from "../contexts/tool-context"
import { HistoryProvider } from "../contexts/history-context"
import { PanelProvider } from "../contexts/panel-context"

export function DesignProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <CanvasProvider>
        <SelectionProvider>
          <ToolProvider>
            <HistoryProvider>
              <PanelProvider>
                {children}
              </PanelProvider>
            </HistoryProvider>
          </ToolProvider>
        </SelectionProvider>
      </CanvasProvider>
    </TooltipProvider>
  )
}
