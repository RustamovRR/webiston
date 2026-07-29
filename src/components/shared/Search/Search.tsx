"use client"

import { SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useRef, useState } from "react"
import { searchEngine } from "@/lib/search/flexsearch"
import type { ISearchHit } from "@/types/common"
import SearchDialog from "./SearchDialog"

export default function Search() {
  const t = useTranslations("Search")
  const [open, setOpen] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [groupedHits, setGroupedHits] = useState<ISearchHit[][]>([])

  const handleSearchChange = (value: string) => {
    setQuery(value)

    clearTimeout(debounceTimer.current)

    if (!value.trim()) {
      setLoading(false)
      setGroupedHits([])
      return
    }

    setLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchEngine.search(value)
        setGroupedHits(results)
      } catch (error) {
        console.error("Search failed:", error)
        setGroupedHits([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce delay
  }

  const clearSearch = useCallback(() => {
    setQuery("")
    setGroupedHits([])
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!open) {
      clearSearch()
    }
  }, [open, clearSearch])

  // Initialize search engine when component mounts
  useEffect(() => {
    searchEngine.initialize().catch(console.error)
  }, [])

  return (
    <>
      {/* A button, not a div+onClick. This control opens a dialog, so it needs
          to be reachable and activatable by keyboard — a div gives no focus, no
          Enter/Space, and no role. The previous markup also nested a readOnly
          <Input> here, which put a focusable field in the tab order that did
          nothing when focused; a span carries the same look with none of that. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-visible:ring-ring relative flex h-9 w-full cursor-pointer items-center rounded-xl bg-muted pr-12 pl-10 text-left focus-visible:ring-2 focus-visible:outline-none"
      >
        <SearchIcon
          aria-hidden="true"
          className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
        />
        <span className="text-muted-foreground text-base md:text-sm">
          {t("placeholder")}
        </span>
        <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg border border-border px-2 py-0.5 text-xs select-none">
          Ctrl K
        </kbd>
      </button>
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        query={query}
        hits={groupedHits}
        loading={loading}
        onSearch={handleSearchChange}
        onClearSearch={clearSearch}
      />
    </>
  )
}
