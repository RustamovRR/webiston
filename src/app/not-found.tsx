import type { Metadata } from "next"
import Link from "next/link"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import ButtonLink from "@/components/shared/ButtonLink/ButtonLink"
import Footer from "@/components/shared/Footer/Footer"
import Header from "@/components/shared/Header/Header"
import { routing } from "@/i18n/routing"

/**
 * The site's 404. Previously there was none, so **every** unmatched URL served
 * Next.js's built-in page — bare white/black type reading "404: This page could
 * not be found.", with no header, no footer, no way back, and no branding.
 *
 * That was not a gap in one corner of the site. It was every 404 on it:
 * `/anything`, `/books/unknown-book`, `/books/<book>/unknown-chapter` and
 * `/en/anything` all landed there, verified against the production build.
 *
 * The three hand-written not-found/error files under `books/` never ran for any
 * of them: `dynamicParams = false` makes Next reject an unknown param at the
 * ROUTING layer, before the segment renders, so a segment-level `not-found.tsx`
 * is only reachable when `notFound()` is called during a render that actually
 * happens — which, for a fully prerendered corpus, it never is. This file is the
 * one Next actually looks for.
 *
 * Chrome is assembled here rather than inherited: `not-found.tsx` at the root
 * sits inside `app/layout.tsx`, which carries only `<html>`/`<body>` and the
 * providers. Header and Footer live in the `[locale]` and `books` layouts, and
 * an unmatched URL belongs to neither — so it gets the same treatment
 * `books/layout.tsx` uses: pin the default locale, hand the client components
 * their two namespaces, done.
 */

export const metadata: Metadata = {
  title: "Sahifa topilmadi",
  description: "Siz izlagan sahifa mavjud emas yoki ko'chirilgan.",
  // A 404 must never be indexed — it is the one page on the site with nothing
  // to say, and it can be reached at an unbounded number of URLs.
  robots: { index: false, follow: true }
}

// Only what Header's client children (`Search`, `ThemeToggle`) actually read.
const CLIENT_NAMESPACES = ["Search", "Common"] as const

export default async function NotFound() {
  setRequestLocale(routing.defaultLocale)
  const messages = await getMessages()
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]])
  )

  return (
    <NextIntlClientProvider
      locale={routing.defaultLocale}
      messages={clientMessages}
    >
      <div className="flex min-h-screen flex-col">
        <Header showLanguageSelector={false} />

        <main className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
          {/* `flex flex-col items-center`, NOT a plain block with `text-center`
              and `mx-auto` on the children.
              With the block version the description sat 64px left of
              everything else — exactly `(max-w-xl 576 − max-w-md 448) / 2`,
              the signature of an auto margin not resolving. Every other child
              is full-width so nothing else revealed it.
              Under `items-center` the PARENT positions each child on the cross
              axis, so a child's own width cap can no longer decide whether it
              is centred. One element owns the alignment instead of five. */}
          <div className="flex w-full max-w-xl flex-col items-center text-center">
            {/* The mono/accent kicker the rest of the site uses for its
                section labels — a 404 is still a Webiston page. */}
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.15em]">
              <span className="size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
              <span className="text-muted-foreground">404</span>
            </div>

            <h1 className="text-balance font-bold text-3xl text-foreground leading-[1.12] tracking-[-0.02em] sm:text-4xl">
              Bu sahifa topilmadi
            </h1>

            <p className="mt-5 max-w-md text-pretty text-base text-muted-foreground leading-relaxed">
              Manzil noto'g'ri yozilgan bo'lishi yoki sahifa ko'chirilgan
              bo'lishi mumkin. Quyidagilardan birini sinab ko'ring.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink
                isNextLink
                href="/"
                variant="primary"
                className="h-11 px-5 text-base"
              >
                Bosh sahifa
              </ButtonLink>
              <ButtonLink
                isNextLink
                href="/books"
                variant="outline"
                className="h-11 px-5 text-base"
              >
                Kitoblar
              </ButtonLink>
            </div>

            {/* A dead end with no exit is the actual failure of a 404. These are
                the three places a lost reader most likely wanted. */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 font-mono text-[11px] text-muted-foreground">
              <Link
                href="/tools"
                className="transition-colors duration-200 hover:text-foreground"
              >
                /tools
              </Link>
              <span className="text-border-strong">·</span>
              <Link
                href="/books/ai-engineering"
                className="transition-colors duration-200 hover:text-foreground"
              >
                /books/ai-engineering
              </Link>
              <span className="text-border-strong">·</span>
              <Link
                href="/books/fluent-react"
                className="transition-colors duration-200 hover:text-foreground"
              >
                /books/fluent-react
              </Link>
            </div>

            <p className="mt-6 font-mono text-[11px] text-muted-foreground">
              Yoki <kbd className="text-foreground">⌘K</kbd> bilan qidiring
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
