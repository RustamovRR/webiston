import { getTranslations } from "next-intl/server"

/**
 * What the four size properties actually mean.
 *
 * A Server Component: it is the same table for every visitor, so it costs no
 * client JavaScript. What it replaces was a 196-line `InfoSection` marked
 * `'use client'` that rendered a marketing pitch — "Professional Testing",
 * "Quality Assurance" — with no information a developer could act on.
 */
export async function ScreenReference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "ScreenResolutionPage.reference"
  })

  const rows = ["screen", "avail", "inner", "outer", "dpr"] as const

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="font-semibold text-2xl text-foreground">{t("title")}</h2>
      <p className="mt-2 max-w-3xl text-muted-foreground">{t("intro")}</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b text-left">
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("columns.property")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("columns.measures")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("columns.useFor")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row}>
                <td className="px-5 py-3 font-mono text-foreground">
                  {t(`rows.${row}.property`)}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {t(`rows.${row}.measures`)}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {t(`rows.${row}.useFor`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
