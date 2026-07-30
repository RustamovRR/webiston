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
          "sticky top-(--header-height) left-0 z-30 h-[calc(100vh-var(--header-height))] transition-all duration-500 ease-in-out max-lg:hidden",
          isSidebarOpen
            ? "border-border w-72 border-r"
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
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-[21px] left-[calc(100%+0.3rem)] h-10 w-10 cursor-pointer transition-all duration-500 ease-in-out",
            {
              "!left-[calc(100%-0.5rem)] translate-x-4": !isSidebarOpen
            }
          )}
        >
          {isSidebarOpen ? <PanelsTopLeft /> : <PanelTop />}
        </Button>
      </aside>

      <section
        className={cn(
          "mr-4 flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
          className
        )}
      >
        <div
          className={cn(
            "mx-auto pt-8 pl-12 transition-transform duration-500 ease-in-out max-lg:pl-4",
            {
              "max-w-[calc(100%-1.5rem)] translate-x-4 overflow-x-hidden pl-8":
                !isSidebarOpen
            }
          )}
        >
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
