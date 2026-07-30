import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"

/**
 * Prev/next chapter navigation at the foot of a reading page.
 *
 * Rewritten for two reasons. Colour: this file carried 16 hardcoded values —
 * `text-[#8D8D93]` ×6 plus `text-black`/`dark:text-white` ×8 — so it was styled
 * per-class in both schemes instead of by token, and the grey was a hex that
 * appears nowhere in `tokens.css`.
 *
 * Form: it was two bare text stacks with a chevron. This is the single most
 * important control on a reading page — "where do I go next" — and it looked
 * like a caption. It now uses the same card language as the book landing page's
 * table of contents: strong boundary, depth gradient, mono kicker, hover lift.
 * A Server Component, as it was; the only motion is CSS.
 */

interface PaginationProps {
  currentPath: string
  tutorialId: string
  flattenedNavigation: { title: string; path: string; fullPath: string }[]
}

// Plain `transition`: Tailwind v4 compiles `-translate-y-*` to the `translate`
// PROPERTY, which a hand-written `transition-[transform,…]` list does not cover.
const cardBase =
  "group/nav flex flex-col gap-1.5 rounded-lg border border-border-strong " +
  "bg-gradient-to-b from-card to-card/60 p-4 " +
  "transition duration-300 ease-out " +
  "hover:-translate-y-0.5 hover:border-input hover:from-accent hover:to-accent/70 hover:shadow-lg " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

const kicker =
  "flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.15em]"

export function Pagination({
  currentPath,
  tutorialId,
  flattenedNavigation
}: PaginationProps) {
  const currentIndex = flattenedNavigation.findIndex(
    (item) => item.path === currentPath
  )

  const prevPage =
    currentIndex > 0
      ? {
          title: flattenedNavigation[currentIndex - 1].title,
          href: `/books/${tutorialId}/${flattenedNavigation[currentIndex - 1].path}`
        }
      : undefined

  const nextPage =
    currentIndex < flattenedNavigation.length - 1
      ? {
          title: flattenedNavigation[currentIndex + 1].title,
          href: `/books/${tutorialId}/${flattenedNavigation[currentIndex + 1].path}`
        }
      : undefined

  if (!prevPage && !nextPage) {
    return null
  }

  return (
    // A grid, not `justify-between` with an empty `<div />` placeholder: at the
    // first and last chapter the surviving card now fills its own column
    // instead of being pushed around by a spacer.
    <nav
      aria-label="Bo'limlar orasida o'tish"
      className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {prevPage ? (
        <Link href={prevPage.href} prefetch className={cardBase}>
          <span className={kicker}>
            <ChevronLeftIcon
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 ease-out group-hover/nav:-translate-x-0.5"
            />
            Oldingi
          </span>
          <span className="font-semibold text-base text-foreground leading-snug">
            {prevPage.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {nextPage && (
        <Link
          href={nextPage.href}
          prefetch
          className={`${cardBase} sm:col-start-2 sm:items-end sm:text-right`}
        >
          <span className={kicker}>
            Keyingi
            <ChevronRightIcon
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 ease-out group-hover/nav:translate-x-0.5"
            />
          </span>
          <span className="font-semibold text-base text-foreground leading-snug">
            {nextPage.title}
          </span>
        </Link>
      )}
    </nav>
  )
}
