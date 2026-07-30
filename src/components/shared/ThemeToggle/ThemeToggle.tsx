"use client"

import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import type { MouseEvent } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"

/**
 * Light/dark switch, with a circular reveal from the button itself.
 *
 * ── Why the previous cross-fade could never have worked ──────────────────────
 * `Providers.tsx` sets `disableTransitionOnChange`, so next-themes injects
 * `* { transition: none !important }` for the duration of the swap. Any CSS
 * transition on the icon — the rotate/scale pair here, or the framer-motion
 * animation before it — is killed by that rule. And the flag is correct: this
 * site is token-driven, so without it roughly 1,600 elements would each run
 * their own `transition-colors` at once and the whole page would smear through
 * an intermediate colour.
 *
 * The way out is not to animate 1,600 things better. It is to animate ONE
 * thing: the View Transitions API snapshots the old page, renders the new one,
 * and lets us wipe between them — a single composited animation, no per-element
 * transitions, so `disableTransitionOnChange` stays on and costs nothing.
 *
 * `flushSync` is required, not decorative: `startViewTransition` snapshots the
 * DOM when its callback returns, so the theme class has to be on `<html>` by
 * then. A normal `setTheme` would land after the snapshot and the wipe would
 * reveal the OLD theme.
 *
 * Degrades on its own terms: Firefox has no `startViewTransition`, and a
 * reduced-motion reader has asked not to see this — both take the plain
 * `setTheme` path, which is exactly the instant switch that shipped before.
 *
 * The one defect actually fixed in the markup: `useTheme()` returns `undefined`
 * on the server and on the first client render, so the old
 * `theme === "light" ? <Sun/> : <Moon/>` rendered the Moon regardless — a
 * visible icon flip on hydration for every light-mode reader. Both icons are in
 * the DOM now and CSS chooses, off a class that is set before first paint.
 */

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

export default function ThemeToggle() {
  const t = useTranslations("Common")
  const { resolvedTheme, setTheme } = useTheme()

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    // `resolvedTheme`, not `theme` — the value a binary toggle should read,
    // because `theme` can hold "system" while `resolvedTheme` is always the
    // scheme actually painted.
    //
    // HONEST SCOPE: this is correctness, not a bug fix. I first wrote that the
    // old `theme === "light"` made the first click do nothing, and then checked:
    // with `defaultTheme="dark"` and nothing in storage, next-themes resolves
    // `theme` to "dark", not "system" (verified — fresh load, empty storage,
    // light OS, `theme` → "dark"), and our UI exposes no System option for a
    // reader to select. So the "system" branch is unreachable here today. It
    // stops being unreachable the moment `defaultTheme` becomes "system" or a
    // System option is added, which is reason enough to read the right value.
    const next = resolvedTheme === "dark" ? "light" : "dark"

    const doc = document as ViewTransitionDocument
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (!doc.startViewTransition || prefersReducedMotion) {
      setTheme(next)
      return
    }

    // Anchor the circle on the button and size it to reach the furthest corner,
    // so the wipe always finishes covering the viewport instead of stopping
    // short on wide screens.
    const { top, left, width, height } =
      event.currentTarget.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const root = document.documentElement
    root.style.setProperty("--theme-reveal-x", `${x}px`)
    root.style.setProperty("--theme-reveal-y", `${y}px`)
    root.style.setProperty("--theme-reveal-r", `${radius}px`)
    root.dataset.themeRevealing = "true"

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })

    transition.finished.finally(() => {
      // Scoped to the switch: leaving the attribute on would make Next's own
      // route view-transitions inherit this circular wipe.
      delete root.dataset.themeRevealing
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative h-9 w-9 cursor-pointer overflow-hidden"
      aria-label={t("toggleTheme")}
    >
      {/* Both icons are always in the DOM and CSS picks between them off the
          `.dark` class, which next-themes sets in a blocking script BEFORE
          first paint. `useTheme()` returns `undefined` on the server and on the
          first client render, so branching on it in JSX rendered the Moon
          regardless — a visible flip on hydration for light-mode readers.
          They swap in place, so the button never reflows. */}
      <Sun className="size-[1.2rem] rotate-0 scale-100 transition-transform duration-300 ease-out motion-reduce:transition-none dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-transform duration-300 ease-out motion-reduce:transition-none dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
