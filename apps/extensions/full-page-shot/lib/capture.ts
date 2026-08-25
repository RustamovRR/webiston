import { CaptureError, send, type Target, withDebugger } from "./cdp"
import { type CaptureBudget, planCapture } from "./limits"
import { SCROLL_TO, WAKE_SCRIPT, type WakeReport } from "./wake"

/**
 * The capture pipeline, and the reason this extension exists.
 *
 * The common approach — scroll a step, snapshot the viewport, repeat, stitch —
 * produces the artefacts everyone recognises: blank bands where lazy images
 * never loaded, a sticky header repeated down the page, and a wait measured in
 * seconds because `captureVisibleTab` is rate-limited to about two calls per
 * second. None of that is a bug in those tools; it is what the technique costs.
 *
 * Here the scroll is used only to WAKE the page — never to photograph it. The
 * photograph is a single `Page.captureScreenshot` with `captureBeyondViewport`,
 * so the renderer composites the whole document in one pass: no seams, and a
 * `position: fixed` header appears exactly once, where it belongs.
 *
 * The viewport is left at its natural size throughout. An earlier version made
 * it as tall as the document and that broke `vh` units on every page that uses
 * them — see `wake.ts` for the measurements.
 */

export type Format = "png" | "jpeg"

export type Phase = "waking" | "capturing" | "stitching"

export interface Progress {
  phase: Phase
  /** Only meaningful while `capturing`; 1-based. */
  tile?: number
  tiles?: number
}

export interface CaptureResult {
  dataUrl: string
  width: number
  height: number
  /** Set when the page was taller than the renderer can produce in one image. */
  clamped: boolean
  requestedHeight: number
  /** Images that had still not loaded when the deadline passed. */
  pendingImages: number
  /**
   * The page scrolls inside a panel rather than as a document, so the image
   * is the visible area and cannot be more than that.
   */
  innerScroll: boolean
}

interface LayoutMetrics {
  cssContentSize: { width: number; height: number }
}

const metrics = (target: Target) =>
  send<LayoutMetrics>(target, "Page.getLayoutMetrics")

/**
 * How the bar is divided. The wake owns 0–0.6 and paints its own share; these
 * are what the shutter and the assembly are worth.
 *
 * They are estimates of TIME, not of work done, because that is what a
 * progress bar is for. Measured on a 9,000px page: wake ~2s, two clips ~0.9s,
 * stitch and encode ~0.6s.
 */
const SHUTTER_START = 0.6
const SHUTTER_END = 0.9
const ASSEMBLY_START = 0.9

async function captureTile(
  target: Target,
  format: Format,
  clip: { x: number; y: number; width: number; height: number; scale: number }
): Promise<string> {
  const { data } = await send<{ data: string }>(
    target,
    "Page.captureScreenshot",
    {
      format,
      ...(format === "jpeg" ? { quality: 92 } : {}),
      clip,
      captureBeyondViewport: true,
      fromSurface: true
    }
  )
  return data
}

