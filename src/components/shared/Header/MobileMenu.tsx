"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib"
import MobileMenuContent from "./MobileMenuContent"
import type { MobileMenuLabels, MobileNavBook } from "./mobileMenuTypes"

interface MobileMenuProps {
  id: string
  isOpen: boolean
  onClose: () => void
  books: readonly MobileNavBook[]
  labels: MobileMenuLabels
}

export default function MobileMenu({
  id,
  isOpen,
  onClose,
  books,
  labels
}: MobileMenuProps) {
  const params = useParams()
  // `/books/[...slug]` is the only route with a slug, so this is null on every
  // other page — which is now an ordinary case rather than the reason the menu
  // renders nothing.
  const slug = params?.slug
  const tutorialId = (Array.isArray(slug) ? slug[0] : undefined) ?? null

  // Mount the contents on the first open and keep them after that.
  //
  // The panel element itself has to stay in the tree for the fade, but its
  // CONTENTS do not: Search, the language switcher, the theme toggle and a
  // whole chapter tree were otherwise rendering on every page for a menu most
  // visitors never open, and subscribing to the navigation store while they
  // did it. Keeping them mounted after the first open is what makes the second
  // open instant.
  const [everOpened, setEverOpened] = useState(false)
  useEffect(() => {
    if (isOpen) setEverOpened(true)
  }, [isOpen])

  // Escape closes it. A full-screen panel that traps scroll and cannot be
  // dismissed from the keyboard is the shape a11y audits fail on, and it was
  // also the practical problem: with nothing rendered inside, the only way out
  // was to find the same 36px button again.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  // Lock the page behind the panel, and restore exactly what was there rather
  // than assuming "unset" — another component may own it.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  return (
    <div
      id={id}
      // `role="dialog"` + `aria-modal` so assistive tech treats it as the
      // foreground surface it visually is.
      role="dialog"
      aria-modal="true"
      aria-label={labels.menu}
      // `inert` (native in React 19) takes the whole subtree out of the focus
      // order and the accessibility tree while closed. `opacity-0` alone left
      // every link inside tabbable and announced, on every page.
      inert={!isOpen}
      className={cn(
        // `top-(--header-height)` and `100dvh`, not `mt-14` and `100vh`. The
        // header is 4rem (`hero.css`), so the old 56px offset put the panel 8px
        // under the bar; and `100vh` on mobile is measured against the browser
        // chrome's LARGEST state, so the bottom row sat below the fold behind
        // Safari's toolbar until you scrolled.
        "fixed inset-x-0 top-(--header-height) z-50 bg-background",
        "h-[calc(100dvh-var(--header-height))]",
        "transition-opacity duration-200 ease-out",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      {everOpened && (
        <MobileMenuContent
          tutorialId={tutorialId}
          books={books}
          labels={labels}
          onClose={onClose}
        />
      )}
    </div>
  )
}
