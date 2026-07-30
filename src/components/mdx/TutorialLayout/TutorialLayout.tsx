"use client"

import { PanelsTopLeft, PanelTop } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib"
import type { TutorialNavigation } from "@/lib/mdx"
import { useNavigationStore } from "@/stores/navigationStore"
import Sidebar from "../Sidebar"
import TableOfContents from "../TableOfContents"
import TutorialLayoutContent from "../TutorialLayoutContent"

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const tutorialId = slug[0]
  const setNavItems = useNavigationStore((state) => state.setNavigationItems)

  useEffect(() => {
    if (navigationItems && navigationItems.length > 0) {
      setNavItems(tutorialId, navigationItems)
    }
  }, [tutorialId, navigationItems, setNavItems])

  return (
    // `--header-height`, not a hardcoded `3.5rem`. The header is 4rem tall
    // (`Header.tsx` reads the same token) plus a 1px border — 65px measured —
    // so a `top-[3.5rem]` sticky put both rails **9px UNDERNEATH** the bar they
    // are supposed to sit below. Two hardcoded heights in two files is exactly
    // the pair that drifts; this is now one token, read in three places.
    <div className="relative mx-auto flex min-h-[calc(100vh-var(--header-height))] w-full max-w-[1536px] px-4 sm:px-6 lg:px-8">
      <aside
        className={cn(
          "sticky top-(--header-height) left-0 z-30 h-[calc(100vh-var(--header-height))] max-lg:hidden",
          // `transition-[width,border-color]`, not `transition-all`, and 300ms
          // rather than 500. `all` asks the browser to watch every animatable
          // property on an element whose width change already forces a layout
          // pass per frame; naming the two that actually change keeps the work
          // to the one thing that matters. 500ms on a panel toggle reads as
          // sluggish — the owner clocked it as "about a second".
          "transition-[width,border-color] duration-300 ease-out motion-reduce:transition-none",
          isSidebarOpen
            ? "w-72 border-border border-r"
            : "w-0 border-r-transparent"
        )}
      >
        {/* No `pl-4`. The container's own `lg:px-8` already establishes the
            page's left edge — the same edge the header's logo starts at — and
            an extra 16px here on top of each nav row's `pl-3` pushed the
            sidebar's text **28px** right of the logo. That gap is what read as
            "the sidebar is not level with the header". */}
        <div
          className={cn(
            "h-full overflow-hidden py-6 transition-opacity duration-200",
            isSidebarOpen ? "opacity-100" : "opacity-0 delay-150"
          )}
        >
          <Sidebar tutorialId={tutorialId} navigationItems={navigationItems} />
        </div>
        {/* Collapsed, this button must line up with the page's left edge — the
            same edge the header logo and the footer's first link sit on. The
            previous `left-[calc(100%-0.5rem)] translate-x-4` put it 8px INTO
            the gutter and then pushed it 16px back, landing at a position that
            matched nothing.
            `-left-2.5` is not a magic nudge: the control is a 40px box around a
            20px icon, so pulling it back by half that difference puts the ICON'S
            left edge exactly on the container's content edge. */}
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="ghost"
          size="icon"
          aria-expanded={isSidebarOpen}
          className={cn(
            "absolute top-[21px] h-10 w-10 cursor-pointer",
            "transition-[left] duration-300 ease-out motion-reduce:transition-none",
            isSidebarOpen ? "left-[calc(100%+0.3rem)]" : "-left-2.5"
          )}
        >
          {isSidebarOpen ? <PanelsTopLeft /> : <PanelTop />}
        </Button>
      </aside>

      <section className={cn("mr-4 min-w-0 flex-1 overflow-y-auto", className)}>
        {/* The whole "content jumps around while the sidebar closes" problem
            lived in this element's old class list: a `translate-x-4`, a
            `pl-12`→`pl-8` swap and a `max-w-[calc(100%-1.5rem)]`, all switching
            at once on a 500ms transform transition, on top of the column
            genuinely getting 288px wider.
            None of it is needed. The column is capped at `--reading-measure`
            and centred, so closing the sidebar hands the extra space to the
            margins instead of to the line length: the text does not re-wrap at
            all, and there is nothing left to animate here. */}
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
