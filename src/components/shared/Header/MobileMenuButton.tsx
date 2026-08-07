"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { cn } from "@/lib"
import { useMobileMenuStore } from "@/stores"
import MobileMenu from "./MobileMenu"
import type { MobileMenuLabels, MobileNavBook } from "./mobileMenuTypes"

interface MobileMenuButtonProps {
  books: readonly MobileNavBook[]
  labels: MobileMenuLabels
}

const MENU_ID = "site-mobile-menu"

const MobileMenuButton = ({ books, labels }: MobileMenuButtonProps) => {
  const { isOpen, toggle, close } = useMobileMenuStore()
  const pathname = usePathname()

  // The store outlives the page — it is a module-scope zustand store, not
  // component state — so a menu left open would still be open after a client
  // navigation. Every in-menu link calls `onClose` itself, but this covers the
  // browser's own back/forward, which no click handler can see.
  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <>
      <button
        type="button"
        // Was a bare `<button>` with three unlabelled spans: no accessible
        // name, no state. A screen reader announced "button" and nothing else.
        aria-label={isOpen ? labels.closeMenu : labels.openMenu}
        aria-expanded={isOpen}
        aria-controls={MENU_ID}
        // The `lg:hidden` that used to be here was dead — the wrapper in
        // `Header.tsx` is `md:hidden`, so this never reached the lg breakpoint.
        className="flex cursor-pointer items-center justify-center"
        onClick={toggle}
      >
        <span className="relative flex h-9 w-9 items-center justify-center">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-3 left-2 h-0.5 w-5 transform rounded-full bg-current transition-all duration-200",
              isOpen ? "top-4 rotate-45" : ""
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-4.5 left-2 h-0.5 w-5 transform rounded-full bg-current transition-all duration-200",
              isOpen ? "opacity-0" : ""
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-6 left-2 h-0.5 w-5 transform rounded-full bg-current transition-all duration-200",
              isOpen ? "-rotate-45 top-4" : ""
            )}
          />
        </span>
      </button>

      <MobileMenu
        id={MENU_ID}
        isOpen={isOpen}
        onClose={close}
        books={books}
        labels={labels}
      />
    </>
  )
}

export default MobileMenuButton
