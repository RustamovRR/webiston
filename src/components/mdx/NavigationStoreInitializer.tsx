"use client"

import { useEffect } from "react"
import type { TutorialNavigation } from "@/lib/mdx"
import { useNavigationStore } from "@/stores/navigationStore"

interface NavigationStoreInitializerProps {
  tutorialId: string
  navigationItems: TutorialNavigation[]
}

/**
 * Hands the server-loaded chapter tree to the client store, so the mobile menu
 * — which lives in the header, a different subtree entirely — can render it.
 *
 * ── Why this is an effect and not a render-phase write ───────────────────────
 * It used to call `useNavigationStore.setState(...)` straight from the render
 * body behind a `useRef` guard. That is a write to an external store during
 * React's render phase, and React reports it as:
 *
 *   Cannot update a component (`MobileMenuContent`) while rendering a
 *   different component (`NavigationStoreInitializer`).
 *
 * The warning only appeared once the mobile menu stopped being gated on
 * `tutorialId` — before that, nothing was subscribed to this store during the
 * render that wrote to it, so the violation was silent rather than absent. It
 * was always a bug: a render-phase store write can tear (some subscribers see
 * the old value, some the new) and it makes the component impossible to render
 * twice safely, which Strict Mode and concurrent rendering both do.
 *
 * The guard it replaced had its own defect: `initialized.current` latched on
 * the FIRST render and never cleared, so if this component were ever reused
 * across two books instead of remounting, the second book would silently show
 * the first book's chapters. Keying on `tutorialId` removes that class.
 */
function NavigationStoreInitializer({
  tutorialId,
  navigationItems
}: NavigationStoreInitializerProps) {
  useEffect(() => {
    // Cheap identity check rather than an unconditional write: the parent is a
    // Server Component, so `navigationItems` arrives as a fresh array on each
    // render, and writing it back would wake every subscriber for nothing.
    const store = useNavigationStore.getState()
    if (store.navigationItems[tutorialId] === navigationItems) return
    store.setNavigationItems(tutorialId, navigationItems)
  }, [tutorialId, navigationItems])

  return null
}

export default NavigationStoreInitializer
