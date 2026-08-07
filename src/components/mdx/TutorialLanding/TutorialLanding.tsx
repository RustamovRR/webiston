import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"
import ButtonLink from "@/components/shared/ButtonLink/ButtonLink"
import { formatTutorialName } from "@/lib"
import type { TutorialNavigation } from "@/lib/mdx"

/**
 * A book's landing page (`/books/<id>`) — the cover, what the book is, and its
 * table of contents.
 *
 * What this replaced was a placeholder: a bordered "Boshlash" box whose body
 * read "pick a topic from the sidebar", followed by a `list-disc` bullet list
 * of the SAME seven links the sidebar was already showing two columns to the
 * left. The page carried no information the surrounding chrome did not, and it
 * was the only surface on the site still speaking 2015 documentation — no
 * cover (the book HAS one, `/books` renders it), no counts, no card language,
 * no mono/accent identity, and `hover:text-black dark:hover:text-white` for the
 * link colour, which is two hard-rule violations in one utility string.
 *
 * `not-prose` is load-bearing: this renders inside the `article.prose` wrapper
 * that `TutorialLayoutContent` puts around every book page. Prose styling is
 * right for MDX chapters and wrong for a designed layout — it is what forced
 * the old `p-8 pt-0` on the card, fighting an h2 margin it did not control.
 *
 * A Server Component, and it stays one: the only motion is CSS (`.rise`,
 * `.grid-rise` from `styles/hero.css`) and the only interaction is `:hover`.
 */

interface TutorialLandingProps {
  tutorialId: string
  tutorialData: {
    title?: string
    description?: string
    copyright?: string
    /** `getTutorialInfo` has always returned this; nothing rendered it. */
    image?: string
  }
  navigationItems: TutorialNavigation[]
}

/** Mono label between hairlines — the homepage's and `/books`' section idiom.
 *  An `h2` with a real `id` on purpose: `TableOfContents` scrapes
 *  `article h2, h3, h4` and links to `element.id`, so the two headings this
 *  page used to emit produced `href="#"` — a right rail of dead links. */
