import Link from "next/link"

/**
 * The "Terminal" mark from the 2026-07 brand exploration ("Webiston.uz UIUX
 * redesign", direction 02 of 5) — chosen over Pishtoq (arch) and Ochiq kitob
 * (open book) because it is the only one that says *developer*: a bold `w`
 * with a cursor pixel, and a wordmark whose i-dot is the same accent square.
 * One repeated idea, ownable at any size.
 *
 * Implemented as pure markup, no image. The previous logo was a raster PNG
 * (209 KB originally, 5.5 KB after resizing) that still cost a priority-loaded
 * request on every page and could never theme. This costs zero requests, is
 * crisp at every DPI, and the accent pixel follows `--primary` through both
 * schemes. `/logo.png` remains the source of truth for share cards + JSON-LD.
 *
 * The i-dot trick uses the dotless `ı` (U+0131) with the accent square drawn
 * above it — the reference's own approach. A first attempt kept a normal `i`
 * and tried to COVER its native dot, which shipped a double dot: the cover
 * cannot track the dot across font sizes and zoom levels. The wrong-letter
 * concern is void here because the wordmark is `aria-hidden` — assistive tech
 * reads the Link's `aria-label`, never the glyphs.
 */
export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Webiston.uz"
      className="group flex items-center gap-2.5"
    >
      {/* Badge: rounded square, brand-tinted gradient, cursor pixel. */}
      <span
        aria-hidden="true"
        className="relative flex size-9 items-center justify-center rounded-[10px] border border-border-strong bg-gradient-to-br from-primary/30 via-card to-card"
      >
        <span className="font-bold text-foreground text-xl leading-none tracking-tight">
          w
        </span>
        <span className="absolute top-1.25 right-1.25 size-1.25 rounded-[1.5px] bg-primary transition-transform duration-300 ease-out group-hover:scale-125" />
      </span>

      {/* Wordmark. Hidden on phones exactly as the old text was. */}
      <span
        aria-hidden="true"
        className="hidden font-bold text-foreground text-lg tracking-[-0.02em] sm:inline-flex"
      >
        web
        <span className="relative">
          <span className="-translate-x-1/2 absolute top-1.5 left-[55%] size-[0.17em] rounded-[0.04em] bg-primary" />
          ı
        </span>
        ston
        <span className="font-semibold text-muted-foreground">.uz</span>
      </span>
    </Link>
  )
}
