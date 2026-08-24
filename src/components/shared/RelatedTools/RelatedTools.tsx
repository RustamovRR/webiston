import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { relatedTools } from "@/constants/related-tools"

/**
 * "Other tools you might want" — the block every tool page was missing.
 *
 * A Server Component with plain `<Link>`s: no state, no interactivity, and it
 * is the crawlable half of its own purpose. Rendering it on the client would
 * hide the links from the crawler and defeat the point entirely.
 *
 * `href` is passed in rather than read from the router because that keeps this
 * a server component — `usePathname` would force `'use client'` onto a block
 * whose whole job is to be in the HTML.
 *
 * IT OWNS ITS CONTAINER, exactly like the shared `Faq` beside it, and that is
 * not a style choice. Every tool component carries its own
 * `mx-auto max-w-[1536px] px-4 …` wrapper, so a block appended as a sibling
 * of the tool lands OUTSIDE all of it: shipped that way once, the heading sat
 * flush against the viewport edge and the fourth card was cut off. Wired into
 * 23 routes, "the page will wrap it" is an assumption that only has to be
 * wrong once. `className` overrides it for a route that already wraps.
 */
export async function RelatedTools({
  locale,
  href,
  className
}: {
  locale: string
  href: string
  /** Replaces the default container when the route supplies its own. */
  className?: string
}) {
  const tools = relatedTools(href)
  if (tools.length === 0) return null

  const t = await getTranslations({ locale, namespace: "Common" })
  const tTools = await getTranslations({ locale, namespace: "Tools" })
  const prefix = locale === "uz" ? "" : `/${locale}`

  return (
    <section
      className={
        className ??
        "mx-auto w-full max-w-[1536px] px-4 pt-10 pb-16 sm:px-6 lg:px-8"
      }
    >
      <h2 className="font-medium text-foreground text-sm">
        {t("relatedTools")}
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={`${prefix}${tool.href}`}
              className="group flex h-full min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-strong hover:bg-accent/40"
            >
              <span className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                <span className="min-w-0 truncate">
                  {tTools(`${tool.tKey}.title`)}
                </span>
                <ArrowUpRight
                  className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                  aria-hidden="true"
                />
              </span>
              <span className="line-clamp-2 text-muted-foreground text-xs">
                {tTools(`${tool.tKey}.description`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
