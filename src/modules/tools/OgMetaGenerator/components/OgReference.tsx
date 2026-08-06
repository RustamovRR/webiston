import { getTranslations } from "next-intl/server"

import {
  IMAGE_IDEAL_HEIGHT,
  IMAGE_IDEAL_WIDTH,
  IMAGE_MIN_EDGE,
  PLATFORM_LIMITS,
  PLATFORMS
} from "../constants"

/**
 * The page's indexable prose, on the server.
 *
 * What this replaces was a client-rendered "InfoSection" — static text shipped
 * as JavaScript — listing what Open Graph is. The table is the substance,
 * because the questions people arrive with are all about NUMBERS: how long can
 * the title be, what size should the image be, why does one platform cut the
 * description and another does not.
 *
 * The per-platform numbers are the same constants the previews truncate with,
 * so the documentation cannot describe a tool that behaves differently.
 */
export async function OgReference({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "OgMetaGeneratorPage.reference"
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
                {t("table.platform")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.title")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.description")}
              </th>
              <th className="px-5 py-3 font-medium text-muted-foreground">
                {t("table.note")}
              </th>
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((platform) => (
              <tr
                key={platform}
                className="border-border border-b last:border-b-0"
              >
                <th
                  scope="row"
                  className="px-5 py-3 text-left font-medium text-foreground"
                >
                  {t(`platforms.${platform}.name`)}
                </th>
                <td className="px-5 py-3 text-muted-foreground tabular-nums">
                  {t("chars", { count: PLATFORM_LIMITS[platform].title })}
                </td>
                <td className="px-5 py-3 text-muted-foreground tabular-nums">
                  {t("chars", { count: PLATFORM_LIMITS[platform].description })}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {t(`platforms.${platform}.note`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium text-base text-foreground">
            {t("image.title")}
          </h3>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {t("image.body", {
              width: IMAGE_IDEAL_WIDTH,
              height: IMAGE_IDEAL_HEIGHT,
              min: IMAGE_MIN_EDGE
            })}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-medium text-base text-foreground">
            {t("cache.title")}
          </h3>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {t("cache.body")}
          </p>
        </div>
      </div>
    </section>
  )
}
