'use client'

import { Badge } from '@/components/ui/badge'
import { ISearchHit } from '@/types'
import { SearchIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface GroupedHitProps {
  hits: ISearchHit[]
  isCompact?: boolean
  onHitClick?: (path: string) => void
}

export function GroupedHit({ hits, isCompact = false, onHitClick }: GroupedHitProps) {
  const router = useRouter()
  const title = hits[0].hierarchy.lvl1 || hits[0].hierarchy.lvl0

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/['’]/g, '') // Remove apostrophes
      .replace(/[^\w\s-]/g, '') // Remove all non-word chars except spaces and hyphens
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
  }

  const getHashForHit = (hit: ISearchHit) => {
    if (hit.hierarchy.lvl3) {
      return `#${slugify(hit.hierarchy.lvl3)}`
    } else if (hit.hierarchy.lvl2) {
      return `#${slugify(hit.hierarchy.lvl2)}`
    }
    return ''
  }

  const handleClick = (hit: ISearchHit) => {
    onHitClick?.(hit.path)
    const hash = getHashForHit(hit)
    router.push(hash ? `${hit.path}${hash}` : hit.path, {
      scroll: true,
    })
  }

  return (
    <div className={`rounded-lg ${isCompact ? 'py-3' : 'py-4'}`}>
      <div className="mb-2 flex items-center gap-2">
        <h4 className={`${isCompact ? 'text-sm' : 'text-lg'} font-medium`}>{title}</h4>
        <Badge variant="secondary" className={isCompact ? 'text-xs' : ''}>
          {hits[0].contentType === 'article' ? 'maqola' : 'mavzu'}
        </Badge>
      </div>

      <div className="ml-4 space-y-2">
        {hits.map((hit) => (
          <div
            key={hit.objectID}
            onClick={() => handleClick(hit)}
            className="hover:bg-accent group -ml-2 cursor-pointer rounded p-2 transition-colors"
          >
            {hit.hierarchy.lvl2 && (
              <div className="mb-1 text-sm font-medium group-hover:text-sky-400">{hit.hierarchy.lvl2}</div>
            )}
            <p className={`text-muted-foreground ${isCompact ? 'line-clamp-2 text-sm' : 'text-sm'}`}>{hit.content}</p>
            {hit.metadata?.language && (
              <div className="text-muted-foreground mt-1 text-xs">Til: {hit.metadata.language}</div>
            )}
          </div>
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
        Ushbu &quot;{query}&quot; bo'yicha natija topilmadi. Boshqa so'z bilan urinib ko'ring.
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
