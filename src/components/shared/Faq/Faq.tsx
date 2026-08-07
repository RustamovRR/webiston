import { getTranslations } from "next-intl/server"

/**
 * The suite's ONE frequently-asked-questions section.
 *
 * There were three disclosure implementations before this and the measurement
 * is why it is one now. Comparing the `FAQPage` schema against the visible DOM
 * on all 17 prerendered tool pages (every `<script>` stripped first — the RSC
 * flight payload carries the JSON-LD text and makes a naive grep report
 * success): **15 routes published a FAQ and rendered nothing at all**, and of
 * the two that rendered, the one on the shared Radix `FaqAccordion` shipped 6
 * of 6 questions and **0 of 6 answers** — Radix's `AccordionContent` is a
 * `CollapsiblePrimitive.Content` with no `forceMount`, so closed content is
 * never in the document. Structured data with no on-page counterpart is a
 * Search guidelines violation, and it was live on 16 of our 17 tools.
 *
 * So this is a native `<details>`, and that choice carries the whole point:
 * the answer is in the HTML whether the disclosure is open or not, it works
 * before hydration, it is keyboard- and screen-reader-native, and it ships
 * **zero JavaScript** — a Server Component with no client leaf. The animation
 * that Radix was providing comes from `.disclosure` (see `styles/base.css`),
 * at the accordion's own 240ms/200ms and easing, so the two read as one
 * control.
 *
 * It lives in `src/components/shared/` and not in `@webiston/ui` on purpose:
 * `packages/ui` is standalone and ships into the Chrome extension, while this
 * needs `next-intl/server` and an app-level stylesheet rule. `ToolCard` is
 * here for the same reason.
 *
 * Consumers pass the SAME array they publish as structured data, so the two
 * cannot drift apart again.
 */

export interface FaqItem {
  question: string
  answer: string
}

interface FaqProps {
  locale: string
  items: readonly FaqItem[]
  /** Overrides the shared heading when a tool wants its own wording. */
  title?: string
  className?: string
}

export async function Faq({ locale, items, title, className }: FaqProps) {
  if (items.length === 0) return null

  // Explicit locale: this renders outside the request-scoped provider that
  // wraps the client island, and `getLocale()` answers "uz" on /en there.
  const t = await getTranslations({ locale, namespace: "Common" })

  return (
    <section
      className={
        className ??
        "mx-auto w-full max-w-[1536px] px-4 pt-10 pb-16 sm:px-6 lg:px-8"
      }
    >
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {title ?? t("faqTitle")}
      </h2>

      <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {items.map((item) => (
          <details key={item.question} className="disclosure group">
            {/* A heading inside `<summary>` is valid — summary takes heading
                content — and it makes each question real document structure.
                The first pass wrote this as a `<dl>`, which admits `<dt>`/
                `<dd>` groups and `<div>` wrappers and nothing else, so a
                `<details>` child was a definition list with no terms in it. */}
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
              <h3 className="font-medium text-base text-foreground">
                {item.question}
              </h3>
              <span
                aria-hidden="true"
                className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <p className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
