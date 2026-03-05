/**
 * Zustand store for Latin-Cyrillic transliteration
 * Only persists direction preference, not text content
 * Text is stored temporarily for locale switching only
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { TextChunk, TransliterationDirection } from "../types"

interface TransliterationState {
  // Core state
  direction: TransliterationDirection
  sourceText: string
  fileName: string | null
  chunks: TextChunk[]
  selectedChunkId: number | null

  // Actions
  setDirection: (direction: TransliterationDirection) => void
  setSourceText: (text: string) => void
  setFileName: (name: string | null) => void
  setChunks: (chunks: TextChunk[]) => void
  setSelectedChunkId: (id: number | null) => void
  reset: () => void
}

const INITIAL_STATE = {
  direction: "latin-to-cyrillic" as TransliterationDirection,
  sourceText: "",
  fileName: null,
  chunks: [] as TextChunk[],
  selectedChunkId: null
}

export const useTransliterationStore = create<TransliterationState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setDirection: (direction) => set({ direction }),
      setSourceText: (sourceText) => set({ sourceText }),
      setFileName: (fileName) => set({ fileName }),
      setChunks: (chunks) => set({ chunks }),
      setSelectedChunkId: (selectedChunkId) => set({ selectedChunkId }),

      reset: () =>
        set({
          sourceText: "",
          fileName: null,
          chunks: [],
          selectedChunkId: null
        })
    }),
    {
      name: "latin-cyrillic-storage",
      // Only persist direction preference - text is temporary
      partialize: (state) => ({
        direction: state.direction
      }),
      // Skip hydration for text content - only restore direction
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clear text content on page load, keep only direction
          state.sourceText = ""
          state.fileName = null
          state.chunks = []
          state.selectedChunkId = null
        }
      }
    }
  )
)
