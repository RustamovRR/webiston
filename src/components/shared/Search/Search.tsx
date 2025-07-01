'use client'

import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { RefObject, useEffect, useRef, useState, useCallback } from 'react'
import SearchDialog from './SearchDialog'

export default function Search() {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search logic for UI purposes
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [groupedHits, setGroupedHits] = useState<any[]>([])
  const [filter, setFilter] = useState('')

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (value) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
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
      <div
        className="relative hidden cursor-pointer rounded-xl bg-[#F2F2F7] md:block dark:bg-[#151515]"
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

      <div className="flex cursor-pointer items-center justify-center md:hidden" onClick={() => setOpen(true)}>
        <SearchIcon className="h-6 w-6" />
      </div>

      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        query={query}
        hits={groupedHits}
        loading={loading}
        filter={filter}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
      />
    </>
  )
}
