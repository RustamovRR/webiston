import { cn } from "@/lib"
import type { TutorialNavigation } from "@/lib/mdx"
import Sidebar from "../Sidebar"
import TableOfContents from "../TableOfContents"
import TutorialLayoutContent from "../TutorialLayoutContent"

/**
 * The book reader's three-column shell. **A Server Component** — it used to be
 * `'use client'`, and two things were keeping it there:
 *
 * 1. `useState` for the sidebar collapse toggle, removed on the owner's call.
 *    Once `--reading-measure` capped the reading column, collapsing bought the
 *    reader nothing: the prose could not get wider, so the toggle only hid the
 *    navigation. No major docs site (Next.js, Tailwind, Stripe, MDN) has one,
 *    for that reason.
 * 2. A `useEffect` pushing `navigationItems` into the Zustand store — which was
 *    **duplicate work**. `books/[...slug]/layout.tsx` already renders
 *    `<NavigationStoreInitializer tutorialId navigationItems />` as this
 *    component's immediate sibling, with the same two arguments, for the same
 *    store key. One of the two was always redundant, and the one inside the
 *    shell was the one forcing the whole reader across the client boundary.
 *
 * So the shell now ships no JavaScript of its own. `Sidebar`,
 * `TutorialLayoutContent` and `TableOfContents` stay client components, but as
 * leaves that a server parent renders — which is the shape the boundary was
 * supposed to have.
 */

interface DocLayoutProps {
  children: React.ReactNode
  className?: string
  params: {
    slug: string[]
  }
  pageTitle?: string
  navigationItems: TutorialNavigation[]
  tutorialTitle: string
}

export default function TutorialLayout({
  children,
  className,
  params,
  pageTitle,
  navigationItems,
  tutorialTitle
}: DocLayoutProps) {
  const { slug } = params
  const tutorialId = slug[0]

  return (
    // `--header-height`, not a hardcoded `3.5rem`. The header is 4rem tall
    // (`Header.tsx` reads the same token) plus a 1px border — 65px measured —
    // so a `top-[3.5rem]` sticky put both rails **9px UNDERNEATH** the bar they
    // are supposed to sit below. Two hardcoded heights in two files is exactly
    // the pair that drifts; this is now one token, read in three places.
    <div className="relative mx-auto flex min-h-[calc(100vh-var(--header-height))] w-full max-w-[1536px] px-4 sm:px-6 lg:px-8">
      <aside className="sticky top-(--header-height) left-0 z-30 h-[calc(100vh-var(--header-height))] w-72 border-border border-r max-lg:hidden">
        {/* No `pl-4`. The container's own `lg:px-8` already establishes the
            page's left edge — the same edge the header's logo starts at — and
            an extra 16px here on top of each nav row's `pl-3` pushed the
            sidebar's text **28px** right of the logo. That gap is what read as
            "the sidebar is not level with the header". */}
        <div className="h-full overflow-hidden py-6">
          <Sidebar tutorialId={tutorialId} navigationItems={navigationItems} />
        </div>
      </aside>

      <section className={cn("mr-4 min-w-0 flex-1 overflow-y-auto", className)}>
        {/* Capped at `--reading-measure` and centred. 1,152px of prose is ~150
            characters per line, about double the readable maximum. */}
        <div className="mx-auto w-full max-w-(--reading-measure) pt-8 pl-12 max-lg:pl-4">
          <TutorialLayoutContent
            tutorialTitle={tutorialTitle}
            navigationItems={navigationItems}
            pageTitle={pageTitle}
          >
            {children}
          </TutorialLayoutContent>
        </div>
      </section>

      <nav className="sticky top-(--header-height) hidden h-[calc(100vh-var(--header-height))] w-64 flex-shrink-0 max-lg:hidden lg:block">
        {/* `pl-3` matches the left rail's own row inset exactly, so the two
            rails are inset the same amount from their respective page edges. */}
        <div className="h-full py-6 pr-4 pl-3">
          {/* Keyed by route because the ToC's state IS per-route.
              Honest scope: this is NOT fixing an observed bug — measured on a
              production build, the rail updates correctly across client-side
              navigation without it, because Next currently remounts this
              subtree. It is here because that is an unstated dependency on
              framework behaviour, and `cacheComponents` (stable in 16.2) would
              change it: it preserves component state across navigation via
              React `<Activity>`, at which point a mount-only effect would keep
              serving the previous chapter's headings. */}
          <TableOfContents key={slug.join("/")} slug={slug} />
        </div>
      </nav>
    </div>
  )
}
