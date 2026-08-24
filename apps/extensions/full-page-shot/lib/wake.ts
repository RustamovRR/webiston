/**
 * The script that runs INSIDE the page before a capture.
 *
 * It does two jobs that have to happen together: wake everything below the
 * fold, and tell the user what is happening while it does.
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
 * all: same measurement after the scroll as before it.
 */

import { OVERLAY } from "./paint"

export interface WakeReport {
  /** Images still not `complete` when the deadline passed. 0 is the good case. */
  pending: number
  scrolledPx: number
  /** How many scroll steps the walk took. 0 means the page fit on one screen. */
  steps: number
}

/**
 * A page this close to fitting on one screen has nothing below the fold worth
 * waking: everything is already inside Chrome's own lazy-loading distance
 * (~1,250px for images on a fast connection). Walking it anyway would scroll
 * the page a few hundred pixels and back for no gain, which is the one thing
 * the user actually SEES this script do. The most common capture — a short
 * page — is therefore completely still.
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
 * Progress is REAL — scroll position and the image count, not a timer
 * pretending to be one. A progress bar that lies is worse than none.
 *
 * The scrim underneath it is not decoration. The walk moves the page in
 * viewport-sized jumps, and jump-cut content reads as a glitch: the page
 * looks like it is malfunctioning rather than working. Dimming it turns the
 * same motion into an obviously deliberate busy state — the flicker is not
 * removed, it is put behind something.
 *
 * The whole overlay removes itself before this resolves, so it can never
 * appear in the screenshot. The badge takes over for the capture phase,
 * because a badge is browser chrome and cannot end up in the image.
 */
/**
 * Two rules inside the injected stylesheet carry more weight than they look.
 *
 * `.p` gets a hairline BORDER because plenty of sites have a near-black sticky
 * header; a near-black pill dimmed over one disappears completely, which is
 * what the first version did on exactly that layout.
 *
 * It stacks the label ABOVE the bar rather than beside it. Side by side, the
 * Uzbek label ate the row and left the bar 37 measured pixels wide — a
 * progress bar too small to read progress from. Stacked, it is the full 232.
 *
 * `.f` gets `display: block` because these are `<span>`s, and `width` does not
 * apply to an inline box. Without it the bar sets `width: 50%` and renders
 * zero pixels of fill — it reports honest progress that nobody can see, which
 * is the worst of both. Measured: `fillPct: "50%"`, `fillPx: 0`.
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

  // A shadow root: the page's own CSS cannot reach in and restyle this, and
  // nothing here leaks out onto the page.
  const host = document.createElement("div")
  host.id = HOST_ID
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647"
  const root = host.attachShadow({ mode: "closed" })
  root.innerHTML = \`
    <style>
      @keyframes in{from{opacity:0}to{opacity:1}}
      .s{position:absolute;inset:0;background:${OVERLAY.scrim};animation:in .12s ease-out}
      .p{position:absolute;top:16px;left:50%;transform:translateX(-50%);
         font:500 13px/1.3 system-ui,-apple-system,sans-serif;color:${OVERLAY.foreground};
         background:${OVERLAY.background};border-radius:12px;padding:11px 14px;display:flex;
         flex-direction:column;align-items:stretch;gap:9px;box-shadow:${OVERLAY.shadow};
         width:260px;border:1px solid ${OVERLAY.hairline};animation:in .12s ease-out}
      .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b{height:4px;border-radius:2px;background:${OVERLAY.track};overflow:hidden}
      .f{display:block;height:100%;width:0%;background:${OVERLAY.accent};
         transition:width .15s linear}
    </style>
    <div class="s"></div>
    <div class="p"><span class="t"></span><span class="b"><span class="f"></span></span></div>\`
  document.documentElement.append(host)
  const text = root.querySelector(".t")
  const fill = root.querySelector(".f")
  const show = (label, ratio) => {
    text.textContent = label
    fill.style.width = Math.round(Math.max(0, Math.min(1, ratio)) * 100) + "%"
  }

  // Frame-synced, but never longer than a fixed cap: rAF stops being delivered
  // in a background tab, and a step waiting on a frame that never comes would
  // hang the capture instead of finishing it.
  const beat = () =>
    Promise.race([
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      new Promise((r) => setTimeout(r, ${STEP_CAP_MS}))
    ])

  const el = document.documentElement
  const startedAt = window.scrollY
  // MEASURED: on a page with \`scroll-behavior: smooth\` the plain scrollTo
  // animates, each step interrupts the last, the walk never reaches the
  // bottom and the restore never lands — 2 of 8 IntersectionObserver reveals
  // stayed hidden and the visitor was left 2,970px down their own page.
  // \`behavior:"instant"\` overrides it per call; the !important property is
  // the belt for pages that declare it !important themselves.
  const prevBehavior = el.style.getPropertyValue("scroll-behavior")
  const prevPriority = el.style.getPropertyPriority("scroll-behavior")
  el.style.setProperty("scroll-behavior", "auto", "important")
  const jump = (y) => window.scrollTo({ top: y, left: 0, behavior: "instant" })

  let steps = 0
  try {
    // 1. Walk the page, re-reading the height every step so a document that
    //    GROWS while its content loads is walked to its real end. 90% of a
    //    viewport per step keeps a sliver of overlap, so nothing sits exactly
    //    on a boundary and gets skipped.
    let total = el.scrollHeight
    if (total > window.innerHeight + ${WALK_THRESHOLD_PX}) {
      const step = Math.max(200, window.innerHeight * 0.9)
      for (let y = 0; y < total && steps < ${MAX_STEPS}; y += step) {
        jump(y)
        steps++
        show(${JSON.stringify(labels.waking)}, y / total)
        await beat()
        total = Math.max(total, el.scrollHeight)
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

    // 3. Back to where the visitor was. The capture does not depend on the
    //    scroll position, but leaving someone 40,000px down their own page
    //    would be a rude thing for a screenshot tool to do.
    jump(startedAt)
    await beat()
    return { pending: pendingNow(), scrolledPx: el.scrollHeight, steps }
  } finally {
    // Always: an overlay left behind would be captured INTO the screenshot,
    // which is the one artefact this whole file exists to avoid. The page's
    // own scroll behaviour is restored with it — we borrowed it, briefly.
    host.remove()
    if (prevBehavior) {
      el.style.setProperty("scroll-behavior", prevBehavior, prevPriority)
    } else {
      el.style.removeProperty("scroll-behavior")
    }
  }
})()`
