/**
 * A promise wrapper over `browser.debugger`, plus the one rule that keeps the
 * yellow "…is debugging this browser" banner from being a permanent fixture.
 *
 * ATTACH LATE, DETACH ALWAYS. The banner is the price of the only API that can
 * render a whole document in one pass, and the user agreed to it for the two
 * seconds a capture takes — not for the rest of the session. Every path out of
 * `withDebugger`, including a throw, detaches.
 */

export type Target = { tabId: number }

/** The reasons an attach fails that a person can actually act on. */
export type AttachFailure = "already-attached" | "restricted-page" | "unknown"

export class CaptureError extends Error {
  constructor(
    readonly reason: AttachFailure | "capture-failed" | "no-tab",
    message: string
  ) {
    super(message)
    this.name = "CaptureError"
  }
}

const RESTRICTED =
  /^(chrome|edge|about|devtools|view-source|chrome-extension):|^https:\/\/chromewebstore\.google\.com|^https:\/\/microsoftedge\.microsoft\.com/

/**
 * Pages the debugger may not attach to, checked BEFORE attaching.
 *
 * Chrome's own error for these is "Cannot access a chrome:// URL", which tells
 * the user nothing about what to do. Recognising the URL first is what lets
 * the UI say "this page is protected by the browser" instead.
 */
export function isRestrictedUrl(url: string | undefined): boolean {
  return !url || RESTRICTED.test(url)
}

function lastError(): string | undefined {
  return browser.runtime.lastError?.message
}

export function attach(target: Target): Promise<void> {
  return new Promise((resolve, reject) => {
    // "1.3" is the protocol version, not the Chrome version — pinning it means
    // a browser update cannot silently change the shape of a reply.
    browser.debugger.attach(target, "1.3", () => {
      const error = lastError()
      if (!error) return resolve()
      // The message is the only signal Chrome gives for this case, and it is
      // the single most common failure in practice: DevTools is open.
      const reason: AttachFailure = /another debugger/i.test(error)
        ? "already-attached"
        : /cannot access|cannot attach/i.test(error)
          ? "restricted-page"
          : "unknown"
      reject(new CaptureError(reason, error))
    })
  })
}

export function detach(target: Target): Promise<void> {
  return new Promise((resolve) => {
    // Never rejects: detach failing (the tab closed mid-capture) must not mask
    // the real error that sent us here.
    browser.debugger.detach(target, () => {
      void lastError()
      resolve()
    })
  })
}

export function send<T = unknown>(
  target: Target,
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    browser.debugger.sendCommand(target, method, params, (result) => {
      const error = lastError()
      if (error)
        return reject(new CaptureError("capture-failed", `${method}: ${error}`))
      resolve(result as T)
    })
  })
}

/** Run `work` with the debugger attached, and detach no matter how it ends. */
export async function withDebugger<T>(
  target: Target,
  work: () => Promise<T>
): Promise<T> {
  await attach(target)
  try {
    return await work()
  } finally {
    await detach(target)
  }
}
