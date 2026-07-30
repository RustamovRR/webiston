"use client"

import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

/**
 * Light/dark switch. Two real defects fixed here, plus one dependency removed.
 *
 * 1. **The first click did nothing visible.** The handler read `theme`, but
 *    `ThemeProvider` runs with `enableSystem`, so `theme` is the literal string
 *    `"system"` until the reader chooses explicitly. `"system" === "light"` is
 *    false, so the handler set `"light"` — and for anyone whose OS is already
 *    light, that is the scheme they were already looking at. The page did not
 *    change; only the icon flipped, and it took a second click to do anything.
 *    `resolvedTheme` is the scheme actually applied, and it is what a toggle
 *    has to branch on.
 *
 * 2. **The icon was wrong before mount.** `useTheme()` returns `undefined` on
 *    the server and on the first client render, so `theme === "light" ? Sun :
 *    Moon` rendered the Moon regardless — a visible flip on hydration for
 *    light-mode readers. Both icons are now always in the DOM and CSS chooses
 *    between them off the `.dark` class that `next-themes` sets in its blocking
 *    script BEFORE first paint. No state, no hydration mismatch, nothing to
 *    flip.
 *
 * 3. **framer-motion is gone from the site header.** `AnimatePresence` +
 *    `motion.div` were animating a 20px icon on every route in the app. The
 *    same cross-fade is two `transition-transform` utilities.
 */
export default function ThemeToggle() {
  const t = useTranslations("Common")
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative h-9 w-9 cursor-pointer overflow-hidden"
      aria-label={t("toggleTheme")}
    >
      {/* Both icons occupy the same spot and swap by rotate+scale, so the
          button never reflows and there is no layout thrash mid-transition. */}
      <Sun className="size-[1.2rem] rotate-0 scale-100 transition-transform duration-300 ease-out motion-reduce:transition-none dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-transform duration-300 ease-out motion-reduce:transition-none dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
