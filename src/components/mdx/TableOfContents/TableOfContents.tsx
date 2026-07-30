"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
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

/**
 * The caller passes `key={slug.join("/")}` so this component's state is scoped
 * to one chapter. The mount-only effect below is correct **only** under that
 * key — see the note at the call site in `TutorialLayout` for why it is there
 * even though Next currently remounts this subtree on its own.
 *
 * A `key` rather than a `[route]` effect dependency: nothing in the effect body
 * reads the route, so listing it is a dependency the linter rightly objects to.
 * `key` says "different instance", which is what is actually meant, and it
 * resets `activeId` for free.
 */
export default function TableOfContents({ slug: _slug }: IProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const listRef = useRef<HTMLUListElement>(null)
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(
    null
  )

  useEffect(() => {
    const collected = collectHeadings()
    setHeadings(collected)
    // Trust the browser to have scrolled to the hash already; just adopt it as
    // the initial highlight.
    setActiveId(window.location.hash.slice(1) || collected[0]?.id || "")
  }, [])

  // Measure the active row and drive ONE marker to it, rather than giving every
  // row its own border and toggling colours.
  //
  // Three separate defects came out of the per-row version:
  //   1. `border-l-2` on a `rounded-md` row followed the radius and drew a
  //      detached ARC — it read as a stray bracket, not an indicator.
  //   2. Hovering the ACTIVE row greyed its own indicator out, because
  //      `hover:border-border-strong` and `border-primary` are different
  //      variants — `tailwind-merge` cannot dedupe across them, and the hover
  //      rule wins in the cascade. Reported by the owner, and correct.
  //   3. Changing active row = one element's border appearing and another's
  //      disappearing. Two colour fades are not movement; it read as a jump.
  //
  // One absolutely-positioned bar animating `top`/`height` is a single object
  // that MOVES, which is what the eye is looking for, and it lines up with the
  // row exactly however many lines the heading wraps to.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `headings` re-runs the measurement after the list re-renders; its contents are not read here
  useEffect(() => {
    const list = listRef.current
    if (!list || !activeId) {
      setMarker(null)
      return
    }
    const row = list.querySelector<HTMLElement>(
      `[data-toc-row="${CSS.escape(activeId)}"]`
    )
    // `offsetTop` is safe here precisely because the `ul` is the offset parent
    // (it is `relative`) — the trap that broke the old scroll handler.
    setMarker(row ? { top: row.offsetTop, height: row.offsetHeight } : null)
  }, [activeId, headings])

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
      {/* `relative` so the marker below can be positioned against this list —
          and so `row.offsetTop` in the effect is measured from here. */}
      <ul ref={listRef} className="relative border-border border-l text-sm">
        {/* ONE marker for the whole rail. It slides and resizes to the active
            row instead of each row owning a border that blinks on and off, so
            changing section reads as movement rather than two colour fades.
            No radius: a rounded 2px bar on the rail's own edge is what drew the
            stray arc before. `motion-reduce` respects the OS setting — the bar
            still lands in the right place, it just does not travel. */}
        <span
          aria-hidden="true"
          className="-ml-px pointer-events-none absolute left-0 w-0.5 bg-primary transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            top: marker?.top ?? 0,
            height: marker?.height ?? 0,
            opacity: marker ? 1 : 0
          }}
        />
        {headings.map((heading) => (
          <li key={heading.id}>
            {/* A plain anchor. No `onClick`, no `preventDefault` — see the note
                at the top of this file. Rows carry NO border of their own now;
                that is what let `hover:border-*` override the active row's
                `border-primary` and grey out its own indicator.
                Indentation is PADDING, not a margin: a margin would push the
                row off the rail edge and break the line. */}
            <Link
              data-toc-row={heading.id}
              href={`#${heading.id}`}
              className={cn(
                "block py-1.5 pr-2 text-sm transition-colors duration-200",
                "text-muted-foreground hover:text-foreground",
                heading.level === 2 && "pl-3",
                heading.level === 3 && "pl-6",
                heading.level === 4 && "pl-9",
                activeId === heading.id && "font-medium text-foreground"
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
