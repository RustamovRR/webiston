"use client"

import { useTheme } from "next-themes"
/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: one constant
 * defined in this file, built from nothing but literals. */
import { useSyncExternalStore } from "react"

/**
 * The landing hero: one photograph of the product, in the visitor's theme.
 *
 * WHY ONE <img> AND NOT A LIGHT/DARK PAIR — measured on a throttled 4 Mbps
 * line. A pair with both lazy fetches only the visible one but lands the LCP
 * at 3.2s; `priority` on the dark one brings dark visitors to 1.3s and pushes
 * light visitors to 3.5s, because the preload fetches an image they never
 * see. The theme is a CLASS next-themes sets before first paint, not a media
 * query, so <picture> cannot choose either. One image, its src chosen on the
 * client — measured on a PRODUCTION build over the same line: 1.27s in both
 * themes, one fetch each. (Dev-mode numbers swing by a second either way, as
 * 1.5 MB of unminified React and devtools fight the image for bandwidth.)
 *
 * WHY A CLIENT COMPONENT, and not just the inline script it also carries.
 * The script is what makes the FIRST paint fast: the HTML ships no `src` (so
 * the preload scanner has nothing to fetch on its own) and the script right
 * after the tag picks one while the parser is still there. But an inline
 * script only runs when the PARSER meets it. A client-side navigation — the
 * language switcher is `router.replace` — re-mounts this subtree with a fresh
 * <img> and a <script> React created, which the browser does not execute.
 * Measured: switch uz → en and the hero was a broken image until reload.
 * `resolvedTheme` covers every render after that first one, and toggling the
 * theme re-renders `src` — the other file downloads only then.
 *
 * `next/image` is not used because it needs the src at render time, and this
 * one does not exist until the browser has decided the theme.
 */

/** A store that never changes: `useSyncExternalStore` still needs one. */
const subscribeToNothing = () => () => {}

/** Picks the src from the theme class, once, before first paint. */
const FIRST_PAINT = `(function(){var i=document.currentScript.previousElementSibling;i.src=document.documentElement.classList.contains("dark")?i.dataset.dark:i.dataset.light})()`

interface ExtensionHeroProps {
  light: string
  dark: string
  alt: string
  width: number
  height: number
}

export function ExtensionHero({
  light,
  dark,
  alt,
  width,
  height
}: ExtensionHeroProps) {
  // "Is this the server render, or the hydration of it?" — asked the way
  // React means it to be asked. The server snapshot is what SSR renders AND
  // what the hydration render uses, so the two match: script present, no
  // src. React then re-renders with the client snapshot and the theme takes
  // over. A fresh mount on a client navigation gets the client snapshot at
  // once — no script is ever created for the browser to ignore, and the src
  // is right on the first render. (A `mounted` flag from useEffect would do
  // the first half but not the second: it starts false on every mount.)
  const hydrating = useSyncExternalStore(
    subscribeToNothing,
    () => false,
    () => true
  )
  const { resolvedTheme } = useTheme()
  const src = hydrating ? undefined : resolvedTheme === "dark" ? dark : light

  return (
    <figure className="mt-10 overflow-hidden rounded-lg border border-border bg-card">
      {/* biome-ignore lint/performance/noImgElement: the src is chosen client-side from the theme, see above */}
      <img
        src={src}
        data-light={light}
        data-dark={dark}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="block w-full"
        // The parser-run script put `src` on the DOM node before React saw
        // it; React's first render has none. That is the one mismatch here
        // and it is intended.
        suppressHydrationWarning
      />
      {hydrating && (
        <script dangerouslySetInnerHTML={{ __html: FIRST_PAINT }} />
      )}
    </figure>
  )
}
