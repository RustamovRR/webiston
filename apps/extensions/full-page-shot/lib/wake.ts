/**
 * The script that runs INSIDE the page before a capture.
 *
 * It does two jobs that have to happen together: wake everything below the
 * fold, and keep the page LOOKING still while it does.
 *
 * WHY SCROLLING, and not a taller viewport. The first version of this
 * extension made the viewport as tall as the document, on the theory that a
 * viewport containing the whole page makes every `loading="lazy"` image and
 * every IntersectionObserver fire at once. It does — and it also silently
 * rewrites the page, because `vh` units resolve against the viewport.
 * Measured on a page with a `height: 100vh` hero: the hero went from 800px to
 * 2,414px and the document from 2,414px to 6,449px. Every modern site with a
 * full-screen section would have been captured wrong, which is a worse defect
 * than the blank bands the change was meant to fix.
 *
 * Scrolling triggers exactly the same loading with no layout consequence at
 * all: same measurement after the scroll as before it. Nothing in this file
 * changes a single computed style on the page — see `findScroller`.
 */

import { OVERLAY } from "./paint"

export interface WakeReport {
  /** Images still not `complete` when the deadline passed. 0 is the good case. */
  pending: number
  scrolledPx: number
  /** How many scroll steps the walk took. 0 means the page fit on one screen. */
  steps: number
  /**
   * The WINDOW offset the caller must put back after the shutter — see step 4.
   * Always 0 when `innerScroll` is set, because the window never moved.
   */
  startedAt: number
  /**
   * The document does not scroll; a panel inside it does. The capture can only
   * be the visible area, and the viewer says so.
   */
  innerScroll: boolean
  /**
   * `window.devicePixelRatio`. Every ceiling in `limits.ts` is a DEVICE-pixel
   * ceiling and the renderer applies this ratio on its own, so the plan is
   * wrong by exactly this factor without it — on a Retina display, by 2x.
   */
  dpr: number
  /**
   * `innerHeight`. The plan needs it because a clip that starts at 0 AND
   * reaches the document end renders its final viewport wrong — see
   * `planCapture`.
   */
  viewport: number
  /**
   * A cover is on screen and will be in the top viewport of the picture, so
   * the caller owes the image a patch. False on a short page, which is walked
   * and covered by nothing.
   */
  covered: boolean
}

/**
 * A page this close to fitting on one screen has nothing below the fold worth
 * waking: everything is already inside Chrome's own lazy-loading distance
 * (~1,250px for images on a fast connection). Walking it anyway would scroll
 * the page a few hundred pixels and back for no gain, which is the one thing
 * the user actually SEES this script do. The most common capture — a short
 * page — is therefore completely still, and shows no overlay either.
 */
const WALK_THRESHOLD_PX = 200

/**
 * A ceiling on the walk, because `scrollHeight` is re-read every step.
 *
 * Re-reading is what makes a page that GROWS as its content loads come out
 * whole — but an infinite-scroll feed grows forever, and without this the
 * loop would too. 60 steps is roughly 45,000px at a laptop viewport, past the
 * point where a single image can hold the result anyway.
 */
const MAX_STEPS = 60

/** Longest a single step will wait for a frame before moving on. Frames stop
 *  arriving in a background tab; a step that waits on one would hang. */
const STEP_CAP_MS = 80

/** Images have this long to arrive before the screenshot goes ahead without
 *  them. One tracking pixel that never resolves must not cost the capture. */
const IMAGE_DEADLINE_MS = 4000

/**
 * Images that arrive change layout, and the reflow has to finish while the
 * page is still covered — otherwise the visitor watches it happen. This used
 * to sit in `capture.ts`, after the cover came off.
 */
const REFLOW_SETTLE_MS = 200

/**
 * How long the cover takes to dissolve back into the page.
 *
 * It goes ON instantly and comes OFF gently, which is deliberate and not
 * symmetry for its own sake: the first scroll step happens immediately, so a
 * fade-IN would show the first few jumps through a half-transparent cover.
 * There is nothing to hide on the way out.
 *
 * The wake AWAITS this before it resolves, so the overlay is out of the DOM
 * before the shutter — a cover caught at 20% opacity would be composited into
 * the screenshot, which is the one artefact this file exists to prevent.
 */
const FADE_OUT_MS = 160

/** The whole indicator: a four-pixel line across the top of the viewport. */
const BAR_PX = 4

/**
 * How much of the image has to be re-taken to remove the bar from it.
 *
 * The bar is 4 CSS px at the very top, so 8 covers it with room for the
 * device-pixel rounding. It used to be a whole viewport, because the
 * indicator used to be a cover.
 */
export const BAR_PATCH_PX = 8

/** The overlay's own dead-man switch. Comfortably longer than the slowest
 *  real capture (walk + image deadline), so it never fires in normal use. */
const WATCHDOG_MS = 15_000

/**
 * The share of the bar the wake is allowed to fill.
 *
 * Reported by the owner and correct: a bar that reaches 100%, disappears, and
 * is then followed by several more seconds of work is the worst progress
 * pattern there is — it says "done" and then makes you wait. The shutter and
 * the assembly are the other 40%, and the caller drives them through the
 * control object below.
 */
