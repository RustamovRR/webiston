/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: two constants
 * defined in this file, neither built from user input. */
import { Puzzle } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { EXTENSION_FEATURE_KEYS, EXTENSION_STORES } from "../constants"

/**
 * The extension, offered at the moment it makes sense.
 *
 * Placed BELOW the converter and above the alphabet table: someone who has
 * just pasted text in and copied the result is exactly the person who would
 * rather not come back to this page next time. Above the tool it would be an
 * ad in front of the thing they came for.
 *
 * A Server Component — three sentences and two links, so it costs the client
 * bundle nothing. `rel="noopener"` because they open in a new tab.
 *
 * BOTH stores render for everyone — that part is the SEO decision and it is
 * not negotiable (see `EXTENSION_STORES`). Which one LOOKS primary is a
 * separate question, and it is pure presentation: the visitor's own store is
 * filled and comes first.
 *
 * The two are separable because the swap happens in CSS, not in the markup.
 * The HTML always ships Chrome first with both links intact, so Googlebot —
 * which crawls as Chrome — sees exactly what it saw before; `order` moves the
 * boxes without moving the DOM. And it is a 90-byte inline script rather than
 * a client component: it runs while the parser is still above this section,
 * so there is no flash of the wrong emphasis and no hydration to pay for.
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
 * The emphasis swap. Written as CSS custom properties rather than Tailwind
 * classes because the condition lives on `<html>`, not on this subtree — and
 * every value is a design token, so §11 holds.
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

export async function ExtensionCallout({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "LatinCyrillicPage.extension"
  })

  return (
    <>
      {/* Before the card in source order, so it has already run by the time
          the parser reaches the buttons. */}
      <script dangerouslySetInnerHTML={{ __html: BROWSER_FLAG }} />
      <style>{STORE_EMPHASIS}</style>
      {/* No width or horizontal padding of its own: the route already wraps
          this section in the page container, and repeating it inset the card.
          The top margin is what separates it from the converter — without it
          the card reads as part of the tool rather than as an aside about it.

          Braces, not `//`: this used to sit directly under `return (`, where
          a JS comment is legal. Wrapping the tree in a fragment made it
          CHILDREN instead, and it rendered as visible text above the card. */}
      <section>
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Puzzle className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-base text-foreground">
              {t("title")}
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              {t("description")}
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {EXTENSION_FEATURE_KEYS.map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-1.5 text-muted-foreground text-xs"
                >
                  <span
                    className="size-1 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {t(`features.${key}`)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-muted-foreground text-xs">
              {t("storesNote")}
            </p>
          </div>

          {/* Wrapping row, not a stacked column: side by side on a wide card
            they cost no extra height, and on a phone the card is already a
            column so they fall onto their own line anyway.

            The classes below are the DEFAULT — Chrome filled, Firefox outline
            — which is what a Chromium browser and every crawler gets. On
            Firefox the `STORE_EMPHASIS` rules above invert it. Writing the
            default into the markup rather than leaving both neutral is what
            keeps the card correct for the majority with no script at all. */}
          <div className="flex shrink-0 flex-wrap gap-2">
            {EXTENSION_STORES.map((store, index) => (
              <a
                key={store.id}
                data-store={store.id}
                href={store.url}
                target="_blank"
                rel="noopener"
                className={
                  index === 0
                    ? "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
                    : "inline-flex h-10 items-center justify-center rounded-md border border-border px-4 font-medium text-foreground text-sm transition-colors hover:bg-accent"
                }
              >
                {t(`stores.${store.id}`)}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
