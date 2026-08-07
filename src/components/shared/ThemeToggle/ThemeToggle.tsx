"use client"

import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import type { MouseEvent } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"

/**
 * Light/dark switch.
 *
 * ── Why a CSS transition here can never fire ─────────────────────────────────
 * `Providers.tsx` sets next-themes' `disableTransitionOnChange`, so
 * `* { transition: none !important }` is injected for the duration of the swap.
 * It killed the rotate/scale pair written before this, and it killed the
 * framer-motion animation before that — which means that dependency was being
 * carried site-wide for an animation that never ran once. The flag itself is
 * correct: this site is token-driven, and without it roughly 1,600 elements
 * would each run their own `transition-colors` simultaneously and the page
 * would smear through an intermediate colour.
 *
 * The way out is to animate ONE thing instead of 1,600: the View Transitions
 * API snapshots the old page, paints the new one, and cross-fades between the
 * two snapshots — a single composited animation that the injected rule cannot
 * touch. The fade itself is the browser's default, shortened to 180ms in
 * `hero.css`; an earlier version wiped a circle out from the button and was
 * far too loud for what is, in the end, a preference toggle.
 *
 * `flushSync` is load-bearing: `startViewTransition` snapshots the DOM when its
 * callback returns, so the theme class has to be on `<html>` by then. A plain
 * `setTheme` would land after the snapshot and the fade would reveal the OLD
 * theme.
 *
 * Degrades on its own terms — no `startViewTransition` (Firefox) or
 * `prefers-reduced-motion: reduce` takes the plain `setTheme` path.
 */

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

export default function ThemeToggle() {
  const t = useTranslations("Common")
  const { resolvedTheme, setTheme } = useTheme()

  const handleToggle = (_event: MouseEvent<HTMLButtonElement>) => {
    // `resolvedTheme`, not `theme` — the value a binary toggle should read,
    // because `theme` can hold "system" while `resolvedTheme` is always the
    // scheme actually painted.
    //
    // HONEST SCOPE: correctness, not a bug fix. I first wrote that the old
    // `theme === "light"` made the first click do nothing, then checked: with
    // `defaultTheme="dark"` and empty storage next-themes resolves `theme` to
    // "dark", not "system" (verified — fresh load, empty storage, light OS),
    // and our UI exposes no System option to select. The branch is unreachable
    // today. It stops being unreachable the moment `defaultTheme` becomes
    // "system" or a System option is added.
    const next = resolvedTheme === "dark" ? "light" : "dark"

    const doc = document as ViewTransitionDocument
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (!doc.startViewTransition || prefersReducedMotion) {
      setTheme(next)
      return
    }

    const root = document.documentElement
    // Scoped to the swap, and removed after: without it every future
    // route-level view transition would inherit this timing.
    root.dataset.themeRevealing = "true"

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })

    transition.finished.finally(() => {
      delete root.dataset.themeRevealing
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="group relative h-9 w-9 cursor-pointer overflow-hidden"
      aria-label={t("toggleTheme")}
    >
      {/* Both icons are always in the DOM and CSS picks between them off the
          `.dark` class, which next-themes sets in a blocking script BEFORE
          first paint.
          This is the one defect the markup actually had: `useTheme()` returns
          `undefined` on the server and on the first client render, so the old
          `theme === "light" ? <Sun/> : <Moon/>` rendered the Moon regardless —
          a visible icon flip on hydration for every light-mode reader.

          The swap rides the page's cross-fade rather than running its own
          keyframes, which is the point: one animation for the whole change
          instead of the icon doing something separate from the page it belongs
          to. `group-hover` is the only motion this control owns — a small,
          instant-feeling nudge that is NOT suppressed on theme change because
          it is driven by hover, not by the class swap. */}
      <Sun className="size-[1.2rem] scale-100 rotate-0 transition-transform duration-200 ease-out group-hover:rotate-45 motion-reduce:transition-none dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-transform duration-200 ease-out group-hover:-rotate-12 motion-reduce:transition-none dark:scale-100 dark:rotate-0" />
    </Button>
  )
}
