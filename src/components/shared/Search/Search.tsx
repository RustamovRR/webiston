'use client'

import { Input } from '@/components/ui/input'
import { ISearchHit } from '@/types/common'
import { Pagefind } from '@/types/pagefind'
import { SearchIcon } from 'lucide-react'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import SearchDialog from './SearchDialog'
import { MOCK_SEARCH_DATA } from '@/lib/mock-search-data'

// Helper function to slugify text for URL anchors
const slugify = (text: string): string => {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/<mark>/g, '') // Remove <mark> tags from slug
    .replace(/<\/mark>/g, '')
    .replace(/['’]/g, '') // Remove apostrophes
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
}

// Helper function to process real Pagefind results
const processHits = (results: any[]): ISearchHit[][] => {
  if (!results.length) {
    return []
  }
  const grouped: Record<string, ISearchHit[]> = {}

  for (const result of results) {
    const pageTitle = result.meta.title || 'Nomsiz Sahifa'
    if (!grouped[pageTitle]) {
      grouped[pageTitle] = []
    }

    // This handles sub-results which are usually headings in a page
    if (result.sub_results && result.sub_results.length > 0) {
      for (const subResult of result.sub_results) {
        const pathWithoutHtml = result.url.replace(/\.html$/, '') // Use main result URL for base path
        const hash = subResult.anchor ? `#${subResult.anchor}` : `#${slugify(subResult.title)}`

        grouped[pageTitle].push({
          objectID: `${pathWithoutHtml}${hash}`,
          content: subResult.excerpt,
          hierarchy: { lvl0: pageTitle, lvl1: subResult.title },
          contentType: 'tutorial',
          path: `${pathWithoutHtml}${hash}`,
          fullPath: new URL(`${pathWithoutHtml}${hash}`, window.location.origin).toString(),
        })
      }
    } else {
      // This handles the main page result if there are no sub-results
      const pathWithoutHtml = result.url.replace(/\.html$/, '')
      grouped[pageTitle].push({
        objectID: pathWithoutHtml,
        content: result.excerpt,
        hierarchy: {
          lvl0: pageTitle,
          lvl1: undefined, // No sub-heading
        },
        contentType: 'tutorial',
        path: pathWithoutHtml,
        fullPath: new URL(pathWithoutHtml, window.location.origin).toString(),
      })
    }
  }
  return Object.values(grouped)
}

export default function Search() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pagefind, setPagefind] = useState<Pagefind | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [groupedHits, setGroupedHits] = useState<ISearchHit[][]>([])
  const [filter, setFilter] = useState('') // This state is kept for potential future use

  useEffect(() => {
    // Load Pagefind only in production
    if (process.env.NODE_ENV === 'production') {
      const initPagefind = async () => {
        try {
          // @ts-ignore: Pagefind is loaded dynamically from a static path
          const pf = await import(/* webpackIgnore: true */ '/_pagefind/pagefind.js')
          await pf.options({ bundlePath: '/_pagefind/' })
          pf.init()
          setPagefind(pf)
        } catch (error) {
          console.error('Pagefind yuklanmadi:', error)
        }
      }
      initPagefind()
    }
  }, [])

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value)

      if (!value) {
        setLoading(false)
        setGroupedHits([])
        clearTimeout(debounceTimer.current)
        return
      }

      setLoading(true)

      // DEVELOPMENT: Use mock data with debounce
      if (process.env.NODE_ENV === 'development') {
        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => {
          const lowercasedValue = value.toLowerCase()
          const filteredData = MOCK_SEARCH_DATA.map((group) =>
            group.filter(
              (hit) =>
                hit.content.toLowerCase().includes(lowercasedValue) ||
                hit.hierarchy.lvl1?.toLowerCase().includes(lowercasedValue),
            ),
          ).filter((group) => group.length > 0)
          setGroupedHits(filteredData)
          setLoading(false)
        }, 300) // Debounce delay
        return
      }

      // PRODUCTION: Use real Pagefind (already debounced)
      if (!pagefind) {
        setLoading(false)
        return
      }
      const searchResult = await pagefind.debouncedSearch(value)
      if (searchResult === null) {
        return
      }
      if (searchResult.results.length > 0) {
        const resultData = await Promise.all(searchResult.results.map((r) => r.data()))
        const processed = processHits(resultData)
        setGroupedHits(processed)
      } else {
        setGroupedHits([])
      }
      setLoading(false)
    },
    [pagefind],
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setGroupedHits([])
    clearTimeout(debounceTimer.current)
  }, [])

  const handleFilterChange = (type: string) => {
    setFilter(type ? `contentType:${type}` : '')
  }

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
      setFilter('')
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
        onSearch={handleSearch}
        onClearSearch={clearSearch}
      />
    </>
  )
}