const WAKE_SPAN = 0.6

/** The page-side handle the capture keeps hold of. Namespaced, and deleted
 *  when the overlay goes. */
const CONTROL = "__webiston_shot_control__"

/** Drive the overlay from outside the page. `hide` for the shutter — a
 *  `position: fixed` overlay would otherwise be composited INTO the image. */
export const SHOT_CONTROL = {
  hide: `window.${CONTROL}?.hide()`,
  show: `window.${CONTROL}?.show()`,
  abort: `window.${CONTROL}?.abort()`,
  done: `window.${CONTROL}?.done()`,
  set: (ratio: number) => `window.${CONTROL}?.set(${ratio})`
} as const

/**
 * THE PROGRESS BAR, and why it is only a bar.
 *
 * This started as a pill, became an opaque cover over the whole page, and the
 * owner was right to reject both. The cover hid the scroll, but a cover has
 * to leave the screen for the shutter — a `position: fixed` box is composited
 * into a `captureBeyondViewport` image — so it blinked, and a full-page
 * black-out that blinks is far uglier than a page that simply scrolls.
 *
 * So: the page scrolls, visibly, the way every other tool does it, and the
 * only thing on screen is a four-pixel line across the top. It never covers
 * anything, so it never has to be gone for long, and the patch that removes
 * it from the picture is eight pixels tall instead of a whole viewport.
 *
 * No label and no card on purpose. The moving page is what tells you it is
 * working; the line is what tells you how far along it is.
 *
 * The host is sized in PIXELS rather than pinned to insets:
 * `captureBeyondViewport` renders with the viewport blown up to the whole
 * clip, and `inset: 0` would grow with it.
 *
 * Nothing in the injected string may contain a backtick: it is built from a
 * template literal, and one inside a CSS comment terminates it.
 */
