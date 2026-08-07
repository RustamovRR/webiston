import { getTranslations } from "next-intl/server"

/**
 * What an IP address does and does not give away.
 *
 * This replaces a 282-line `SecurityAnalysis` panel that rendered a security
 * SCORE — "100%, Safe" — from values the code hardcoded. Two of the three
 * provider transforms set `is_proxy: false`, `is_tor: false`,
 * `threat_level: "low"` unconditionally, and the only provider that read a real
 * proxy flag was the HTTP-only one that a browser on an HTTPS page can never
 * reach. Nothing was ever checked.
 *
 * Honest proxy, VPN and Tor detection is a paid feature at every provider that
 * offers it. We do not have it, so the page says so rather than inventing a
 * verdict — the same call this project already made when it deleted fabricated
 * review ratings from 18 files.
 *
 * A Server Component: identical for every visitor, so it costs no client JS.
 */
export async function PrivacyNote({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "IpInfoPage.privacy" })

  const points = ["reveals", "hides", "detection"] as const

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="font-semibold text-2xl text-foreground">{t("title")}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {points.map((point) => (
          <div
            key={point}
            className="rounded-xl border border-border bg-card px-5 py-4"
          >
            <h3 className="font-medium text-foreground">
              {t(`points.${point}.title`)}
            </h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {t(`points.${point}.body`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
