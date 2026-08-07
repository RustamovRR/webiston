import Image from "next/image"
import Link from "next/link"
import type { CSSProperties, FC, ReactNode } from "react"
import { Link as I18nLink } from "@/i18n/navigation"

/**
 * The homepage's below-the-hero composition: two labelled groups (books,
 * tools), each section a header + a fixed 6/8-cell grid.
 *
 * Replaces four near-identical `SectionTitle` + 41 × `SimpleCard` sections.
 * The measured problems with that layout: every card identical, so a
 * 5-chapter book weighed the same as an 11-chapter one; chapters and tools
 * shared one card shape, so the page read as one undifferentiated list; and
 * 41 cards before the footer buried the tools section three screens down.
 * Now every book shows its FIRST FIVE chapters plus an explicit "all chapters"
 * cell — nothing is unreachable, the book landing page carries the rest.
 *
 * All Server Components — the only interactivity is `:hover`/`.reveal`, both
 * CSS. Dumb by contract: every string arrives translated via props.
 */

/* ── Section divider ─────────────────────────────────────────────────────── */

/**
 * Mono label between hairlines — the page's two group headings. The accent
 * pixel is the logo's cursor square recurring, and the count says how much
 * lives under the label before any scrolling ("Kitoblar · 03").
 */
export const SectionDivider: FC<{ label: string; count: string }> = ({
  label,
  count
}) => (
  <div className="mx-auto mt-24 flex w-full max-w-[1536px] items-center gap-4">
    <span className="h-px flex-1 bg-border" />
    <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
      <span className="size-[5px] rounded-[1.5px] bg-primary" />
      <span className="text-foreground">{label}</span>
      <span className="text-muted-foreground">· {count}</span>
    </span>
    <span className="h-px flex-1 bg-border" />
  </div>
)

/* ── Cards ───────────────────────────────────────────────────────────────── */

// `from-card to-card/60` — a whisper of depth from the reference's card
// treatment, in tokens: the tail blends toward the page in BOTH schemes.
//
// PLAIN `transition`, not a hand-written property list. Tailwind v4 compiles
// `-translate-y-*` to the modern `translate` PROPERTY, not `transform` — so a
// list that names only `transform` leaves the hover lift untransitioned: the
// card teleports. That was the owner's "instant jump", reported twice. The
// stock `transition` utility covers translate/scale/rotate, colors, shadow
// AND the gradient custom properties, which is also what lets the hover swap
// the depth gradient smoothly below.
const cardBase =
  "group/card relative flex h-full flex-col rounded-lg border border-border-strong " +
  "bg-gradient-to-b from-card to-card/60 p-4 " +
  "transition duration-300 ease-out " +
  "hover:-translate-y-1 hover:border-input hover:from-accent hover:to-accent/70 hover:shadow-lg " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

interface ChapterCardProps {
  index: number
  title: string
  description: string
  href: string
  revealIndex: number
}

/** One chapter: mono index, title, two-line description. */
const ChapterCard: FC<ChapterCardProps> = ({
  index,
  title,
  description,
  href,
  revealIndex
}) => (
  <Link
    href={href}
    className={`reveal ${cardBase}`}
    style={{ "--i": revealIndex } as CSSProperties}
  >
    {/* A bare mono index, nothing else. A hairline flourish was tried here
        and the owner rejected it on sight — card interiors stay plain; the
        card's structure comes from type hierarchy, not from added lines. */}
    <span className="font-mono text-[11px] text-primary">
      {String(index + 1).padStart(2, "0")}
    </span>
    <span className="mt-2 font-semibold text-base text-foreground leading-snug">
      {title}
    </span>
    <span className="mt-1.5 line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
      {description}
    </span>
  </Link>
)

interface MoreCardProps {
  label: string
  meta: string
  href: string
  /**
   * Books are uz-only routes outside the locale tree (plain `next/link`);
   * tools are localized and need the i18n-aware Link, or the `/en` homepage
   * would link back into the default locale.
   */
  isNextLink?: boolean
}

/**
 * The "everything else" cell. Dashed border on purpose: it is a door, not a
 * content card, and the two must not compete.
 */