export const WAKE_SCRIPT = () => `(async () => {
  const HOST_ID = "__webiston_shot_progress__"
  document.getElementById(HOST_ID)?.remove()

  const doc = document.documentElement
  const startedAt = window.scrollY

  /**
   * Which box actually scrolls.
   *
   * Gmail, Slack, most dashboards and plenty of admin panels put
   * \`overflow: hidden\` on the document and scroll an inner element instead.
   * Measured on a purpose-built page of that shape: the document reported
   * 1200x800 — the viewport — 36 of 40 images never started loading, and the
   * capture then spent the whole 4-second image deadline waiting for images
   * that were never going to arrive.
   *
   * Walking the panel fixes the waiting and the loading. It does NOT make the
   * capture taller: \`captureBeyondViewport\` renders the DOCUMENT, and the
   * panel's overflow is clipped out of it by definition. The honest answer is
   * a complete, correct picture of the visible area plus a viewer that says
   * why — not a layout mutated until it photographs well. Forcing
   * \`overflow: visible\` on somebody's app shell is exactly the class of
   * change that produced the vh disaster above.
   */
  const findScroller = () => {
    if (doc.scrollHeight > window.innerHeight + ${WALK_THRESHOLD_PX}) return null
    let best = null
    for (const node of document.querySelectorAll("body *")) {
      if (node.scrollHeight <= node.clientHeight + ${WALK_THRESHOLD_PX}) continue
      const overflow = getComputedStyle(node).overflowY
      if (overflow !== "auto" && overflow !== "scroll") continue
      if (!best || node.scrollHeight > best.scrollHeight) best = node
    }
    return best
  }
  const panel = findScroller()

  const totalOf = () => (panel ? panel.scrollHeight : doc.scrollHeight)
  const viewOf = () => (panel ? panel.clientHeight : window.innerHeight)
  const posOf = () => (panel ? panel.scrollTop : window.scrollY)

  let host = null
  let paint = () => {}
  let show = () => {}
  const mountOverlay = () => {
    host = document.createElement("div")
    host.id = HOST_ID
    host.style.cssText =
      "all:initial;position:fixed;top:0;left:0;width:100%;height:" +
      ${BAR_PX} +
      "px;z-index:2147483647;pointer-events:none"
    const root = host.attachShadow({ mode: "closed" })
    root.innerHTML =
      '<style>.f{position:absolute;left:0;top:0;bottom:0;width:0%;' +
      'background:${OVERLAY.accent};transition:width .2s ease}</style>' +
      '<div class="f"></div>'
    document.documentElement.append(host)
    // Belt: whatever happens to the promise below, this line takes itself
    // down. A four-pixel bar left behind is small, but it is still ours.
    setTimeout(() => host?.remove(), ${WATCHDOG_MS})
    const fill = root.querySelector(".f")
    paint = (ratio) => {
      fill.style.width =
        Math.round(Math.max(0, Math.min(1, ratio)) * 100) + "%"
    }
    show = (ratio) => paint(ratio * ${WAKE_SPAN})
  }

  const drop = () => {
    host?.remove()
    host = null
    delete window[${JSON.stringify(CONTROL)}]
  }

  // Frame-synced, but never longer than a fixed cap: rAF stops being delivered
  // in a background tab, and a step waiting on a frame that never comes would
  // hang the capture instead of finishing it.
  const beat = () =>
    Promise.race([
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      new Promise((r) => setTimeout(r, ${STEP_CAP_MS}))
    ])

  // MEASURED: on a page with \`scroll-behavior: smooth\` the plain scrollTo
  // animates, each step interrupts the last, the walk never reaches the
  // bottom and the restore never lands — 2 of 8 IntersectionObserver reveals
  // stayed hidden and the visitor was left 2,970px down their own page.
  // \`behavior:"instant"\` overrides it per call; the !important property is
  // the belt for pages that declare it !important themselves.
  const prevBehavior = doc.style.getPropertyValue("scroll-behavior")
  const prevPriority = doc.style.getPropertyPriority("scroll-behavior")
  doc.style.setProperty("scroll-behavior", "auto", "important")
  const jump = (y) => {
    if (panel) panel.scrollTop = y
    else window.scrollTo({ top: y, left: 0, behavior: "instant" })
  }

  let steps = 0
  let ok = false
  try {
    // 1. Walk, re-reading the height every step so a document that GROWS
    //    while its content loads is walked to its real end. 90% of a viewport
    //    per step keeps a sliver of overlap, so nothing sits exactly on a
    //    boundary and gets skipped.
    let total = totalOf()
    if (total > viewOf() + ${WALK_THRESHOLD_PX}) {
      mountOverlay()
      const step = Math.max(200, viewOf() * 0.9)
      for (let y = 0; y < total && steps < ${MAX_STEPS}; y += step) {
        jump(y)
        steps++
        show(y / total)
        await beat()
        total = Math.max(total, totalOf())
      }
      jump(total)
      await beat()
    }

    // 2. Wait for what the walk started, on a hard deadline.
    const images = () => [...document.images]
    const pendingNow = () => images().filter((i) => !i.complete).length
    const totalImages = images().length
    const deadline = Date.now() + ${IMAGE_DEADLINE_MS}
    while (pendingNow() > 0 && Date.now() < deadline) {
      show(totalImages ? (totalImages - pendingNow()) / totalImages : 1)
      await new Promise((r) => setTimeout(r, 100))
    }

    // 3. Let the arrivals reflow BEFORE the cover comes off. A page that
    //    reserved no space for its images grows here, and doing this after
    //    the overlay is gone would put the growth on screen.
    await new Promise((r) => setTimeout(r, ${REFLOW_SETTLE_MS}))

    // 4. Finish at the TOP — not where the visitor was.
    //
    //    MEASURED on webiston.uz: \`captureBeyondViewport\` paints
    //    \`position: fixed\` and \`sticky\` boxes at the CURRENT scroll offset,
    //    not at the document origin. Ending the wake at the visitor's offset
    //    therefore bakes it in: clicking 400px down produced a full-page image
    //    with the site header and both sidebars stranded 400px from the top
    //    and nothing above them. The visitor's position is handed back in the
    //    report and restored by the caller AFTER the shutter.
    //
    //    A PANEL is the opposite case: the window never moved, so there is
    //    nothing for the caller to restore, and the capture is the visible
    //    area — which should show what the visitor was actually looking at.
    jump(panel ? startedAt : 0)
    await beat()

    ok = true
    return {
      pending: pendingNow(),
      scrolledPx: totalOf(),
      steps,
      startedAt: panel ? 0 : startedAt,
      innerScroll: !!panel,
      dpr: window.devicePixelRatio || 1,
      viewport: window.innerHeight,
      covered: !!host
    }
  } finally {
    // The page's own scroll behaviour goes back either way — we borrowed it.
    if (prevBehavior) {
      doc.style.setProperty("scroll-behavior", prevBehavior, prevPriority)
    } else {
      doc.style.removeProperty("scroll-behavior")
    }
    if (!ok) {
      drop()
    } else if (host) {
      // The overlay STAYS. The capture is not over — the shutter and the
      // assembly are still to come, and the visitor should watch one
      // operation finish rather than be told it already did. The caller hides
      // it for the shutter (a fixed box would be composited into the image),
      // shows it again for the assembly, and calls \`done\` at the end.
      window[${JSON.stringify(CONTROL)}] = {
        hide() { if (host) host.style.display = "none" },
        show() { if (host) host.style.display = "" },
        set(ratio) { paint(ratio) },
        abort() { drop() },
        async done() {
          if (host) {
            host.style.display = ""
            paint(1)
            // A beat at 100% so the line is seen to finish rather than to
            // disappear at 90-something.
            await new Promise((r) => setTimeout(r, ${FADE_OUT_MS}))
          }
          drop()
        }
      }
    }
  }
})()`

/**
 * Move the page, from outside it.
 *
 * Used twice, and both uses are about step 4 above: once with 0 as a belt in
 * case the wake threw before it could get there, and once with the visitor's
 * own offset AFTER the shutter has closed. Deliberately tiny and total — if
 * the tab navigated away in the meantime there is nothing to move and nothing
 * to report.
 */
export const SCROLL_TO = (y: number) =>
  `window.scrollTo({ top: ${Math.max(0, Math.round(y))}, left: 0, behavior: "instant" })`