function SectionHeading({
  id,
  label,
  count
}: {
  id: string
  label: string
  count?: string
}) {
  return (
    <div className="mt-14 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <h2
        id={id}
        className="flex scroll-mt-28 items-center gap-2.5 font-mono font-normal text-[11px] text-foreground uppercase tracking-[0.2em]"
      >
        <span className="size-[5px] rounded-[1.5px] bg-primary" />
        {label}
      </h2>
      {/* The count is a SIBLING of the heading, not a child. `TableOfContents`
          reads `element.textContent`, and a flex `gap` is not a character — an
          inner `<span>· 07</span>` rendered as "Mundarija· 07" in the right
          rail while looking correctly spaced on the page. */}
      {count && (
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
          · {count}
        </span>
      )}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export default function TutorialLanding({
  tutorialId,
  tutorialData,
  navigationItems
}: TutorialLandingProps) {
  const formattedTitle = formatTutorialName(tutorialId)
  const title = tutorialData?.title || formattedTitle

  // Every count on this page is derived from `_meta.json`, never typed in — the
  // three books are 7/9/12 sections and 24/76/97 topics today, and adding a
  // chapter must not require editing this file. The tree is two levels deep in
  // all three (verified), so direct children are the whole story.
  const sectionCount = navigationItems.length
  const topicCount = navigationItems.reduce(
    (total, item) => total + (item.list?.length ?? 0),
    0
  )

  // The book's own first entry, not a guess. `hasIndex` does not matter here: a
  // leaf ("So'zboshi") and a chapter index page are both real routes.
  const firstPath = navigationItems[0]?.path

  return (
    // Every responsive decision on this page is a CONTAINER query, because the
    // viewport is not what constrains it: this column sits between a 288px
    // sidebar and a 256px table of contents, so its measured width is 352px at
    // `lg`, 608px at `xl` and 864px at the 1536px cap. A viewport `sm:` would
    // put the cover beside the title at `lg` — where only 352px is available —
    // and it cannot see the sidebar's collapse button at all, whereas a
    // container query re-lays out the moment the reader hides the sidebar.
    //
    // `pb-16`: the layout's article gives this subtree a `pt-6` and no bottom
    // padding at all, so the last element used to touch the footer.
    <div className="@container not-prose w-full pb-16">
      {/* ── Book header ─────────────────────────────────────────────────── */}
      <div
        className="rise flex flex-col gap-6 @md:flex-row @md:items-start @md:gap-7"
        style={{ "--i": 0 } as CSSProperties}
      >
        {tutorialData?.image && (
          // NOT sticky, deliberately. This column already sits between two
          // sticky rails, the page is barely two screens tall, and a cover is
          // identity rather than navigation — pinning a third element would make
          // the layout feel nailed down without helping the reader do anything.
          <div className="relative shrink-0 self-start">
            {/* The homepage hero's brand light, scoped to one object. The only
                decoration on this page, and token-derived, so it follows
                `--primary` through both schemes with no `dark:` variant. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-primary/15 blur-2xl"
            />
            {/* The real 400×525 asset at its real ratio (144 × 189). `/books`
                renders the same file at 72px, so this costs no new bytes. */}
            <Image
              src={tutorialData.image}
              alt={`${title} kitobi muqovasi`}
              width={144}
              height={189}
              priority
              sizes="144px"
              className="relative h-[189px] w-[144px] rounded-lg border border-border-strong object-cover shadow-xl"
            />
          </div>
        )}

        <div className="min-w-0">
          {/* A chip, not a bare line — the same eyebrow-badge treatment the
              homepage hero and `/books`' tag row use, so the page's first
              element speaks the system instead of whispering it. Not
              `uppercase` like the other kickers: this slot holds a URL path,
              and `/BOOKS/AI-ENGINEERING` is not a path that exists.
              `items-start` + the pixel's own offset because the longest id
              ("javascript-definitive-guide") wraps at phone width, where a
              vertically centred pixel would float between the two lines. */}
          <div className="inline-flex max-w-full items-start gap-2 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.1em]">
            <span className="mt-[5px] size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
            <span className="text-muted-foreground">/books/{tutorialId}</span>
          </div>

          <h1 className="mt-5 text-balance font-bold text-3xl text-foreground leading-[1.12] tracking-[-0.02em] @lg:text-4xl">
            {title}
          </h1>

          {tutorialData?.description && (
            // `mt-5`, not `mt-4`: at 1.12 leading a 16px gap read as the
            // description being glued to the title's last line.
            <p className="mt-5 max-w-2xl text-pretty text-base text-muted-foreground leading-relaxed">
              {tutorialData.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="text-foreground">{sectionCount} bo'lim</span>
            <span className="text-border-strong">·</span>
            <span>{topicCount} mavzu</span>
            <span className="text-border-strong">·</span>
            <span>O'zbek tilida</span>
            {/* Last, not mid-run: a chip sitting between two `·` separators
                broke the line's rhythm and read as one more separator. */}
            <span className="ml-1 rounded-full bg-primary/12 px-2.5 py-0.5 text-[10px] text-primary">
              Bepul
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {firstPath && (
              <ButtonLink
                isNextLink
                href={`/books/${tutorialId}/${firstPath}`}
                variant="primary"
                className="h-11 px-5 text-base"
              >
                O'qishni boshlash →
              </ButtonLink>
            )}
            <ButtonLink
              isNextLink
              href="/books"
              variant="outline"
              className="h-11 px-5 text-base"
            >
              Barcha kitoblar
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* ── Table of contents ───────────────────────────────────────────── */}
      <SectionHeading
        id="mundarija"
        label="Mundarija"
        count={String(sectionCount).padStart(2, "0")}
      />

      {/* Two columns is the ceiling here: a first pass with `xl:grid-cols-3`
          measured 192px per card, which cannot hold a title like
          "1. Fundamental modellar asosida SI ilovalarini yaratish", and even at
          the 1536px cap a third column would only get ~290px. */}
      <div className="mt-7 grid grid-cols-1 gap-4 @xl:grid-cols-2">
        {navigationItems.map((item, index) => (
          // An absolute href. The old one was relative (`${tutorialId}/${path}`)
          // and only resolved because `/books/<id>` carries no trailing slash —
          // one `/` away from `/books/<id>/<id>/<path>` and a 404.
          <Link
            key={item.path}
            href={`/books/${tutorialId}/${item.path}`}
            style={{ "--i": index } as CSSProperties}
            // `.grid-rise` (35ms stagger), not `.rise` (110ms): twelve cards at
            // the hero's cadence would still be arriving 1.3s in.
            //
            // Plain `transition`. Tailwind v4 compiles `-translate-y-*` to the
            // `translate` PROPERTY, so a hand-written `transition-[transform,…]`
            // list leaves the lift untransitioned and the card teleports.
            className="group/ch grid-rise flex flex-col rounded-lg border border-border-strong bg-gradient-to-b from-card to-card/60 p-4 transition duration-300 ease-out hover:-translate-y-1 hover:border-input hover:from-accent hover:to-accent/70 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {/* EXACTLY the homepage `ChapterCard` order: mono accent line, then
                title, then two muted lines. The previous version put the meta at
                the BOTTOM behind a `border-t`, which drew a hairline directly
                under a one-word title ("E'tiroflar" ─────) and made every card
                look like a table row. The homepage has no such rule; neither
                does this now. */}
            <span className="font-mono text-[11px] text-primary">
              {item.list?.length
                ? `${item.list.length} mavzu`
                : "Alohida sahifa"}
            </span>
            <span className="mt-2 font-semibold text-base text-foreground leading-snug">
              {item.title}
            </span>
            {/* The description slot the homepage card has and this one lacked:
                the chapter's own first topics, from `_meta.json`. Plain text,
                not links — nesting an `<a>` inside a card that IS an `<a>` is
                invalid HTML, and this keeps the whole card one target. */}
            {item.list && item.list.length > 0 && (
              <span className="mt-1.5 line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
                {item.list
                  .slice(0, 3)
                  .map((child) => child.title)
                  .join(" · ")}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ── Copyright ───────────────────────────────────────────────────── */}
      {tutorialData?.copyright && (
        <>
          <SectionHeading id="mualliflik-huquqi" label="Mualliflik huquqi" />
          <p className="mt-6 max-w-3xl text-pretty text-muted-foreground text-sm leading-relaxed">
            {tutorialData.copyright}
          </p>
        </>
      )}
    </div>
  )
}
