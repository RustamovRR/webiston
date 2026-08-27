/**
 * The Lotin-Kirill O'giruvchi browser extension: where it lives and what it
 * claims.
 *
 * Promoted here from `modules/tools/LatinCyrillic/constants` at its SECOND
 * consumer, exactly as that file said it would be: the converter page's
 * callout was the first, `/kengaytma` is the second. §14.
 */

/**
 * Where the extension is published — two stores, not one.
 *
 * A LIST rather than the single URL it used to be, and both entries render on
 * the server for every visitor. No user-agent sniffing, deliberately:
 *
 * - These are the site's biggest search pages. A link injected after
 *   client-side detection is a link Googlebot — which crawls as Chrome —
 *   never sees, so the Firefox listing would get no signal at all.
 * - Detecting on the SERVER means reading `headers()`, which opts the page
 *   out of static rendering. That is a real cost to solve a labelling problem.
 * - The Chrome Web Store also serves Edge, Brave, Opera and Vivaldi, so the
 *   store is the honest unit here, not the browser. Sniffing for "Chrome"
 *   would mislabel four browsers that install from it perfectly well.
 * - Links get shared, and people use one browser at work and another at home.
 */
export const EXTENSION_STORES = [
  {
    id: "chrome",
    url: "https://chromewebstore.google.com/detail/lotin-kirill-ogiruvchi-%E2%80%94/inbahpclopinhpfodmfnambafebgopbp"
  },
  {
    id: "firefox",
    url: "https://addons.mozilla.org/en-US/firefox/addon/lotin-kirill-ogiruvchi/"
  }
] as const

/** The three claims. Each is something the extension actually does. */
export const EXTENSION_FEATURE_KEYS = ["select", "shortcut", "privacy"] as const

/** The landing page's own sections, rendered in this order. */
export const EXTENSION_STEP_KEYS = ["install", "select", "convert"] as const

export const EXTENSION_FAQ_KEYS = [
  "price",
  "browsers",
  "offline",
  "privacy",
  "files"
] as const

/**
 * The sentence the landing page converts, live, at build time.
 *
 * Chosen for the hard cases rather than for the meaning: `oʻ` and `gʻ` (the
 * two letters a naive table gets wrong), the digraphs `sh` and `ch`, and a
 * proper noun that must keep its capital through the round trip.
 */
export const EXTENSION_DEMO_SENTENCE =
  "Toshkent shahridagi bogʻlar va togʻ manzaralari — juda chiroyli."

/** The converter this extension is the installable half of. */
export const EXTENSION_TOOL_PATH = "/tools/latin-cyrillic"
