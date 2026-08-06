import { getTranslations } from "next-intl/server"

import { UUID_VERSIONS, VERSION_META } from "../constants"

/**
 * The page's indexable prose, on the server.
 *
 * What it replaces was a client-rendered three-card grid — static text
 * shipped as JavaScript — repeating that v4 is random and v1 uses a MAC
 * address, which is the one thing about UUIDs everybody already knows.
 *
 * The table is the substance, because the real question is not "what is a
 * UUID" but "which one do I put in this column". Two facts decide it: whether
 * a batch sorts by creation time (a v4 primary key scatters inserts across a
 * B-tree index; v7 appends to the end of it) and how many bits are actually
 * random — which is also the answer to "can I use this as a token", and that
 * answer is no for every version with a clock in it.
 */
export async function UuidReference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "UuidGeneratorPage.reference"
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
                {t("table.version")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.entropy")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.sortable")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.use")}
              </th>
            </tr>
          </thead>
          <tbody>
            {UUID_VERSIONS.map((version) => {
              const meta = VERSION_META[version]
              return (
                <tr
                  key={version}
                  className="border-border border-b last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-5 py-3 text-left font-medium text-foreground"
                  >
                    {t(`versions.${version}.name`)}
                  </th>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">
                    {t("bits", { bits: meta.entropyBits })}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {meta.sortable ? t("yes") : t("no")}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {t(`versions.${version}.use`)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-muted-foreground text-sm leading-relaxed">
        {t("secretWarning")}
      </p>
    </section>
  )
}
