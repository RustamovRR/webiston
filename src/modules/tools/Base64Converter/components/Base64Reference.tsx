import { getTranslations } from "next-intl/server"

/**
 * The page's indexable prose, on the server.
 *
 * What this replaces was two client-rendered cards of bullet lists behind a
 * `'use client'` boundary — static text shipped as JavaScript, decorated with
 * two indigo icons and three bullet dots in three different palette colours
 * that encoded nothing. The colour of a bullet is not information; the
 * heading is.
 *
 * The worked example is the point: Base64 is the one encoding a developer can
 * follow by hand, and seeing `Ali` become `QWxp` explains the 4/3 size growth
 * better than a sentence about it does.
 */
export async function Base64Reference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "Base64ConverterPage.reference"
  })

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 pt-10 sm:px-6 lg:px-8">
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
        {t("intro")}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(["what", "growth", "urlSafe"] as const).map((key) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="font-medium text-base text-foreground">
              {t(`cards.${key}.title`)}
            </h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {t(`cards.${key}.body`)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{t("worked.caption")}</caption>
          <thead>
            <tr className="border-border border-b">
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("worked.step")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("worked.value")}
              </th>
            </tr>
          </thead>
          <tbody>
            {(["text", "bytes", "bits", "groups", "base64"] as const).map(
              (row) => (
                <tr
                  key={row}
                  className="border-border border-b last:border-b-0"
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-5 py-3 font-medium text-foreground"
                  >
                    {t(`worked.rows.${row}.label`)}
                  </th>
                  <td className="px-5 py-3 font-mono text-muted-foreground text-xs">
                    {t(`worked.rows.${row}.value`)}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
