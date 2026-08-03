import { getTranslations } from "next-intl/server"

import { REGISTERED_CLAIMS } from "../utils/jwt"

/**
 * The page's indexable prose, on the server.
 *
 * What this replaces was a client-rendered card of bullet lists — static text
 * shipped as JavaScript, with two tinted icons and three bullet dots in three
 * palette colours that encoded nothing.
 *
 * The claims table is the substance. RFC 7519 registers exactly seven claims
 * and every one of them is something a developer eventually has to look up;
 * the page a person is already staring at a token on is the right place for
 * that list.
 */
export async function JwtReference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "JwtDecoderPage.reference"
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
        {(["header", "payload", "signature"] as const).map((part) => (
          <div
            key={part}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="font-medium text-base text-foreground">
              {t(`parts.${part}.title`)}
            </h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {t(`parts.${part}.body`)}
            </p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-medium text-foreground text-lg">
        {t("claims.title")}
      </h3>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("claims.claim")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("claims.name")}
              </th>
              <th className="min-w-[20rem] px-5 py-3 font-medium text-muted-foreground">
                {t("claims.meaning")}
              </th>
            </tr>
          </thead>
          <tbody>
            {REGISTERED_CLAIMS.map((claim) => (
              <tr
                key={claim}
                className="border-border border-b last:border-b-0"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-5 py-3 font-mono font-semibold text-foreground text-xs"
                >
                  {claim}
                </th>
                <td className="whitespace-nowrap px-5 py-3 text-foreground">
                  {t(`claims.rows.${claim}.name`)}
                </td>
                <td className="px-5 py-3 text-muted-foreground leading-relaxed">
                  {t(`claims.rows.${claim}.meaning`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
