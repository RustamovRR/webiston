import { LATIN_2027_LETTERS } from "@webiston/transliteration"
import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { ArrowUpRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { LAW_FACT_KEYS, LAW_URL, NOTE_KEYS } from "../constants"

/**
 * What changes, and when.
 *
 * A Server Component rendered as a SIBLING of the converter, like the
 * Latin-Cyrillic alphabet table it is modelled on. The rows come from the
 * package's `LATIN_2027_LETTERS` — the table the engine converts with — so
 * the page cannot show a code point the converter does not produce.
 *
 * The new letters are copy buttons rather than text. The question behind
 * "ş harfi qanday yoziladi" is usually "where do I get one", and until there
 * is an official keyboard layout the honest answer is: here, one click.
 * `CopyButton` is the only client code in the section.
 */

const codePoint = (char: string) =>
  `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}`

/** "sh" → "Sh sh", "o'" → "O' o'" — the 1995 pair as people know it. */
const oldPair = (old: string) =>
  `${old.charAt(0).toUpperCase()}${old.slice(1)} ${old}`

export async function LetterTable({ locale }: { locale: string }) {
  // Explicit locale — see the note in LatinCyrillic's AlphabetTable.
  const t = await getTranslations({ locale, namespace: "NewAlphabetPage" })

  return (
    <section className="mt-16">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.15em]">
          <span className="size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
          <span className="text-muted-foreground">{t("letters.kicker")}</span>
        </div>
        <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
          {t("letters.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          {t("letters.description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Fits a phone without scrolling: the Unicode column — developer
              detail the FAQ also answers — is dropped below `sm`. Kept as a
              scroll box anyway, so a larger font cannot push the page wide. */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{t("letters.title")}</caption>
              <thead>
                <tr className="border-border/60 border-b font-mono text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
                  <th scope="col" className="py-2.5 pl-5 font-normal">
                    {t("letters.old")}
                  </th>
                  <th scope="col" className="py-2.5 font-normal">
                    {t("letters.new")}
                  </th>
                  <th scope="col" className="py-2.5 pr-5 font-normal sm:pr-0">
                    {t("letters.cyrillic")}
                  </th>
                  <th
                    scope="col"
                    className="hidden py-2.5 pr-5 font-normal sm:table-cell"
                  >
                    Unicode
                  </th>
                </tr>
              </thead>
              <tbody>
                {LATIN_2027_LETTERS.map((letter) => (
                  <tr
                    key={letter.old}
                    className="border-border/60 border-b transition-colors last:border-0 hover:bg-accent/40"
                  >
                    <td className="whitespace-nowrap py-2 pl-5 font-mono text-[15px] text-muted-foreground">
                      {oldPair(letter.old)}
                    </td>
                    <td className="whitespace-nowrap py-2">
                      {/* Glyph first, icon after (`flex-row-reverse`), so the
                          letter — not the icon — sits under the column
                          header. `-ml-2.5` cancels the sm button's
                          `has-[>svg]:px-2.5` (primitives/button.tsx); change
                          one and the other moves. The icon is muted so eight
                          of them do not outweigh the letters; the copied
                          check keeps its own success colour. */}
                      <span className="-ml-2.5 inline-flex gap-1">
                        {[letter.upper, letter.lower].map((glyph) => (
                          <CopyButton
                            key={glyph}
                            text={glyph}
                            label={glyph}
                            ariaLabel={t("letters.copy", { glyph })}
                            showLabel
                            className="flex-row-reverse font-mono text-[15px] text-foreground [&_.lucide-copy]:text-muted-foreground"
                          />
                        ))}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2 pr-5 font-mono text-[15px] text-muted-foreground sm:pr-0">
                      {`${letter.cyrillic.toUpperCase()} ${letter.cyrillic}`}
                    </td>
                    <td className="hidden whitespace-nowrap py-2 pr-5 font-mono text-muted-foreground text-xs sm:table-cell">
                      {`${codePoint(letter.upper)} · ${codePoint(letter.lower)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 border-border/60 border-t px-5 py-4">
            {NOTE_KEYS.map((key) => (
              <li
                key={key}
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {t(`letters.notes.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Sticky the same way, and for the same reason, as the compound
            table on the Latin-Cyrillic page: the column stretches, the card
            inside it does not. */}
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-20">
            <h3 className="border-border/60 border-b px-5 py-3 font-medium text-foreground text-sm">
              {t("law.title")}
            </h3>
            <dl className="divide-y divide-border/60">
              {LAW_FACT_KEYS.map((key) => (
                <div key={key} className="px-5 py-3">
                  <dt className="text-muted-foreground text-xs">
                    {t(`law.${key}`)}
                  </dt>
                  <dd className="mt-0.5 text-foreground text-sm">
                    {t(`law.${key}Value`)}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={LAW_URL}
              target="_blank"
              rel="noopener noreferrer"
              // An INSET ring: the card clips overflow, so an outline drawn
              // outside the link was cut to a faint top edge (the shared
              // Faq's summaries solve the same clip the same way).
              className="flex items-center gap-1.5 border-border/60 border-t px-5 py-3 text-primary text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              {t("law.source")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
