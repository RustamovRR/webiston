/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: one constant
 * defined in this file, built from nothing but literals. */
import { EXTENSION_STORES } from "@/constants/extension"

/**
 * The two store buttons, and the one piece of cleverness behind them.
 *
 * Extracted at the second consumer — the converter page's callout and
 * `/extension` — because the DETECTION is the part that would rot if it were
 * copied. The markup around it is small enough that duplicating it would have
 * been fine; a Firefox rule that gets fixed in one file and not the other
 * would not be.
 *
 * A Server Component: two links and a static string, so it costs the client
 * bundle nothing and Googlebot sees the finished HTML.
 */

/**
 * Firefox is the only engine here that needs naming: everything else that can
 * install this extension — Chrome, Edge, Brave, Opera, Vivaldi — installs it
 * from the Chrome Web Store, which is the default state. `Firefox/<digit>`
 * also matches the forks (LibreWolf, Waterfox) and correctly MISSES Firefox
 * on iOS (`FxiOS`), which cannot install add-ons at all.
 */
const BROWSER_FLAG = `try{if(/\\bFirefox\\/\\d/.test(navigator.userAgent))document.documentElement.dataset.browser="firefox"}catch(e){}`

/**
 * The emphasis swap, in CSS rather than in the markup.
 *
 * No user-agent sniffing on the server and none in the tree: the HTML always
 * ships Chrome first with both links intact, so Googlebot — which crawls as
 * Chrome — sees exactly what a Chrome user sees, and `order` moves the boxes
 * for a Firefox visitor without moving the DOM. Custom properties rather than
 * Tailwind classes because the condition lives on `<html>`, not on this
 * subtree; every value is a design token, so §11 holds.
 */
const STORE_EMPHASIS = `
  [data-store]{order:2}
  [data-store="chrome"]{order:1}
  :root[data-browser="firefox"] [data-store="chrome"]{
    order:2;background:transparent;color:var(--foreground);
    border:1px solid var(--border);
  }
  :root[data-browser="firefox"] [data-store="chrome"]:hover{background:var(--accent)}
  :root[data-browser="firefox"] [data-store="firefox"]{
    order:1;border:0;background:var(--primary);color:var(--primary-foreground);
  }
  :root[data-browser="firefox"] [data-store="firefox"]:hover{
    background:color-mix(in oklab, var(--primary) 90%, transparent);
  }
`

/** A card aside wants a control-sized button; a landing page wants a CTA. */
const SIZE = {
  sm: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base"
} as const

interface ExtensionStoresProps {
  /** Store id → button label. The caller owns the words. */
  labels: Record<string, string>
  size?: keyof typeof SIZE
  className?: string
}

export function ExtensionStores({
  labels,
  size = "sm",
  className = "flex shrink-0 flex-wrap gap-2"
}: ExtensionStoresProps) {
  return (
    <>
      {/* Before the buttons in source order, so the flag is already set by the
          time the parser reaches them — no flash of the wrong emphasis. */}
      <script dangerouslySetInnerHTML={{ __html: BROWSER_FLAG }} />
      <style>{STORE_EMPHASIS}</style>
      <div className={className}>
        {EXTENSION_STORES.map((store, index) => (
          <a
            key={store.id}
            data-store={store.id}
            href={store.url}
            target="_blank"
            rel="noopener"
            className={
              // The DEFAULT — Chrome filled, Firefox outline — is what a
              // Chromium browser and every crawler gets with no script at all.
              index === 0
                ? `inline-flex items-center justify-center rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${SIZE[size]}`
                : `inline-flex items-center justify-center rounded-md border border-border font-medium text-foreground transition-colors hover:bg-accent ${SIZE[size]}`
            }
          >
            {labels[store.id]}
          </a>
        ))}
      </div>
    </>
  )
}
