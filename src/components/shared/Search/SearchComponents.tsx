"use client"

import { Badge } from "@/components/ui/badge"
import { ISearchHit } from "@/types"
import { SearchIcon } from "lucide-react" // Keeping SearchIcon for NoResults
import Link from "next/link"

interface GroupedHitProps {
  hits: ISearchHit[]
  onHitClick: (path: string) => void
}

export function GroupedHit({ hits, onHitClick }: GroupedHitProps) {
  const title = hits[0]?.hierarchy.lvl0

  return (
    <div className="rounded-lg py-4">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-lg font-medium">{title}</h4>
        <Badge variant="secondary" className="text-xs">
          {hits[0]?.contentType === "article" ? "maqola" : "mavzu"}
        </Badge>
      </div>

      <div className="ml-4 space-y-2">
        {hits.map((hit) => (
          <Link
            key={hit.objectID}
            href={hit.path}
            onClick={() => onHitClick(hit.path)}
            className="group hover:bg-accent -ml-2 block cursor-pointer rounded p-2 transition-colors"
          >
            {hit.hierarchy.lvl1 && (
              <div className="mb-1 text-sm font-medium text-gray-800 group-hover:text-sky-500 dark:text-gray-200">
                {hit.hierarchy.lvl1}
              </div>
            )}
            <p
              className="text-muted-foreground text-sm"
              dangerouslySetInnerHTML={{ __html: hit.content }}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

interface NoResultsProps {
  query: string
}

export function NoResults({ query }: NoResultsProps) {
  if (!query || query.trim().length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground h-12 w-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold">Natijalar topilmadi</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Ushbu &quot;{query}&quot; bo'yicha natija topilmadi. Boshqa so'z bilan
        urinib ko'ring.
      </p>
    </div>
  )
}

interface CustomSearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function CustomSearchBox({ value, onChange }: CustomSearchBoxProps) {
  return (
    <div className="relative">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Mavzular va kodlar orasidan qidiring..."
        className="h-12 w-full rounded-md bg-[#F2F2F7] px-10 font-medium placeholder:text-gray-500 dark:bg-[#151515] dark:placeholder:text-gray-400"
        autoFocus
      />
    </div>
  )
}

export function SearchStats({ totalHits }: { totalHits: number }) {
  if (!totalHits) {
    return null
  }

  return <span className="text-sm font-medium">{totalHits} natija topildi</span>
}
