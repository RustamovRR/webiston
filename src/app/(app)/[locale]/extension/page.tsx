/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */

import { toCyrillic } from "@webiston/transliteration"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { ExtensionStores } from "@/components/shared/ExtensionStores"
import { Faq } from "@/components/shared/Faq"
import {
  EXTENSION_DEMO_SENTENCE,
  EXTENSION_FAQ_KEYS,
  EXTENSION_FEATURE_KEYS,
  EXTENSION_STEP_KEYS,
  EXTENSION_STORES,
  EXTENSION_TOOL_PATH
} from "@/constants/extension"
import { chromeLinkLocale, Link as I18nLink } from "@/i18n/navigation"
import { localeUrl, SITE_URL, withLocale } from "@/lib/seo"

/**
 * The extension's own page.
 *
 * WHY IT EXISTS, in one number. GSC (28 days to 2026-08-25):
 * «лотин кирилл дастури скачать» — 188 impressions, 9.6% CTR, position 6.3,
 * plus «…для компьютера» at 12.5%. That is people looking for a PROGRAM TO
 * INSTALL, and the only thing webiston.uz had for them was the converter
 * page — which answers a different question — with a small callout at the
 * bottom pointing off-site. The intent converts at eight times the rate of
 * the generic converter query and had no page of its own.
 *
 * A Server Component end to end: two links, a static demo and a native
 * `<details>` FAQ, so the page ships **zero** client JavaScript.
 *
 * The link back to the online converter in the middle is deliberate and is
 * doing two jobs. It catches the visitor who would rather not install
 * anything, and it tells Google which page owns the generic converter query —
 * without it, two pages on the same domain compete for «lotin kirill» and
 * both lose.
 */

const PATH = "/extension"

/**
 * Picks the hero's `src` from the theme class, and keeps picking it.
 *
 * Runs as a blocking inline script placed right AFTER the <img>, so
 * `previousElementSibling` is the image and the parser has not gone further:
 * the src lands before the first paint, and no `src` ever appears in the HTML
 * for the preload scanner to fetch on its own.
 */
const HERO_SRC = `(function(){var i=document.currentScript.previousElementSibling,h=document.documentElement,p=function(){i.src=h.classList.contains("dark")?i.dataset.dark:i.dataset.light};p();new MutationObserver(p).observe(h,{attributes:true,attributeFilter:["class"]})})()`

/** `<` inside a JSON string can close the surrounding `<script>` element. */
function jsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c")
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "ExtensionPage" })

  return withLocale(
    {
      // NOT the H1. The title carries the words people type — "dastur",
      // "скачать" — while the heading reads like a sentence. The Cyrillic
      // half is not decoration either: measured on the converter page, a
      // Latin-only title made Cyrillic-typing visitors read the result as
      // not for them.
      title: t("metaTitle"),
      description: t("metaDescription"),
      openGraph: {
        title: `${t("metaTitle")} — Webiston`,
        description: t("metaDescription"),
        type: "website",
        siteName: "Webiston"
      },
      twitter: {
        card: "summary_large_image",
        site: "@webiston_uz",
        title: `${t("metaTitle")} — Webiston`,
        description: t("metaDescription")
      }
    },
    locale,
    PATH
  )
}

