import { type CaptureResult, captureFullPage } from "../lib/capture"
import { CaptureError, detach, isRestrictedUrl } from "../lib/cdp"
import { BADGE, OVERLAY } from "../lib/paint"

/**
 * The service worker: one capture at a time, held in memory, handed to a
 * viewer tab.
 *
 * The result is NOT put in `chrome.storage`. A full-page PNG of a long article
 * runs to several megabytes as a data URL, `storage.local` defaults to a 10 MB
 * quota, and a screenshot is not something anyone wants persisted to disk by a
 * tool whose entire pitch is that the image never leaves the browser. It lives
 * in a Map until the viewer asks for it, and then it is dropped.
 */

interface Pending extends CaptureResult {
  title: string
}

const results = new Map<string, Pending>()

/** A capture the viewer never collected is a leak; the SW may also be killed
 *  first, which the viewer already treats as "expired". */
const RESULT_TTL_MS = 5 * 60 * 1000

let busy = false

/**
 * WXT generates a union of the real message keys from `public/_locales`, so
 * taking that type rather than `string` turns a typo into a compile error
 * instead of a blank button. `tests/locales.test.ts` covers what types cannot:
 * that all three bundles agree and no message is empty.
 */
type MessageKey = Parameters<typeof browser.i18n.getMessage>[0]

function i18n(key: MessageKey, ...substitutions: string[]): string {
  return browser.i18n.getMessage(key, substitutions) || key
}

/** Badge feedback, because a capture takes a second or two and a toolbar icon
 *  that does nothing reads as broken. */
async function badge(
  text: string,
  color: string = BADGE.working
): Promise<void> {
  await browser.action.setBadgeText({ text })
  await browser.action.setBadgeBackgroundColor({ color })
}

function messageFor(error: unknown): string {
  if (error instanceof CaptureError) {
    switch (error.reason) {
      case "already-attached":
        return i18n("errDevtoolsOpen")
      case "restricted-page":
        return i18n("errRestricted")
      case "no-tab":
        return i18n("errNoTab")
      default:
        return i18n("errGeneric")
    }
  }
  return i18n("errGeneric")
}

/**
 * Tell the user what went wrong ON the page they were looking at.
 *
 * A notification would need another permission; the viewer tab would be an
 * empty window with an error in it. A one-shot injected toast is the smallest
 * thing that puts the message where the eye already is — and it uses the
 * `activeTab` grant the click just produced, so it needs no host permission.
 */
async function toast(tabId: number, text: string): Promise<void> {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: (message: string, palette: typeof OVERLAY) => {
        const node = document.createElement("div")
        node.textContent = message
        node.style.cssText = [
          "position:fixed",
          "z-index:2147483647",
          "top:16px",
          "left:50%",
          "transform:translateX(-50%)",
          "max-width:min(90vw,420px)",
          "padding:12px 16px",
          "border-radius:10px",
          `background:${palette.background}`,
          `color:${palette.foreground}`,
          "font:14px/1.45 system-ui,sans-serif",
          `box-shadow:${palette.shadow}`
        ].join(";")
        document.documentElement.append(node)
        setTimeout(() => node.remove(), 5000)
      },
      args: [text, OVERLAY]
    })
  } catch {
    // The page forbids injection (a strict CSP, or it closed). The badge
    // already said something went wrong; there is nowhere better to put it.
  }
}

async function run(tab: Browser.tabs.Tab): Promise<void> {
  if (busy) return
  if (typeof tab.id !== "number") return

  if (isRestrictedUrl(tab.url)) {
    await badge("!", BADGE.error)
    setTimeout(() => void badge(""), 3000)
    return
  }

  busy = true
  await badge("…")
  try {
    // Always PNG: it is lossless, and the viewer derives a JPEG on demand.
    // Capturing twice through the debugger to offer a second format would
    // double the time the banner is on screen for no gain.
    const result = await captureFullPage(tab.id, {
      format: "png",
      // The overlay lives in the page, so its copy has to travel there.
      labels: { waking: i18n("progWaking"), loading: i18n("progLoading") },
      /**
       * The badge, NOT the overlay, carries the capture phase — a badge is
       * browser chrome and cannot end up inside the screenshot, and by this
       * point the overlay has already removed itself for that exact reason.
       * "2/5" is a real tile count, not a timer pretending to be progress.
       */
      onProgress: (progress) => {
        if (
          progress.phase === "capturing" &&
          progress.tiles &&
          progress.tiles > 1
        ) {
          void badge(`${progress.tile}/${progress.tiles}`)
        } else if (progress.phase === "stitching") {
          void badge("↓")
        }
      }
    })

    const id = crypto.randomUUID()
    results.set(id, { ...result, title: tab.title ?? "screenshot" })
    setTimeout(() => results.delete(id), RESULT_TTL_MS)

    await browser.tabs.create({
      url: browser.runtime.getURL(`/viewer.html?id=${id}`),
      index: tab.index + 1
    })
    await badge("")
  } catch (error) {
    await badge("!", BADGE.error)
    setTimeout(() => void badge(""), 3000)
    await toast(tab.id, messageFor(error))
  } finally {
    busy = false
  }
}

/**
 * Registered INSIDE `defineBackground`. WXT imports this module at build time
 * against a fake browser to read the entrypoint's options, and a listener at
 * module scope runs during that import — `commands.onCommand` is not
 * implemented there, so `wxt prepare` fails outright. This is not a style
 * preference; it is the only shape that builds.
 */
export default defineBackground(() => {
  /**
   * A service worker can be terminated mid-capture, and an attachment it was
   * holding survives that — leaving the yellow banner on a tab with nothing
   * behind it and no way for the user to dismiss it. Chrome does not clean
   * this up on restart, so the worker does it itself on every startup.
   */
  void browser.debugger.getTargets().then((targets) => {
    for (const target of targets) {
      if (target.attached && target.tabId !== undefined) {
        void detach({ tabId: target.tabId })
      }
    }
  })

  browser.action.onClicked.addListener((tab) => void run(tab))

  browser.commands.onCommand.addListener((command) => {
    if (command !== "capture-full-page") return
    void browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => tab && run(tab))
  })

  /** The viewer asks for its image once and the worker forgets it. */
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "take-result") return false
    const result = results.get(message.id)
    results.delete(message.id)
    sendResponse(result ?? null)
    return true
  })
})
