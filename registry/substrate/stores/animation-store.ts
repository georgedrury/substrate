import { create } from "zustand"

interface AnimationState {
  duration: number
  currentTime: number
  isPlaying: boolean
  fps: number
  zoomLevel: number
  selectedKeyframeIds: Set<string>
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  togglePlayback: () => void
  play: () => void
  pause: () => void
  setZoomLevel: (level: number) => void
  selectKeyframe: (id: string, additive?: boolean) => void
  clearKeyframeSelection: () => void
}

export const useAnimationStore = create<AnimationState>()((set, get) => ({
  duration: 5,
  currentTime: 0,
  isPlaying: false,
  fps: 60,
  zoomLevel: 100,
  selectedKeyframeIds: new Set(),

  setCurrentTime: (time) => {
    const { duration } = get()
    const clamped = Math.max(0, Math.min(time, duration))
    set({ currentTime: clamped })
  },

  setDuration: (duration) => {
    set({ duration: Math.max(0.1, duration) })
  },

  togglePlayback: () => {
    set((s) => ({ isPlaying: !s.isPlaying }))
  },

  play: () => {
    set({ isPlaying: true })
  },

  pause: () => {
    set({ isPlaying: false })
  },

  setZoomLevel: (level) => {
    const clamped = Math.max(20, Math.min(level, 500))
    set({ zoomLevel: clamped })
  },

  selectKeyframe: (id, additive) => {
    set((s) => {
      const newSelection = additive
        ? new Set(s.selectedKeyframeIds)
        : new Set([id])

      if (!additive || !s.selectedKeyframeIds.has(id)) {
        newSelection.add(id)
      } else {
        newSelection.delete(id)
      }

      return { selectedKeyframeIds: newSelection }
    })
  },

  clearKeyframeSelection: () => {
    set({ selectedKeyframeIds: new Set() })
  },
}))
