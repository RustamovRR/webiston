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
  set: (label: string, ratio: number) =>
    `window.${CONTROL}?.set(${JSON.stringify(label)}, ${ratio})`
} as const

/**
 * THE OVERLAY, and why it is opaque.
 *
 * The walk moves the page a viewport at a time. Reported by the owner and
 * true: jump-cut content reads as a glitch, and no amount of "but it is fast"
 * changes that — 50 steps is 50 visible jumps. Smoothing them out is not an
 * option either, because smooth means slow: a 36,000px page at a legible
 * scroll speed would take several seconds.
 *
 * So the page is not made to move nicely; it is made not to be seen moving.
 * The scrim takes the PAGE'S OWN background colour, fully opaque — so what
 * the visitor sees is their own page going momentarily blank with a progress
 * card on it, not a black panel flashing over their site. It falls back to
 * white, the colour a browser paints for a document that declares none.
 *
 * Opaque and not 97%: measured at 97% on a light page, the body text and the
 * headings were still legible ghosts, and a ghost that jumps fifty times is
 * still a flicker. Three per cent of the amplitude is not three per cent of
 * the annoyance.
 *
 * A cover this complete has a failure mode a translucent one does not — if it
 * ever outlived the capture the visitor would be staring at a blank page with
 * no way to clear it. `finally` handles every ordinary path; the watchdog
 * handles the ones that are not paths at all.
 *
 * Two rules inside the injected stylesheet carry more weight than they look.
 * `.p` gets a hairline BORDER because plenty of sites have a near-black sticky
 * header; a near-black card over one disappears completely. And it stacks the
 * label ABOVE the bar rather than beside it — side by side, the Uzbek label
 * ate the row and left the bar 37 measured pixels wide.
 *
 * `.f` gets `display: block` because these are `<span>`s, and `width` does not
 * apply to an inline box. Without it the bar sets `width: 50%` and renders
 * zero pixels of fill — honest progress that nobody can see. Measured:
 * `fillPct: "50%"`, `fillPx: 0`.
 *
 * Nothing in the injected string may contain a backtick: it is built from a
 * template literal, and one inside a CSS comment terminates it.
 */
export const WAKE_SCRIPT = (labels: {
  waking: string
  loading: string
}) => `(async () => {
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

  const opaque = (value) =>
    value && value !== "transparent" && !/rgba\\(0, 0, 0, 0\\)/.test(value)
  const pageBackground =
    [document.body, doc]
      .filter(Boolean)
      .map((node) => getComputedStyle(node).backgroundColor)
      .find(opaque) || ${JSON.stringify(OVERLAY.scrimFallback)}

  let host = null
  let paint = () => {}
  let show = () => {}
  const mountOverlay = () => {
    // A shadow root: the page's own CSS cannot reach in and restyle this, and
    // nothing here leaks out onto the page.
    host = document.createElement("div")
    host.id = HOST_ID
    host.style.cssText =
      "all:initial;position:fixed;inset:0;z-index:2147483647;transition:opacity ${FADE_OUT_MS}ms ease"
    const root = host.attachShadow({ mode: "closed" })
    root.innerHTML = \`
      <style>
        @keyframes in{from{opacity:0;transform:translate(-50%,-46%)}
                      to{opacity:1;transform:translate(-50%,-50%)}}
        .s{position:absolute;inset:0}
        .p{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
           font:500 13px/1.3 system-ui,-apple-system,sans-serif;color:${OVERLAY.foreground};
           background:${OVERLAY.background};border-radius:12px;padding:11px 14px;display:flex;
           flex-direction:column;align-items:stretch;gap:9px;box-shadow:${OVERLAY.shadow};
           width:260px;border:1px solid ${OVERLAY.hairline};
           animation:in .18s cubic-bezier(.16,1,.3,1)}
        .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .b{height:4px;border-radius:2px;background:${OVERLAY.track};overflow:hidden}
        .f{display:block;height:100%;width:0%;background:${OVERLAY.accent};
           transition:width .15s linear}
      </style>
      <div class="s"></div>
      <div class="p"><span class="t"></span><span class="b"><span class="f"></span></span></div>\`
    root.querySelector(".s").style.background = pageBackground
    document.documentElement.append(host)
    // Belt for an opaque cover: whatever happens to the promise below — a
    // detached debugger, a service worker killed mid-capture — this overlay
    // takes itself down. Far longer than any real capture, short enough that
    // nobody would go looking for a reload button first.
    setTimeout(() => host?.remove(), ${WATCHDOG_MS})
    const text = root.querySelector(".t")
    const fill = root.querySelector(".f")
    paint = (label, ratio) => {
      text.textContent = label
      fill.style.width = Math.round(Math.max(0, Math.min(1, ratio)) * 100) + "%"
    }
    show = (label, ratio) => paint(label, ratio * ${WAKE_SPAN})
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
        show(${JSON.stringify(labels.waking)}, y / total)
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
      show(
        ${JSON.stringify(labels.loading)},
        totalImages ? (totalImages - pendingNow()) / totalImages : 1
      )
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
      viewport: window.innerHeight
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
        set(label, ratio) { paint(label, ratio) },
        abort() { drop() },
        async done() {
          if (host) {
            host.style.display = ""
            host.style.opacity = "0"
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
