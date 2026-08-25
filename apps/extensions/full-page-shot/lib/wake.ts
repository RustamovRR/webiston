/**
 * The script that runs INSIDE the page before a capture.
 *
 * It wakes everything below the fold and does nothing else. Nothing is drawn
 * on the page: no cover, no card, no progress line.
 *
 * THAT IS THE DESIGN, and it took three wrong turns to get to. Anything this
 * script puts on screen is `position: fixed`, and a fixed box is composited
 * into a `captureBeyondViewport` image — so it has to leave the screen for
 * the shutter, and an indicator that blinks or blacks the page out is worse
 * than the honest thing every other tool does: let the page scroll. Progress
 * lives in the toolbar badge, which is browser chrome and can never end up in
 * the picture.
 *
 * WHY SCROLLING, and not a taller viewport. The first version of this
 * extension made the viewport as tall as the document, on the theory that a
 * viewport containing the whole page makes every `loading="lazy"` image and
 * every IntersectionObserver fire at once. It does — and it also silently
 * rewrites the page, because `vh` units resolve against the viewport.
 * Measured on a page with a `height: 100vh` hero: the hero went from 800px to
 * 2,414px and the document from 2,414px to 6,449px.
 *
 * Scrolling triggers exactly the same loading with no layout consequence at
 * all: same measurement after the scroll as before it. The one style this
 * script writes is `scroll-behavior`, and it puts that back.
 */

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
}

/**
 * A page this close to fitting on one screen has nothing below the fold worth
 * waking: everything is already inside Chrome's own lazy-loading distance
 * (~1,250px for images on a fast connection). Walking it anyway would scroll
 * the page a few hundred pixels and back for no gain.
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
 * Images that arrive change layout, and the reflow has to finish before the
 * shutter — a page that reserved no space for its images grows here, and
 * measuring before the reflow cuts the footer off.
 */
const REFLOW_SETTLE_MS = 200

/**
 * Nothing in the injected string may contain a backtick: it is built from a
 * template literal, and one inside a CSS comment terminates it.
 */
export const WAKE_SCRIPT = () => `(async () => {
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
   * a complete picture of the visible area plus a viewer that says why — not
   * a layout mutated until it photographs well.
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
  const prevBehavior = doc.style.getPropertyValue("scroll-behavior")
  const prevPriority = doc.style.getPropertyPriority("scroll-behavior")
  doc.style.setProperty("scroll-behavior", "auto", "important")
  const jump = (y) => {
    if (panel) panel.scrollTop = y
    else window.scrollTo({ top: y, left: 0, behavior: "instant" })
  }

  let steps = 0
  try {
    // 1. Walk, re-reading the height every step so a document that GROWS
    //    while its content loads is walked to its real end. 90% of a viewport
    //    per step keeps a sliver of overlap, so nothing sits exactly on a
    //    boundary and gets skipped.
    let total = totalOf()
    if (total > viewOf() + ${WALK_THRESHOLD_PX}) {
      const step = Math.max(200, viewOf() * 0.9)
      for (let y = 0; y < total && steps < ${MAX_STEPS}; y += step) {
        jump(y)
        steps++
        await beat()
        total = Math.max(total, totalOf())
      }
      jump(total)
      await beat()
    }

    // 2. Wait for what the walk started, on a hard deadline.
    const images = () => [...document.images]
    const pendingNow = () => images().filter((i) => !i.complete).length
    const deadline = Date.now() + ${IMAGE_DEADLINE_MS}
    while (pendingNow() > 0 && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 100))
    }

    // 3. Let the arrivals reflow before anything is measured.
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

    return {
      pending: pendingNow(),
      scrolledPx: totalOf(),
      steps,
      startedAt: panel ? 0 : startedAt,
      innerScroll: !!panel,
      dpr: window.devicePixelRatio || 1,
      viewport: window.innerHeight
    }
  } finally {
    // The page's own scroll behaviour goes back either way — we borrowed it.
    if (prevBehavior) {
      doc.style.setProperty("scroll-behavior", prevBehavior, prevPriority)
    } else {
      doc.style.removeProperty("scroll-behavior")
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
