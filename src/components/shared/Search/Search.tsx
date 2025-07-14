'use client'

import { Input } from '@/components/ui/input'
import { ISearchHit } from '@/types/common'
import { Pagefind } from '@/types/pagefind'
import { SearchIcon } from 'lucide-react'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import SearchDialog from './SearchDialog'

const processHits = (results: any[]): ISearchHit[][] => {
  if (!results || results.length === 0) {
    return []
  }
  const grouped: Record<string, ISearchHit[]> = {}

  for (const result of results) {
    if (!result || !result.meta) continue

    const pageTitle = result.meta.title || 'Nomsiz Sahifa'
    if (!grouped[pageTitle]) {
      grouped[pageTitle] = []
    }

    if (result.sub_results && result.sub_results.length > 0) {
      for (const subResult of result.sub_results) {
        // The most reliable way is to use the URL from the sub_result itself
        // and just clean it up.
        const finalPath = subResult.url.replace(/\.html/, '')

        grouped[pageTitle].push({
          objectID: finalPath, // Use the final, unique path as the ID
          content: subResult.excerpt,
          hierarchy: { lvl0: pageTitle, lvl1: subResult.title },
          contentType: 'tutorial',
          path: finalPath,
          fullPath: new URL(finalPath, window.location.origin).toString(),
        })
      }
    } else {
      // Handle cases where there's a main result but no sub-results
      const finalPath = result.url.replace(/\.html$/, '')
      grouped[pageTitle].push({
        objectID: finalPath,
        content: result.excerpt,
        hierarchy: { lvl0: pageTitle, lvl1: undefined },
        contentType: 'tutorial',
        path: finalPath,
        fullPath: new URL(finalPath, window.location.origin).toString(),
      })
    }
  }

  const finalGrouped = Object.values(grouped).filter((group) => group.length > 0)
  return finalGrouped
}

export default function Search() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pagefind, setPagefind] = useState<Pagefind | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [groupedHits, setGroupedHits] = useState<ISearchHit[][]>([])

  useEffect(() => {
    const initPagefind = async () => {
      try {
        // @ts-ignore
        const pf = await import(/* webpackIgnore: true */ '/_pagefind/pagefind.js')
        await pf.options({ bundlePath: '/_pagefind/' })
        setPagefind(pf)
      } catch (error) {
        console.error('Failed to load Pagefind:', error)
      }
    }
    initPagefind()
  }, [])

  const handleSearchChange = (value: string) => {
    setQuery(value)

    clearTimeout(debounceTimer.current)

    if (!value) {
      setLoading(false)
      setGroupedHits([])
      return
    }

    setLoading(true)
    debounceTimer.current = setTimeout(async () => {
      if (!pagefind) {
        setLoading(false)
        return
      }
      const searchResult = await pagefind.search(value)
      if (searchResult && searchResult.results.length > 0) {
        const resultData = await Promise.all(searchResult.results.map((r) => r.data()))
        const processed = processHits(resultData)
        setGroupedHits(processed)
      } else {
        setGroupedHits([])
      }
      setLoading(false)
    }, 300) // 300ms debounce delay
  }

  const clearSearch = useCallback(() => {
    setQuery('')
    setGroupedHits([])
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open) {
      clearSearch()
    }
  }, [open, clearSearch])

  return (
    <>
      <div className="relative cursor-pointer rounded-xl bg-[#F2F2F7] dark:bg-[#151515]" onClick={() => setOpen(true)}>
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
