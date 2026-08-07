import { getTranslations } from "next-intl/server"

import { ALGORITHM_META, ALGORITHMS } from "../constants"

/**
 * The page's indexable prose, on the server.
 *
 * What this replaces was a client-rendered three-card grid — static text
 * shipped as JavaScript — whose "Foydalanish sohalari" list opened with
 * **"Parol hashing"**. Hashing a password with SHA-256 is the thing you must
 * not do: these functions are built to be fast, and fast is exactly what an
 * offline cracker wants. bcrypt, scrypt and Argon2 exist for that job. The
 * tool was teaching the mistake it should be warning about, and the route's
 * structured data repeated it under `featureList`.
 *
 * The table is the substance. Which digest lengths exist is what lets you
 * recognise a checksum you have been handed, and which two algorithms are
 * broken is the only security question this page has to answer.
 */
export async function HashReference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "HashGeneratorPage.reference"
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
                {t("table.algorithm")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.bits")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.length")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.use")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ALGORITHMS.map((algorithm) => {
              const meta = ALGORITHM_META[algorithm]
              return (
                <tr
                  key={algorithm}
                  className="border-border border-b last:border-b-0"
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-5 py-3 font-mono font-semibold text-foreground"
                  >
                    {algorithm}
                    {meta.status === "broken" && (
                      <span className="ml-2 rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 font-medium font-sans text-[11px] text-destructive">
                        {t("broken")}
                      </span>
                    )}
                  </th>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground tabular-nums">
                    {meta.bits}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground tabular-nums">
                    {t("table.chars", { count: meta.hexLength })}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground leading-relaxed">
                    {t(`algorithms.${meta.key}`)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(["verify", "passwords"] as const).map((topic) => (
          <div
            key={topic}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="font-medium text-base text-foreground">
              {t(`topics.${topic}.title`)}
            </h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {t(`topics.${topic}.body`)}
            </p>
            <code className="mt-3 block break-all rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-foreground text-xs">
              {t(`topics.${topic}.example`)}
            </code>
          </div>
        ))}
      </div>
    </section>
  )
}