const MoreCard: FC<MoreCardProps> = ({ label, meta, href, isNextLink }) => {
  const LinkComponent = isNextLink ? Link : I18nLink
  return (
    <LinkComponent
      href={href}
      className="group/more reveal flex h-full flex-col justify-center rounded-lg border border-border-strong border-dashed p-5 transition-colors duration-200 hover:border-input hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="flex items-center gap-2 font-semibold text-base text-foreground">
        {label}
        <span className="transition-transform duration-300 ease-out group-hover/more:translate-x-1">
          →
        </span>
      </span>
      <span className="mt-1.5 font-mono text-[11px] text-muted-foreground">
        {meta}
      </span>
    </LinkComponent>
  )
}

/* ── Book section ────────────────────────────────────────────────────────── */

export interface BookSectionChapter {
  title: string
  description: string
  href: string
}

interface BookSectionProps {
  id: string
  title: string
  description: string
  coverSrc: string
  bookHref: string
  /** Already sliced to 5 by the caller — the grid is sized for 5 + MoreCard. */
  chapters: BookSectionChapter[]
  moreLabel: string
  /** Mono meta under the title, e.g. "11 bo'lim · fluent-react". */
  meta: string
}

export const BookSection: FC<BookSectionProps> = ({
  id,
  title,
  description,
  coverSrc,
  bookHref,
  chapters,
  moreLabel,
  meta
}) => (
  <section className="mx-auto mt-14 w-full max-w-[1536px]">
    {/* Header: the real cover at a readable size. It is the same asset the old
        layout squeezed into 48px, so this costs zero new bytes — and it is
        below the fold, so `loading="lazy"` (Image's default) applies. */}
    <div className="reveal flex items-start gap-5">
      <Link href={bookHref} className="shrink-0">
        <Image
          src={coverSrc}
          alt={title}
          width={64}
          height={84}
          className="h-[84px] w-16 rounded-md border border-border-strong object-cover shadow-md transition-transform duration-300 ease-out hover:scale-105"
        />
      </Link>
      <div className="min-w-0">
        <h3 className="font-bold text-2xl text-foreground tracking-tight">
          <Link
            href={bookHref}
            className="transition-colors duration-300 hover:text-primary"
          >
            {title}
          </Link>
        </h3>
        <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
          {meta}
        </div>
        <p className="mt-2.5 line-clamp-2 max-w-2xl text-pretty text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>

    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {chapters.map((chapter, i) => (
        <ChapterCard
          key={chapter.href}
          index={i}
          title={chapter.title}
          description={chapter.description}
          href={chapter.href}
          revealIndex={i}
        />
      ))}
      <MoreCard isNextLink label={moreLabel} meta={id} href={bookHref} />
    </div>
  </section>
)

/* ── Tools section ───────────────────────────────────────────────────────── */

export interface ToolCardData {
  title: string
  description: string
  href: string
  category: string
  icon: ReactNode
}

interface ToolsSectionProps {
  /** Already sliced to 7 — the grid is sized for 7 + MoreCard. */
  tools: ToolCardData[]
  moreLabel: string
  moreMeta: string
  toolsHref: string
}

export const ToolsSection: FC<ToolsSectionProps> = ({
  tools,
  moreLabel,
  moreMeta,
  toolsHref
}) => (
  <section className="mx-auto mt-14 w-full max-w-[1536px]">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tools.map((tool, i) => (
        <I18nLink
          key={tool.href}
          href={tool.href}
          className={`reveal ${cardBase}`}
          style={{ "--i": i } as CSSProperties}
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary">
            {tool.icon}
          </span>
          <span className="mt-3 font-semibold text-base text-foreground leading-snug">
            {tool.title}
          </span>
          <span className="mt-1.5 line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
            {tool.description}
          </span>
          <span className="mt-3 font-mono text-[11px] text-muted-foreground">
            {tool.category}
          </span>
        </I18nLink>
      ))}
      <MoreCard label={moreLabel} meta={moreMeta} href={toolsHref} />
    </div>
  </section>
)
