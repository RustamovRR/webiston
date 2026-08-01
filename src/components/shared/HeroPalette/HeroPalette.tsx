import type { CSSProperties, FC } from "react"
import { MACOS_DOTS } from "@/constants"

/**
 * A live still of the site's own ⌘K palette, used as the hero's right-hand
 * visual. It loops: types a query, shows its results, deletes, types the
 * next — all in CSS on the 21s clock in `hero.css` (one 7s third per group),
 * so the homepage stays a prerendered Server Component with zero hero JS.
 *
 * Why this and not an illustration or a book cover:
 * - It shows the PRODUCT. On a library with 225 chapters, search *is* the
 *   primary navigation, so a picture of the search surface is a picture of the
 *   thing people came for.
 * - It needs no images. `images.unoptimized: true` is still set, which makes
 *   any real image in the hero the worst possible LCP placement.
 * - It teaches the shortcut. Most visitors never discover ⌘K; showing it in
 *   the hero is the cheapest possible onboarding.
 *
 * The title bar uses `MACOS_DOTS` — the same constant the tool panels already
 * draw their window chrome with, so the mock matches the site's own idiom.
 *
 * Dumb by contract (`code-rules.md § 3`): every string arrives as a prop.
 */

export interface HeroPaletteRow {
  title: string
  meta: string
}

export interface HeroPaletteGroup {
  /**
   * What gets "typed". Keep it EXACTLY 5 characters: the typing track in
   * hero.css is five hand-placed keystroke keyframes with literal 1ch–4ch
   * widths (uneven on purpose — human rhythm), so a different length would
   * finish early or late against them. It must also HONESTLY match the rows —
   * a palette that invents results is a screenshot of a product that does not
   * exist.
   */
  query: string
  /** Group heading above the results, e.g. "Kitoblar" / "Vositalar". */
  label: string
  rows: HeroPaletteRow[]
}

interface HeroPaletteProps {
  /**
   * The loop's segments, in play order. The CSS clock is sized for THREE
   * (21s, delays 0/7/14s on `:nth-child`); adding a fourth means one more
   * delay rule and a longer duration in hero.css, not a component change.
   * Keep every group at the SAME row count — the sets are stacked in one grid
   * cell, so a shorter set would leave a hole under the tallest.
   */
  groups: HeroPaletteGroup[]
  /** Keyboard legend for the footer. */
  hints: string
}

const ResultGroup: FC<{ group: HeroPaletteGroup }> = ({ group }) => (
  <div>
    <div className="px-3 pt-2 pb-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
      {group.label}
    </div>
    {group.rows.map((row, i) => (
      <div
        key={row.title}
        className="hero-prow flex items-center gap-3 rounded-lg px-3 py-2.5"
        style={{ "--i": i } as CSSProperties}
      >
        {/* First letter as the icon — costs no asset, cannot 404, and the
            brand tint keeps the rows from reading as a grey list. */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/12 font-mono text-[11px] text-primary">
          {row.title.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-foreground text-sm">
            {row.title}
          </span>
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            {row.meta}
          </span>
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          ⏎
        </span>
      </div>
    ))}
  </div>
)

export const HeroPalette: FC<HeroPaletteProps> = ({ groups, hints }) => {
  return (
    <div
      // Decorative: it is a picture of the real palette, which lives in the
      // header and is reachable there. Announcing this copy to a screen reader
      // would offer a search box that cannot be typed into.
      aria-hidden="true"
      className="hero-palette overflow-hidden rounded-xl border border-border-strong bg-card shadow-2xl"
    >
      {/* Window chrome — same MACOS_DOTS idiom as the tool panels. */}
      <div className="flex items-center gap-2 border-border border-b px-4 py-3">
        {MACOS_DOTS.map((dot) => (
          <span
            key={dot.color}
            className={`size-2.5 rounded-full ${dot.color}`}
          />
        ))}
        <span className="ml-2 font-mono text-[11px] text-muted-foreground">
          webiston.uz — ⌘K
        </span>
      </div>

      {/* Query row: stacked spans on one CSS clock; exactly one is ever
          non-zero width. `font-mono` is load-bearing — the typing effect
          measures in `ch`, which is one glyph only in a monospace face. */}
      <div className="flex items-center gap-3 border-border border-b px-4 py-3.5">
        <svg
          className="size-4 shrink-0 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="flex items-baseline font-mono text-foreground text-sm">
          {/* Spans are addressed by `:nth-child` in hero.css — no per-child
              class needed, and the markup scales with `groups`. */}
          <span className="hero-type-line">
            {groups.map((g) => (
              <span
                key={g.query}
                style={{ "--chars": g.query.length } as CSSProperties}
              >
                {g.query}
              </span>
            ))}
          </span>
          <span className="hero-caret" />
        </span>
      </div>

      {/* Result sets, crossfading on the same clock — also `:nth-child`. */}
      <div className="hero-results p-2">
        {groups.map((g) => (
          <div key={g.query}>
            <ResultGroup group={g} />
          </div>
        ))}
      </div>

      <div className="border-border border-t px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
        {hints}
      </div>
    </div>
  )
}
