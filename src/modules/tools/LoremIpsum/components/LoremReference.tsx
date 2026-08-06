import { getTranslations } from "next-intl/server"

import { LOREM_BANKS } from "../constants"
import { wordsOf } from "../utils/generate"

/**
 * The page's indexable prose, on the server.
 *
 * What this replaces was two client-rendered cards — an "InfoSection" and a
 * "HelpSection", 170 lines of static text shipped as JavaScript, carrying
 * eleven palette classes between them.
 *
 * The word counts in the table are read from the lists themselves, so the
 * documentation cannot describe a bank that has since changed.
 */
export async function LoremReference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "LoremIpsumPage.reference"
  })

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 pt-10 sm:px-6 lg:px-8">
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
        {t("intro")}
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.bank")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.words")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.use")}
              </th>
            </tr>
          </thead>
          <tbody>
            {LOREM_BANKS.map((bank) => (
              <tr key={bank} className="border-border border-b last:border-b-0">
                <th
                  scope="row"
                  className="px-5 py-3 text-left font-medium text-foreground"
                >
                  {t(`banks.${bank}.name`)}
                </th>
                <td className="px-5 py-3 text-muted-foreground tabular-nums">
                  {t("wordCount", { count: new Set(wordsOf(bank)).size })}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {t(`banks.${bank}.use`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium text-base text-foreground">
            {t("origin.title")}
          </h3>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {t("origin.body")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium text-base text-foreground">
            {t("limits.title")}
          </h3>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {t("limits.body")}
          </p>
        </div>
      </div>
    </section>
  )
}
