"use client"

import { useEffect, useRef, useCallback } from "react"
import { useCanvas } from "../contexts/canvas-context"
import { useSelection } from "../contexts/selection-context"
import { useTool } from "../contexts/tool-context"
import { useHistory } from "../contexts/history-context"
import { useCanvasTransform } from "./use-canvas-transform"
import { generateId } from "../lib/id"
import type { DesignElement } from "../types"

export function useKeyboardShortcuts() {
  const { state: canvasState, dispatch: canvasDispatch } = useCanvas()
  const { state: selectionState, dispatch: selectionDispatch } = useSelection()
  const { setTool, setTemporaryTool, restoreTool } = useTool()
  const { undo, redo, pushSnapshot } = useHistory()
  const { zoomIn, zoomOut, resetZoom } = useCanvasTransform()
  const spaceHeldRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      const meta = e.metaKey || e.ctrlKey

      // Space for temporary hand tool
      if (e.code === "Space" && !spaceHeldRef.current && !meta) {
        e.preventDefault()
        spaceHeldRef.current = true
        setTemporaryTool("hand")
        return
      }

      // Tool shortcuts (no modifiers)
      if (!meta && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "v": setTool("select"); return
          case "h": setTool("hand"); return
          case "r": setTool("rectangle"); return
          case "o": setTool("ellipse"); return
          case "l": setTool("line"); return
          case "t": setTool("text"); return
          case "f": setTool("frame"); return
        }
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectionState.selectedIds.size > 0) {
          e.preventDefault()
          pushSnapshot()
          canvasDispatch({
            type: "DELETE_ELEMENTS",
            ids: [...selectionState.selectedIds],
          })
          selectionDispatch({ type: "DESELECT_ALL" })
        }
        return
      }

      // Cmd+Z / Cmd+Shift+Z
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }

      // Cmd+A — select all
      if (meta && e.key.toLowerCase() === "a") {
        e.preventDefault()
        selectionDispatch({
          type: "SELECT",
          ids: canvasState.elementOrder,
        })
        return
      }

      // Cmd+D — duplicate
      if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault()
        if (selectionState.selectedIds.size === 0) return
        pushSnapshot()
        const newIds: string[] = []
        for (const id of selectionState.selectedIds) {
          const el = canvasState.elements[id]
          if (!el) continue
          const newId = generateId()
          const clone: DesignElement = {
            ...el,
            id: newId,
            name: `${el.name} Copy`,
            x: el.x + 20,
            y: el.y + 20,
          } as DesignElement
          canvasDispatch({ type: "ADD_ELEMENT", element: clone })
          newIds.push(newId)
        }
        selectionDispatch({ type: "SELECT", ids: newIds })
        return
      }

      // Zoom
      if (e.key === "=" || e.key === "+") {
        e.preventDefault()
        zoomIn()
        return
      }
      if (e.key === "-") {
        e.preventDefault()
        zoomOut()
        return
      }
      if (meta && e.key === "0") {
        e.preventDefault()
        resetZoom()
        return
      }

      // Escape — deselect
      if (e.key === "Escape") {
        selectionDispatch({ type: "DESELECT_ALL" })
        setTool("select")
        return
      }
    },
    [
      canvasState, selectionState, canvasDispatch, selectionDispatch,
      setTool, setTemporaryTool, undo, redo, pushSnapshot,
      zoomIn, zoomOut, resetZoom,
    ]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" && spaceHeldRef.current) {
        spaceHeldRef.current = false
        restoreTool()
      }
    },
    [restoreTool]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
}