export default async function ExtensionPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  // Explicit locale, never the ambient one — see the note in `[locale]/page.tsx`.
  const t = await getTranslations({ locale, namespace: "ExtensionPage" })

  const storeLabels = Object.fromEntries(
    EXTENSION_STORES.map((store) => [store.id, t(`stores.${store.id}`)])
  )

  // The SAME array is rendered and published, so the visible FAQ and the
  // structured data cannot drift apart — the defect `Faq` was built to end.
  const faqItems = EXTENSION_FAQ_KEYS.map((key) => ({
    question: t(`faq.${key}.q`),
    answer: t(`faq.${key}.a`)
  }))

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t("h1"),
    description: t("metaDescription"),
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome, Edge, Firefox, Brave, Opera, Vivaldi",
    url: localeUrl(locale, PATH),
    inLanguage: locale,
    offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
    publisher: { "@type": "Organization", name: "Webiston", url: SITE_URL }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      {/* The site's container with the column centred inside it — the rule
          `privacy-policy` settled: a single column with nothing to its right
          reads as broken when pinned left on a wide screen. Wider than that
          page's 68ch because the feature row is a grid, not prose. */}
      <div className="mx-auto w-full max-w-[1536px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[80ch]">
          <header>
            {/* 1.25 leading, not Tailwind's default 1: at 48px this face
                reports 56px of natural height and descenders hang out of a
                tighter box. Same measurement as `privacy-policy`. */}
            <h1 className="font-bold text-4xl leading-[1.25] tracking-[-0.03em] sm:text-5xl">
              {t("h1")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t("tagline")}
            </p>
            <ExtensionStores
              labels={storeLabels}
              size="lg"
              className="mt-8 flex flex-wrap gap-3"
            />
            <p className="mt-4 text-muted-foreground text-sm">
              {t("storesNote")}
            </p>
          </header>

          {/* The product, photographed — not drawn. `scripts/store-screenshots.mjs
              --landing` side-loads the real built extension into a real
              Chrome, makes a real selection on a page of this site, and
              captures the panel at 2x, per locale, so an Uzbek visitor sees an
              Uzbek panel. 1600px is 2x of this column; each file is ~100 KB
              and `images.unoptimized` means that is exactly what ships.

              ONE <img>, not a light/dark pair. The pair was tried and measured
              on a throttled 4 Mbps line: two lazy images fetch only the visible
              one but make the hero — the LCP element — land at 3.2s; marking
              the dark one `priority` brought dark visitors to 1.3s and pushed
              light visitors to 3.5s, because the preload fetched a dark image
              they never see. The theme is a CLASS next-themes sets before
              first paint, not a media query, so <picture> cannot pick either.
              So: no `src` in the HTML — the preload scanner has nothing to
              fetch — and the script directly after chooses it from the class
              while the parser is still here. One fetch, the right one, eager.
              The observer keeps it right if the theme is toggled later, and
              only then does the other file download. Plain <img> because
              `next/image` needs the src at render time and this one does not
              exist until the browser decides. */}
          <figure className="mt-10 overflow-hidden rounded-lg border border-border bg-card">
            {/* biome-ignore lint/performance/noImgElement: the src is chosen client-side from the theme class, see above */}
            <img
              data-light={`/extension/panel-${locale}-light.webp`}
              data-dark={`/extension/panel-${locale}-dark.webp`}
              alt={t("screenshotAlt")}
              width={1600}
              height={880}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="block w-full"
              suppressHydrationWarning
            />
            <script dangerouslySetInnerHTML={{ __html: HERO_SRC }} />
          </figure>

          {/* Not a screenshot, and deliberately so: this is the real engine
              run at build time on a sentence that carries the hard cases —
              `oʻ`, `gʻ`, `sh`, `ch`. A mocked-up window would be a drawing of
              a product; this is the product's actual output. */}
          <section className="mt-14">
            <h2 className="font-semibold text-foreground text-xl tracking-[-0.01em]">
              {t("demoTitle")}
            </h2>
            <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              <div className="bg-card p-5">
                <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                  {t("demoLatin")}
                </p>
                <p className="mt-2 text-foreground leading-relaxed">
                  {EXTENSION_DEMO_SENTENCE}
                </p>
              </div>
              <div className="bg-card p-5">
                <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                  {t("demoCyrillic")}
                </p>
                <p className="mt-2 text-foreground leading-relaxed">
                  {toCyrillic(EXTENSION_DEMO_SENTENCE)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-semibold text-foreground text-xl tracking-[-0.01em]">
              {t("featuresTitle")}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {EXTENSION_FEATURE_KEYS.map((key) => (
                <li
                  key={key}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <h3 className="font-medium text-foreground text-sm">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {t(`features.${key}.body`)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="font-semibold text-foreground text-xl tracking-[-0.01em]">
              {t("stepsTitle")}
            </h2>
            {/* A real `<ol>`: the order is the meaning, and a screen reader
                should say "1 of 3" without a `aria-*` prop to make it. */}
            <ol className="mt-4 space-y-4">
              {EXTENSION_STEP_KEYS.map((key, index) => (
                <li key={key} className="flex gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-muted-foreground leading-relaxed">
                    {t(`steps.${key}`)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14 rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground text-base">
              {t("webTitle")}
            </h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {t("webBody")}
            </p>
            <I18nLink
              href={EXTENSION_TOOL_PATH}
              locale={chromeLinkLocale(locale)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 font-medium text-foreground text-sm transition-colors hover:bg-accent"
            >
              {t("webCta")}
            </I18nLink>
          </section>

          <Faq
            locale={locale}
            items={faqItems}
            title={t("faqTitle")}
            className="mt-14"
          />
        </div>
      </div>
    </>
  )
}
