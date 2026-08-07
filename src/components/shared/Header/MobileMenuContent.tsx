"use client"

import Link from "next/link"
import Sidebar from "@/components/mdx/Sidebar"
import { cn } from "@/lib"
import { useNavigationStore } from "@/stores/navigationStore"
import LanguageSelector from "../LanguageSelector/LanguageSelector"
import Search from "../Search"
import ThemeToggle from "../ThemeToggle"
import type { MobileMenuLabels, MobileNavBook } from "./mobileMenuTypes"

interface MobileMenuContentProps {
  /** The book being read, when there is one. `null` everywhere else. */
  tutorialId: string | null
  books: readonly MobileNavBook[]
  labels: MobileMenuLabels
  onClose: () => void
}

/**
 * What the hamburger opens.
 *
 * It used to render **nothing at all** unless a book chapter was open:
 * `MobileMenu` gated its whole body on `tutorialId`, which comes from
 * `params.slug[0]` and therefore only exists under `/books/[...slug]`. On the
 * homepage, `/tools`, every tool page and the books index, tapping the menu
 * covered the screen with an empty opaque panel and locked body scroll — the
 * only way out was to find the button again.
 *
 * Worse, and the reason this is a launch blocker rather than a blemish: Search,
 * the language switcher and the theme toggle live in a `hidden md:flex` row in
 * the header, so below 768px they do not exist. With the menu empty there was
 * **no way to change language on a phone at all** — measured, not guessed —
 * which is most of the audience for a locale we had just shipped.
 *
 * So the menu now always carries the full set, and the chapter list is an
 * addition on top when the context calls for it rather than the precondition
 * for the menu existing.
 */
export default function MobileMenuContent({
  tutorialId,
  books,
  labels,
  onClose
}: MobileMenuContentProps) {
  const navigationItems = useNavigationStore((state) =>
    tutorialId ? state.navigationItems[tutorialId] : undefined
  )

  return (
    <div className="flex h-full flex-col">
      {/* Search is pinned: it is the fastest route to anything on the site, and
          on a phone it was previously unreachable.

          The width and height overrides are scoped to this panel on purpose.
          `Search`, `LanguageSelector` and `ThemeToggle` are shared with the
          desktop header, where 36px is a fine mouse target; measured here they
          came out 36px, 32px and 36px tall, and the search field only 224px of
          a 343px row. 44px is the comfortable thumb target, so the menu asks
          for it rather than growing the components everywhere. */}
      <div className="shrink-0 px-4 pt-4 pb-3 [&_button]:h-11 [&_button]:w-full">
        <Search />
      </div>

      {/* The one scrolling region. Everything that can grow lives here so the
          search field and the preferences row never leave the screen. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
        {tutorialId && navigationItems && (
          <section className="pb-4">
            <SectionLabel>{labels.chapters}</SectionLabel>
            <Sidebar
              tutorialId={tutorialId}
              navigationItems={navigationItems}
              onLinkClick={onClose}
            />
          </section>
        )}

        <section className="pb-4">
          <SectionLabel>{labels.browse}</SectionLabel>
          <ul className="space-y-1">
            {books.map((book) => (
              <li key={book.id}>
                <MenuLink href={`/books/${book.id}`} onClose={onClose}>
                  <span className="font-medium">{book.title}</span>
                  <span className="line-clamp-1 text-muted-foreground text-xs">
                    {book.description}
                  </span>
                </MenuLink>
              </li>
            ))}
            <li>
              <MenuLink href="/books" onClose={onClose}>
                <span className="font-medium">{labels.allBooks}</span>
              </MenuLink>
            </li>
            <li>
              <MenuLink href="/tools" onClose={onClose}>
                <span className="font-medium">{labels.tools}</span>
              </MenuLink>
            </li>
          </ul>
        </section>
      </div>

      {/* Preferences, pinned to the bottom where a thumb reaches them — and the
          only place either control exists below 768px. */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-border border-t px-4 py-3 [&_button]:min-h-11">
        <LanguageSelector labels={labels.language} />
        <ThemeToggle />
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 pt-3 pb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
      {children}
    </h2>
  )
}

/**
 * A row in the menu.
 *
 * `onClose` on click rather than on route change: Next keeps the layout
 * mounted across a client navigation, so a menu that only closed on unmount
 * would stay open over the page the visitor just asked for.
 */
function MenuLink({
  href,
  onClose,
  children
}: {
  href: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex min-h-11 flex-col justify-center gap-0.5 rounded-md px-3 py-2 text-sm",
        "transition-colors hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {children}
    </Link>
  )
}
