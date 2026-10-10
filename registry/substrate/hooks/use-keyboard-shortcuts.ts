"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDocumentStore } from "@/stores/substrate/document-store"
import { useToolStore } from "@/stores/substrate/tool-store"
import { useCanvasTransform } from "./use-canvas-transform"
import { generateId } from "@/lib/substrate/id"
import type { DesignElement } from "@/lib/substrate/types"

export function useKeyboardShortcuts() {
  const elements = useDocumentStore((s) => s.elements)
  const elementOrder = useDocumentStore((s) => s.elementOrder)
  const selectedIds = useDocumentStore((s) => s.selectedIds)
  const addElement = useDocumentStore((s) => s.addElement)
  const deleteElements = useDocumentStore((s) => s.deleteElements)
  const select = useDocumentStore((s) => s.select)
  const deselectAll = useDocumentStore((s) => s.deselectAll)
  const pushSnapshot = useDocumentStore((s) => s.pushSnapshot)
  const undo = useDocumentStore((s) => s.undo)
  const redo = useDocumentStore((s) => s.redo)

  const setTool = useToolStore((s) => s.setTool)
  const setTemporaryTool = useToolStore((s) => s.setTemporaryTool)
  const restoreTool = useToolStore((s) => s.restoreTool)

  const { zoomIn, zoomOut, resetZoom } = useCanvasTransform()
  const spaceHeldRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      const meta = e.metaKey || e.ctrlKey

      if (e.code === "Space" && !spaceHeldRef.current && !meta) {
        e.preventDefault()
        spaceHeldRef.current = true
        setTemporaryTool("hand")
        return
      }

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

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size > 0) {
          e.preventDefault()
          pushSnapshot()
          deleteElements([...selectedIds])
          deselectAll()
        }
        return
      }

      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }

      if (meta && e.key.toLowerCase() === "a") {
        e.preventDefault()
        select(elementOrder)
        return
      }

      if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault()
        if (selectedIds.size === 0) return
        pushSnapshot()
        const newIds: string[] = []
        for (const id of selectedIds) {
          const el = elements[id]
          if (!el) continue
          const newId = generateId()
          const clone: DesignElement = {
            ...el,
            id: newId,
            name: `${el.name} Copy`,
            x: el.x + 20,
            y: el.y + 20,
          } as DesignElement
          addElement(clone)
          newIds.push(newId)
        }
        select(newIds)
        return
      }

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

      if (e.key === "Escape") {
        deselectAll()
        setTool("select")
        return
      }
    },
    [
      elements, elementOrder, selectedIds, addElement, deleteElements,
      select, deselectAll, pushSnapshot, undo, redo,
      setTool, setTemporaryTool, zoomIn, zoomOut, resetZoom,
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