export async function captureFullPage(
  tabId: number,
  {
    format = "png",
    scale = 1,
    onProgress
  }: {
    format?: Format
    scale?: number
    onProgress?: (progress: Progress) => void
  }
): Promise<CaptureResult> {
  return withDebugger({ tabId }, async () => {
    const target = { tabId }
    await send(target, "Page.enable")
    onProgress?.({ phase: "waking" })
    const wake = await send<{ result?: { value?: WakeReport } }>(
      target,
      "Runtime.evaluate",
      {
        expression: WAKE_SCRIPT(),
        awaitPromise: true,
        returnByValue: true
      }
    )
    // Belt. The wake ends at the top of the document because
    // `captureBeyondViewport` paints fixed and sticky boxes at the scroll
    // offset — but a wake that threw returns no report and leaves the page
    // wherever it stopped, and a capture from there is the exact defect this
    // is guarding against. Costs one evaluate on a path that is already free.
    await send(target, "Runtime.evaluate", {
      expression: SCROLL_TO(0)
    }).catch(() => {})

    const settled = await metrics(target)
    // The renderer applies the tab's device pixel ratio ON TOP of `clip.scale`
    // — measured: a 1512x8000 CSS clip at scale 1 came back 3024x16000 on a
    // DPR-2 browser. Every limit in `limits.ts` is a device-pixel limit, so
    // the plan has to be made in the same units the file will be measured in.
    const deviceScale = (wake.result?.value?.dpr ?? 1) * scale
    const viewport = wake.result?.value?.viewport ?? 0
    const budget = planCapture(
      Math.ceil(settled.cssContentSize.width),
      Math.ceil(settled.cssContentSize.height),
      deviceScale,
      viewport
    )
    if (budget.tiles.length === 0) {
      throw new CaptureError("capture-failed", "The page measured 0px tall.")
    }

    // SEQUENTIAL, not `Promise.all`. Each call allocates a bitmap the full
    // width of the page by up to 15,000px tall; firing five of those at once
    // is how a long capture turns into an out-of-memory failure on exactly
    // the pages that need tiling in the first place.
    const parts: string[] = []
    for (const [index, tile] of budget.tiles.entries()) {
      onProgress?.({
        phase: "capturing",
        tile: index + 1,
        tiles: budget.tiles.length
      })
      parts.push(
        await captureTile(target, format, {
          x: 0,
          // The lead-in is captured and discarded — see `Tile.lead`.
          y: tile.y - tile.lead,
          width: budget.width,
          height: tile.height + tile.lead,
          scale
        })
      )
    }

    // The visitor gets their scroll position back HERE, not in the wake.
    // `captureBeyondViewport` paints fixed and sticky boxes at whatever the
    // scroll offset is, so the capture has to happen at the top of the
    // document — measured on webiston.uz, restoring first stranded the site
    // header and both sidebars 400px down the image. Best-effort: if the tab
    // navigated away mid-capture there is nothing left to put back, and that
    // must not turn a good screenshot into an error.
    const startedAt = wake.result?.value?.startedAt ?? 0
    if (startedAt > 0) {
      await send(target, "Runtime.evaluate", {
        expression: SCROLL_TO(startedAt)
      }).catch(() => {})
    }

    let dataUrl: string
    if (parts.length === 1 && parts[0]) {
      dataUrl = `data:image/${format};base64,${parts[0]}`
    } else {
      onProgress?.({ phase: "stitching" })
      dataUrl = await stitch(parts, budget, format)
    }

    return {
      dataUrl,
      // What the FILE measures, not what the page measured. The viewer used to
      // print the CSS numbers here and so reported a 3024x6806 screenshot as
      // "1512x3403" — half of everything, on every Retina machine.
      width: budget.deviceWidth,
      height: budget.deviceHeight,
      clamped: budget.clamped,
      requestedHeight: Math.round(budget.requestedHeight * budget.deviceScale),
      pendingImages: wake.result?.value?.pending ?? 0,
      innerScroll: wake.result?.value?.innerScroll ?? false
    }
  })
}

/**
 * Join tiles into one image, in the service worker.
 *
 * Only reached on pages taller than a single GPU texture — rare, but the case
 * where a lesser tool returns a blank PNG and says nothing.
 */
async function stitch(
  tiles: string[],
  budget: CaptureBudget,
  format: Format,
  patch?: string
): Promise<string> {
  // DEVICE pixels. The tiles come back at the tab's device pixel ratio, so a
  // canvas sized in CSS pixels is half the size the bitmaps are drawn at —
  // which is what every multi-tile capture on a Retina display used to hit.
  const canvas = new OffscreenCanvas(budget.deviceWidth, budget.deviceHeight)
  const context = canvas.getContext("2d")
  if (!context) {
    throw new CaptureError("capture-failed", "No 2D context for stitching.")
  }

  // Zipped rather than indexed: the tile and its image come from the same
  // plan, so pairing them removes the "does this index exist" question
  // instead of answering it with an assertion.
  const placed = budget.tiles.map((tile, index) => ({
    tile,
    data: tiles[index]
  }))
  for (const { tile, data } of placed) {
    if (!data) continue
    const response = await fetch(`data:image/${format};base64,${data}`)
    const bitmap = await createImageBitmap(await response.blob())
    // Source rect, not a bare draw: the top `lead` rows of this bitmap hold
    // the sticky boxes stamped at the clip's origin and must not be kept.
    const skip = Math.round(tile.lead * budget.deviceScale)
    const keep = Math.round(tile.height * budget.deviceScale)
    context.drawImage(
      bitmap,
      0,
      skip,
      bitmap.width,
      keep,
      0,
      Math.round(tile.y * budget.deviceScale),
      bitmap.width,
      keep
    )
    bitmap.close()
  }

  // Last, and over the top: the band the progress cover was standing in.
  if (patch) {
    const response = await fetch(`data:image/${format};base64,${patch}`)
    const bitmap = await createImageBitmap(await response.blob())
    context.drawImage(bitmap, 0, 0)
    bitmap.close()
  }

  const blob = await canvas.convertToBlob({
    type: `image/${format}`,
    ...(format === "jpeg" ? { quality: 0.92 } : {})
  })
  return await blobToDataUrl(blob)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () =>
      reject(new CaptureError("capture-failed", "read failed"))
    reader.readAsDataURL(blob)
  })
}
