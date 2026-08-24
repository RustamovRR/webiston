import { CaptureError, send, type Target, withDebugger } from "./cdp"
import { type CaptureBudget, planCapture } from "./limits"
import { WAKE_SCRIPT, type WakeReport } from "./wake"

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

const REFLOW_SETTLE_MS = 200

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
}

interface LayoutMetrics {
  cssContentSize: { width: number; height: number }
}

const metrics = (target: Target) =>
  send<LayoutMetrics>(target, "Page.getLayoutMetrics")

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
    labels,
    onProgress
  }: {
    format?: Format
    scale?: number
    labels: { waking: string; loading: string }
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
        expression: WAKE_SCRIPT(labels),
        awaitPromise: true,
        returnByValue: true
      }
    )
    // Images that arrived change layout: a page that reserved no space for
    // them grows here, and measuring before the reflow cuts the footer off.
    await new Promise((resolve) => setTimeout(resolve, REFLOW_SETTLE_MS))

    const settled = await metrics(target)
    const budget = planCapture(
      Math.ceil(settled.cssContentSize.width),
      Math.ceil(settled.cssContentSize.height),
      scale
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
          y: tile.y,
          width: budget.width,
          height: tile.height,
          scale
        })
      )
    }

    let dataUrl: string
    if (parts.length === 1 && parts[0]) {
      dataUrl = `data:image/${format};base64,${parts[0]}`
    } else {
      onProgress?.({ phase: "stitching" })
      dataUrl = await stitch(parts, budget, format, scale)
    }

    return {
      dataUrl,
      width: Math.round(budget.width * scale),
      height: Math.round(budget.height * scale),
      clamped: budget.clamped,
      requestedHeight: budget.requestedHeight,
      pendingImages: wake.result?.value?.pending ?? 0
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
  scale: number
): Promise<string> {
  const canvas = new OffscreenCanvas(
    Math.round(budget.width * scale),
    Math.round(budget.height * scale)
  )
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
    context.drawImage(bitmap, 0, Math.round(tile.y * scale))
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
