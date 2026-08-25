/**
 * The literal colours this extension cannot express as tokens, in one place.
 *
 * The §11 rule is that components use semantic tokens and never raw hex. Both
 * exceptions here are real, and both are the same shape: the surface is not
 * ours.
 *
 * 1. THE BADGE. `browser.action.setBadgeBackgroundColor` takes a colour value
 *    over an extension API. There is no stylesheet in that path and no
 *    custom property to resolve — a hex is the only thing the API accepts.
 *
 * 2. THE IN-PAGE OVERLAY AND TOAST. These render inside somebody else's
 *    document, where our tokens do not exist and the page's own CSS is
 *    hostile by default. They are deliberately self-contained: fixed values,
 *    a closed shadow root, and `all:initial` on the host.
 *
 * The values track the site's brand so the extension and webiston.uz read as
 * one product — `--primary` and `--destructive` at their dark-scheme values,
 * because the overlay is always dark.
 */

export const BADGE = {
  /** `--brand-700`, the site's `--primary` in light mode. */
  working: "#1e5a8a",
  /** The accent palette's `qizil`, matching `--destructive`. */
  error: "#7f1d1d"
} as const

export const OVERLAY = {
  /** Near-black, not pure: pure black on a white page reads as a hole. */
  background: "#111111",
  foreground: "#ffffff",
  /** `--brand-400`, the site's `--primary` in dark mode. */
  accent: "#4cc4e0",
  shadow: "0 8px 30px rgba(0,0,0,.35)"
} as const

/**
 * JPEG has no alpha channel. Without a matte painted first, every transparent
 * region of a captured PNG comes out BLACK — which on a page with no declared
 * background is the whole image.
 */
export const JPEG_MATTE = "#ffffff"
