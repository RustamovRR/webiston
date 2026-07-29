"use client"

import { SearchIcon } from "lucide-react" // Keeping SearchIcon for NoResults
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import type { ISearchHit } from "@/types"

interface GroupedHitProps {
  hits: ISearchHit[]
  onHitClick: (path: string) => void
}

export function GroupedHit({ hits, onHitClick }: GroupedHitProps) {
  const t = useTranslations("Search")
  const title = hits[0]?.hierarchy.lvl0

  return (
    <div className="rounded-lg py-4">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-lg font-medium">{title}</h4>
        <Badge variant="secondary" className="text-xs">
          {hits[0]?.contentType === "article"
            ? t("contentType.article")
            : t("contentType.topic")}
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
              <div className="mb-1 text-sm font-medium text-foreground group-hover:text-primary">
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
  const t = useTranslations("Search")
  if (!query || query.trim().length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground h-12 w-12">
        {/* Decorative only: the <h2> below states "no results" in words, so a
            <title> here would make screen readers announce it twice. */}
        <svg
          aria-hidden="true"
          focusable="false"
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
      <h2 className="mt-4 text-lg font-semibold">{t("noResultsTitle")}</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("noResultsHint", { query })}
      </p>
    </div>
  )
}

interface CustomSearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function CustomSearchBox({ value, onChange }: CustomSearchBoxProps) {
  const t = useTranslations("Search")
  return (
    <div className="relative">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("dialogPlaceholder")}
        className="h-12 w-full rounded-md bg-muted px-10 font-medium placeholder:text-muted-foreground"
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
