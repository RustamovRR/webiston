import { getTranslations } from "next-intl/server"

import { DEFAULT_COLOR, REFERENCE_FORMATS } from "../constants"

/**
 * The page's indexable content, as one table instead of two cards of bullets.
 *
 * What this replaces told the HEX/RGB/HSL story a THIRD time — the format rows
 * in the summary already carry a one-line description each, and the FAQ below
 * answers the same questions again. Worse, it covered only three of the seven
 * formats the tool supports, so the two spaces a visitor is most likely to
 * arrive confused about (OKLCH, Lab) had no prose at all.
 *
 * A Server Component, rendered from `page.tsx` as a sibling of the client
 * island: it is static text and shipped as client JavaScript before only
 * because its importer was `'use client'`.
 */
export async function FormatReference({ locale }: { locale: string }) {
  // Explicit locale — the component renders outside the request-scoped
  // provider that wraps the client island.
  const t = await getTranslations({
    locale,
    namespace: "ColorConverterPage.reference"
  })

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 pt-4 sm:px-6 lg:px-8">
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
        {t("intro")}
      </p>

      {/* The table scrolls in its own box; the page never scrolls sideways. */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("columns.format")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("columns.syntax")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("columns.example")}
              </th>
              <th className="min-w-[18rem] px-5 py-3 font-medium text-muted-foreground">
                {t("columns.purpose")}
              </th>
            </tr>
          </thead>
          <tbody>
            {REFERENCE_FORMATS.map((format) => (
              <tr
                key={format}
                className="border-border border-b last:border-b-0"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-5 py-3 font-semibold text-foreground"
                >
                  {t(`rows.${format}.name`)}
                </th>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-muted-foreground text-xs">
                  {t(`rows.${format}.syntax`)}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span className="flex items-center gap-2">
                    {/* Colour DATA: the swatch must be the literal truth about
                        the string beside it, so it is painted from that value. */}
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 rounded border border-border bg-clip-padding"
                      style={{ backgroundColor: DEFAULT_COLOR }}
                    />
                    <code className="font-mono text-foreground text-xs">
                      {t(`rows.${format}.example`)}
                    </code>
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground leading-relaxed">
                  {t(`rows.${format}.purpose`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
        {t("worked")}
      </p>
    </section>
  )
}
