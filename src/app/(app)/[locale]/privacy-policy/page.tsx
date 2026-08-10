import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { withLocale } from "@/lib/seo"

/**
 * The privacy policy.
 *
 * Written because all three extension stores require a policy URL before they
 * will accept a submission — but the claim it makes is the product's, not a
 * compliance form: almost nothing the visitor types reaches a server, on the
 * site or in the extension. "Almost" is load-bearing and has its own section;
 * an overclaim here is worse than no page at all.
 *
 * A Server Component with no interactivity, so it ships zero client
 * JavaScript and needs no `LocaleMessages` provider.
 */

/**
 * ONE date, formatted per locale.
 *
 * It was three hand-typed strings in three message files, in three different
 * formats (`2026-08-07`, `7 August 2026`, `7 августа 2026`) — and already
 * wrong. A date that has to be retyped in three places is a date that will
 * disagree with itself.
 */
const LAST_UPDATED = "2026-08-10"

/** Rendered in this order; every key exists in all three bundles. */
const SECTIONS = [
  "scope",
  "data",
  "ipException",
  "storage",
  "permissions",
  "thirdParty",
  "children",
  "changes",
  "contact"
] as const

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "PrivacyPage" })

  return withLocale(
    {
      title: t("title"),
      description: t("intro"),
      // A policy page has no business competing for search traffic, but it
      // MUST stay crawlable: the stores fetch this URL to check it resolves.
      robots: { index: true, follow: true }
    },
    locale,
    "/privacy-policy"
  )
}

export default async function PrivacyPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  // Explicit locale, never the ambient one — see the note in `[locale]/page.tsx`.
  const t = await getTranslations({ locale, namespace: "PrivacyPage" })

  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(`${LAST_UPDATED}T00:00:00Z`)
  )

  return (
    /* The site's container, with the column CENTRED inside it.
       `books/not-found.tsx` is the in-repo precedent and it settles the
       question: the rule here is "always the 1536px container", not "always
       the left gutter". A page whose content spans the width — the hero, the
       tools grid — starts at the gutter because there is something on the
       right. A single prose column has nothing there, so pinning it left
       leaves two thirds of a wide screen empty and the page reads as broken
       rather than as deliberate. The text inside stays left-aligned, because
       centred paragraphs are harder to read at any width. */
    <div className="mx-auto w-full max-w-[1536px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[68ch]">
        <header className="border-border border-b pb-8">
          {/* `leading-[1.1]` is not a nudge, it is the fix.
              Tailwind v4 ships `text-5xl` with `--text-5xl--line-height: 1` —
              a 48px heading whose line box is exactly 48px, so it has ZERO
              leading and the descenders sit flush against the bottom edge.
              Any margin below then measures from that edge and reads far
              smaller than it is, which is why the title looked glued to the
              paragraph at a nominal 24px gap. */}
          <h1 className="font-bold text-4xl leading-[1.1] tracking-[-0.03em] sm:text-5xl">
            {t("title")}
          </h1>
          {/* ~0.67x the heading size — the range docs sites settle on for the
              space under an H1 (Stripe, Vercel, Linear are all 24–36px at
              this scale). 24px was the bottom of that range measured from a
              line box with no leading to spare, which is the worst case. */}
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
            {t("intro")}
          </p>
          {/* The date closes the header rather than sitting under the title.
              Wedged between a 48px heading and an 18px paragraph it belonged
              to neither — too small to read as a subtitle, too close to read
              as metadata. Below the intro, against the rule, it is plainly a
              footnote about the document. */}
          <p className="mt-8 font-mono text-muted-foreground text-xs">
            {t("updated")}: {updated}
          </p>
        </header>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((section) => (
            <section key={section}>
              <h2 className="font-semibold text-foreground text-xl tracking-[-0.01em]">
                {t(`sections.${section}.title`)}
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {t(`sections.${section}.body`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
