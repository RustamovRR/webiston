import { getTranslations } from "next-intl/server"

import { ALPHABET_ROWS, type AlphabetRow, COMPOUND_ROWS } from "../constants"

/**
 * The Latin ↔ Cyrillic correspondence table.
 *
 * A Server Component, rendered by `page.tsx` as a SIBLING of the converter
 * rather than a child of it — a child of a `'use client'` tree is a client
 * component whether it needs to be or not, and this one is static markup.
 *
 * It replaces six "info cards" that between them restated the toolbar, listed
 * Ц as part of an alphabet the converter could not produce, and published
 * three statistics with no source.
 */

function Row({ row, noteLabel }: { row: AlphabetRow; noteLabel?: string }) {
  return (
    <tr className="border-border border-b last:border-0">
      <td className="py-2.5 pr-3 font-mono text-foreground text-sm">
        {row.latin}
      </td>
      <td className="py-2.5 pr-3 font-mono text-foreground text-sm">
        {row.cyrillic}
      </td>
      <td className="py-2.5 text-muted-foreground text-xs leading-relaxed">
        {noteLabel}
      </td>
    </tr>
  )
}

export async function AlphabetTable() {
  const t = await getTranslations("LatinCyrillicPage.table")

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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Wide content scrolls inside its own box; the page never does. */}
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[22rem] border-collapse px-5 text-left">
            <caption className="sr-only">{t("title")}</caption>
            <thead>
              <tr className="border-border border-b">
                <th
                  scope="col"
                  className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider"
                >
                  {t("latin")}
                </th>
                <th
                  scope="col"
                  className="py-3 pr-3 font-medium text-muted-foreground text-xs uppercase tracking-wider"
                >
                  {t("cyrillic")}
                </th>
                <th
                  scope="col"
                  className="py-3 pr-5 font-medium text-muted-foreground text-xs uppercase tracking-wider"
                >
                  {t("note")}
                </th>
              </tr>
            </thead>
            <tbody className="[&_td:first-child]:pl-5 [&_td:last-child]:pr-5">
              {ALPHABET_ROWS.map((row) => (
                <Row key={row.latin} row={row} noteLabel={noteFor(row)} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[16rem] border-collapse text-left">
            <caption className="px-5 pt-4 pb-1 text-left font-medium text-foreground text-sm">
              {t("compoundTitle")}
            </caption>
            <tbody className="[&_td:first-child]:pl-5 [&_td:last-child]:pr-5">
              {COMPOUND_ROWS.map((row) => (
                <Row key={row.latin} row={row} noteLabel={noteFor(row)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
