"use client"

import { SearchIcon } from "lucide-react" // Keeping SearchIcon for NoResults
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { ISearchHit } from "@/types"

interface GroupedHitProps {
  hits: ISearchHit[]
  onHitClick: (path: string) => void
}

export function GroupedHit({ hits, onHitClick }: GroupedHitProps) {
  const t = useTranslations("Search")
  const title = hits[0]?.hierarchy.lvl0

  return (
    <div className="pt-3 pb-1">
      {/* Group heading in the mono/uppercase idiom the homepage dividers and the
          hero palette both use, instead of an 18px title + a Badge. */}
      <div className="flex items-center gap-2 px-2 pb-1.5 font-mono text-[10px] uppercase tracking-wider">
        <span className="text-muted-foreground">{title}</span>
        <span className="text-muted-foreground/60">
          ·{" "}
          {hits[0]?.contentType === "article"
            ? t("contentType.article")
            : t("contentType.topic")}
        </span>
      </div>

      <div className="space-y-0.5">
        {hits.map((hit) => (
          <Link
            key={hit.objectID}
            href={hit.path}
            onClick={() => onHitClick(hit.path)}
            className="group flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-accent"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/12 font-mono text-[10px] text-primary">
              {(hit.hierarchy.lvl1 || title || "?").charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              {hit.hierarchy.lvl1 && (
                <span className="block font-medium text-foreground text-sm transition-colors group-hover:text-primary">
                  {hit.hierarchy.lvl1}
                </span>
              )}
              <span
                className="mt-0.5 block line-clamp-2 text-muted-foreground text-sm"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: highlight markup comes from our own index builder, not user input
                dangerouslySetInnerHTML={{ __html: hit.content }}
              />
            </span>
            <span className="mt-1 shrink-0 font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              ⏎
            </span>
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
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {/* The icon this replaced was lucide's CAMERA path — a camera drawn for
          "no results". It also had no width/height inside an `h-12 w-12` box, so
          an unsized inline SVG was left to its 300×150 default and overflowed.
          This is a magnifier with a slash, sized explicitly, in the same
          brand-tinted chip the palette rows use. */}
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <svg
          aria-hidden="true"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8.5 8.5l5 5" />
          <path d="M13.5 8.5l-5 5" />
        </svg>
      </span>
      <h2 className="mt-4 font-semibold text-base text-foreground">
        {t("noResultsTitle")}
      </h2>
      <p className="mt-1.5 max-w-xs text-muted-foreground text-sm">
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
      <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3.5 size-[18px] text-muted-foreground" />
      {/* `font-mono` so the typed query matches the hero palette's query row —
          the two are pictures of the same surface and should read alike. */}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("dialogPlaceholder")}
        className="h-12 w-full rounded-lg border border-border-strong bg-card/60 pr-4 pl-11 font-mono text-sm transition-colors duration-300 placeholder:font-sans placeholder:text-muted-foreground focus-visible:border-input focus-visible:outline-none"
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
