import { cn } from "@webiston/ui/utils"
import { getTranslations } from "next-intl/server"

import { ALPHABET_ROWS, type AlphabetRow, COMPOUND_ROWS } from "../constants"

/**
 * The Latin ↔ Cyrillic correspondence table.
 *
 * A Server Component, rendered by `page.tsx` as a SIBLING of the converter
 * rather than a child of it — a child of a `'use client'` tree is a client
 * component whether it needs to be or not, and this one is static markup.
 *
 * The first version drew a border on every cell, which in dark mode turned the
 * whole thing into a grey grid with two glyphs and a lot of empty space in it.
 * This one keeps ONE hairline per row and lets the letters carry the layout:
 * the pair is a mono chip, the Cyrillic side is the accent (it is the answer
 * the reader came for), and the note only appears on the rows that have one.
 */

function LetterPair({ row, note }: { row: AlphabetRow; note?: string }) {
  return (
    <tr
      className={cn(
        "border-border/60 border-b transition-colors last:border-0",
        "hover:bg-accent/40"
      )}
    >
      <td className="whitespace-nowrap py-3 pl-5 font-mono text-[15px] text-muted-foreground">
        {row.latin}
      </td>
      <td
        className="w-8 py-3 text-center text-border-strong text-xs"
        aria-hidden="true"
      >
        →
      </td>
      <td className="whitespace-nowrap py-3 font-mono text-[15px] text-foreground">
        {row.cyrillic}
      </td>
      <td className="py-3 pr-5 pl-6 text-muted-foreground text-xs leading-relaxed">
        {note}
      </td>
    </tr>
  )
}

export async function AlphabetTable({ locale }: { locale: string }) {
  // The locale is passed in, NOT read from the request.
  //
  // `setRequestLocale` writes into a React.cache-scoped value that
  // `getRequestConfig` never sees here: measured on /en/tools/latin-cyrillic,
  // `getLocale()` returns "uz" while `params.locale` is "en", so every
  // `getTranslations("…")` call silently served the Uzbek bundle. Passing the
  // locale explicitly is the same thing `[locale]/layout.tsx` already does for
  // metadata, and it is what makes the English file render at all.
  const t = await getTranslations({
    locale,
    namespace: "LatinCyrillicPage.table"
  })

  const noteFor = (row: AlphabetRow) =>
    row.note ? t(`notes.${row.note}`) : undefined

  return (
    <section className="mt-16">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.15em]">
          <span className="size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
          <span className="text-muted-foreground">{t("kicker")}</span>
        </div>
        <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Wide content scrolls inside its own box; the page never does. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-left">
              <caption className="sr-only">{t("title")}</caption>
              <tbody>
                {ALPHABET_ROWS.map((row) => (
                  <LetterPair key={row.latin} row={row} note={noteFor(row)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky, and this wrapper is why it can be.
            `position: sticky` needs room to travel inside its containing
            block, so the grid COLUMN has to stretch to the full row height
            (this div, which draws nothing) while the card inside it keeps its
            own five-row height. Making the card itself the grid item — with
            `items-start` or `self-start` — collapses the column to the card
            and leaves sticky with zero travel, which is why it looked like it
            simply did not work. `top-20` clears the 4rem sticky header. */}
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-20">
            <h3 className="border-border/60 border-b px-5 py-3 font-medium text-foreground text-sm">
              {t("compoundTitle")}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[16rem] border-collapse text-left">
                <caption className="sr-only">{t("compoundTitle")}</caption>
                <tbody>
                  {COMPOUND_ROWS.map((row) => (
                    <LetterPair key={row.latin} row={row} note={noteFor(row)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
