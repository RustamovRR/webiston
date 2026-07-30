"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib"

/**
 * The reading page's right rail — a scroll-spy over the chapter's own headings.
 *
 * Client by necessity: it reads the rendered DOM and tracks scroll position.
 * Everything that did NOT need to be client has been taken out.
 *
 * What was removed and why:
 *
 * 1. **The click handler.** Every link did `preventDefault()` and then
 *    `window.scrollTo({ top: element.offsetTop - 100 })`. `offsetTop` is
 *    measured from the nearest POSITIONED ancestor, and `TutorialLayout`'s root
 *    is `relative` — measured on a real chapter, a heading's `offsetTop` was
 *    522 while its true document offset was 587. So the handler landed
 *    `65 + 100 = 165px` above the target, and the magic `-100` existed to
 *    paper over the first half of that.
 *    Meanwhile the headings already carry `scroll-margin-top: 80px` (measured),
 *    which is exactly what native anchor scrolling honours. Deleting the
 *    handler makes the browser do it correctly, for free — no JS, no magic
 *    number, and `history.pushState` comes along for free too.
 *
 * 2. **The initial-hash `scrollTo`.** Same wrong arithmetic, plus a 100ms
 *    `setTimeout` racing the browser's own hash handling. The browser already
 *    lands on `#id` in prerendered HTML; we only need to know which id is
 *    active so the rail can highlight it.
 *
 * 3. **The per-event DOM query.** The scroll handler re-ran
 *    `querySelectorAll` + `getBoundingClientRect` on every scroll event. In
 *    fairness this measured 0.028ms on a 7-heading chapter, so it was never the
 *    bottleneck it looked like — but there is no reason to re-query a
 *    prerendered document that cannot change, so it now reads the collected
 *    list.
 */

interface Heading {
  id: string
  text: string
  level: number
  element: HTMLElement
}

interface IProps {
  slug: string[]
}

/** Where the "you are here" line sits: a heading counts as active once it has
 *  passed the upper third of the viewport. */
const ACTIVE_LINE_DIVISOR = 3

function collectHeadings(): Heading[] {
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "article h2, article h3, article h4"
      )
    )
      // A heading with no `id` cannot be linked to, so it has no business in a
      // list of links — it used to render as `href="#"`.
      .filter((element) => element.id)
      .map((element) => ({
        id: element.id,
        text: element.textContent || "",
        level: Number(element.tagName.charAt(1)),
        element
      }))
  )
}

export default function TableOfContents({ slug: _slug }: IProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const collected = collectHeadings()
    setHeadings(collected)
    // Trust the browser to have scrolled to the hash already; just adopt it as
    // the initial highlight.
    setActiveId(window.location.hash.slice(1) || collected[0]?.id || "")
  }, [])

  useEffect(() => {
    if (headings.length === 0) return

    const update = () => {
      const line = window.innerHeight / ACTIVE_LINE_DIVISOR
      let current = headings[0].id
      for (const heading of headings) {
        if (heading.element.getBoundingClientRect().top > line) break
        current = heading.id
      }
      setActiveId(current)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="scrollbar-custom relative max-h-[calc(100vh-8rem)] min-w-0 overflow-y-auto">
      <div className="sticky top-0 z-10">
        {/* Same mono/accent kicker the landing page and homepage dividers use,
            instead of a lone bold sentence. */}
        <div className="flex items-center gap-2.5 bg-background pb-2 font-mono text-[11px] uppercase tracking-[0.15em]">
          <span className="size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
          <span className="text-foreground">Ushbu sahifada</span>
        </div>
        <div className="pointer-events-none h-2 bg-gradient-to-b from-background to-transparent" />
      </div>
      <ul className="space-y-0.5 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              "relative",
              heading.level === 3 && "ml-3",
              heading.level === 4 && "ml-6"
            )}
          >
            {/* A plain anchor. No `onClick`, no `preventDefault` — see the note
                at the top of this file. `text-foreground` / `text-muted-
                foreground`, not `text-black dark:text-white`: the token pair
                flips with the scheme, so the four `dark:` variants this used to
                need are gone. */}
            <Link
              href={`#${heading.id}`}
              className={cn(
                "block rounded-md py-1 pr-2 pl-2.5 text-sm transition-colors duration-200",
                "border-transparent border-l-2 text-muted-foreground hover:text-foreground",
                activeId === heading.id &&
                  "border-primary font-medium text-foreground"
              )}
              style={{ wordBreak: "break-word" }}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
      <div className="pointer-events-none sticky right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
