'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ISearchHit } from '@/types'
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

  const getHashForHit = (hit: ISearchHit) => {
    if (hit.hierarchy.lvl3) {
      return `#${hit.hierarchy.lvl3.toLowerCase().replace(/\s+/g, '-')}`
    } else if (hit.hierarchy.lvl2) {
      return `#${hit.hierarchy.lvl2.toLowerCase().replace(/\s+/g, '-')}`
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
          {hits[0].contentType === 'article' ? 'maqola' : 'darslik'}
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
              <div className="text-muted-foreground mb-1 text-sm font-medium group-hover:text-sky-400">
                {hit.hierarchy.lvl2}
              </div>
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
  onSearch?: () => void
  isCompact?: boolean
  className?: string
}

export function CustomSearchBox({ value, onChange, onSearch, isCompact = false, className }: CustomSearchBoxProps) {
  const router = useRouter()

  return (
    <div className={`relative ${!isCompact ? 'mb-8' : ''} ${className || ''}`}>
      <Image
        src="/search-icon.svg"
        width={24}
        height={24}
        alt="Search"
        className="text-muted-foreground absolute top-1/2 left-2 h-6 w-6 -translate-y-1/2"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isCompact ? 'Nima qidiramiz...' : 'Qidirish'}
        className={`${
          isCompact
            ? 'border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border bg-transparent px-3 py-2 pl-9 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            : 'h-12 w-full rounded-md bg-[#F2F2F7] pr-24 pl-9 font-medium dark:bg-[#151515]'
        }`}
      />
      {!isCompact && (
        <Button
          className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          onClick={onSearch}
        >
          <Image src="/search-white-icon.svg" width={19} height={19} alt="Search" />
          <span>Qidiruv</span>
        </Button>
      )}
    </div>
  )
}

export function SearchStats({ totalHits }: { totalHits: number }) {
  if (!totalHits) {
    return null
  }

  return <span className="text-sm font-medium">{totalHits} natija topildi</span>
}
