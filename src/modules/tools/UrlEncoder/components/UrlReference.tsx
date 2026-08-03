import { getTranslations } from "next-intl/server"

/**
 * The page's indexable prose, on the server.
 *
 * What this replaces was a client-rendered card of bullet lists — static text
 * shipped as JavaScript, with three tinted icons and three bullet dots in
 * three palette colours that encoded nothing.
 *
 * The reserved-characters table is the substance: which characters change and
 * which survive is the whole difference between the two encodings, and a table
 * says it in a way three paragraphs cannot.
 */

/** The characters where the two encodings actually disagree. */
const RESERVED = [
  { char: " ", value: "%20", whole: "%20" },
  { char: ":", value: "%3A", whole: ":" },
  { char: "/", value: "%2F", whole: "/" },
  { char: "?", value: "%3F", whole: "?" },
  { char: "#", value: "%23", whole: "#" },
  { char: "&", value: "%26", whole: "&" },
  { char: "=", value: "%3D", whole: "=" },
  { char: "+", value: "%2B", whole: "+" },
  { char: "@", value: "%40", whole: "@" }
] as const

export async function UrlReference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "UrlEncoderPage.reference"
  })

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 pt-10 sm:px-6 lg:px-8">
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
        {t("intro")}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(["value", "whole"] as const).map((scope) => (
          <div
            key={scope}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="font-medium text-base text-foreground">
              {t(`scopes.${scope}.title`)}
            </h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {t(`scopes.${scope}.body`)}
            </p>
            <code className="mt-3 block break-all rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-foreground text-xs">
              {t(`scopes.${scope}.example`)}
            </code>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-medium text-foreground text-lg">
        {t("table.title")}
      </h3>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.char")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.asValue")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.asWhole")}
              </th>
            </tr>
          </thead>
          <tbody>
            {RESERVED.map((row) => (
              <tr
                key={row.char}
                className="border-border border-b last:border-b-0"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-5 py-3 font-mono font-semibold text-foreground"
                >
                  {row.char === " " ? t("table.space") : row.char}
                </th>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-muted-foreground text-xs">
                  {row.value}
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-muted-foreground text-xs">
                  {row.whole}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-3xl text-muted-foreground text-sm leading-relaxed">
        {t("table.note")}
      </p>
    </section>
  )
}
