"use client"

import { useState } from "react"
import { create } from "zustand"

import { usePathname } from "@/i18n/navigation"

/**
 * What survives a re-entry into `/tools`, and what replays.
 *
 * Both halves exist for the same reported symptom: switching language on
 * `/tools` "looks like a refresh". Measured, it is two separate things:
 *
 * 1. The filters reset. A query of "generator" came back empty.
 * 2. **26 `rise` animations replay at once** — the heading, the three filter
 *    rows, the count and all 17 cards stagger in again, about 1.3s of motion.
 *
 * Neither is what a visitor asked for. Changing language is not leaving the
 * page; it is the same page in another language.
 */

interface ToolsFilterState {
  searchQuery: string
  category: string
  audience: string
  setSearchQuery: (searchQuery: string) => void
  setCategory: (category: string) => void
  setAudience: (audience: string) => void
}

export const useToolsFilterStore = create<ToolsFilterState>()((set) => ({
  searchQuery: "",
  category: "all",
  audience: "all",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategory: (category) => set({ category }),
  setAudience: (audience) => set({ audience })
}))

/** Routes whose entrance has already played in this tab. */
const entered = new Set<string>()

/**
 * Should this route's entrance animation run?
 *
 * Once per route per tab. A locale switch remounts the tree with the same
 * pathname, so the second mount gets `false` and the page simply swaps its
 * text — which is what a language toggle should look like.
 *
 * The `typeof window` guard is load-bearing, not defensive: on the server this
 * Set is process-global and shared across requests, so consulting it would let
 * one visitor's arrival decide the markup sent to the next one, and hydration
 * would mismatch on the class list. The server always animates; a fresh client
 * has an empty Set and agrees.
 */
export function useRouteEntrance(): boolean {
  const pathname = usePathname()

  const [animate] = useState(() => {
    if (typeof window === "undefined") return true
    const seen = entered.has(pathname)
    entered.add(pathname)
    return !seen
  })

  return animate
}
