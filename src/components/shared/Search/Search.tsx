"use client"

import { Input } from "@/components/ui/input"
import { ISearchHit } from "@/types/common"
import { SearchIcon } from "lucide-react"
import { RefObject, useCallback, useEffect, useRef, useState } from "react"
import SearchDialog from "./SearchDialog"
import { searchEngine } from "@/lib/search/flexsearch"

export default function Search() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
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
      <div
        className="relative cursor-pointer rounded-xl bg-[#F2F2F7] dark:bg-[#151515]"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
        <Input
          ref={inputRef as RefObject<HTMLInputElement>}
          placeholder="Qidirish..."
          className="cursor-pointer pr-12 pl-10"
          readOnly
        />
        <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded-[4px] border border-[#F2F2F7] px-2 py-0.5 text-xs select-none dark:border-[#2C2C2E]">
          Ctrl K
        </kbd>
      </div>
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
