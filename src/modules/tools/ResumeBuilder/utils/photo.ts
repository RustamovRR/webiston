import { downscaleImage } from "@/lib/utils"

/**
 * Prepare a CV photo.
 *
 * The size is not cosmetic — it is what keeps the draft saveable. The photo
 * lives inside the `localStorage` draft as a data URL, and the quota is about
 * 5 MB for the WHOLE origin; a modern phone photo is 3–8 MB before base64
 * inflates it by a third. Storing the original would mean every save throws
 * and the visitor silently loses their afternoon's work.
 *
 * 480px on the long edge is comfortably more than the sheet asks for — the
 * photo prints at 28 × 35 mm, which is ~330 × 413 px even at 300 dpi — and
 * JPEG at 0.82 lands a typical portrait around 40 kB. `passThroughIfSmall` is
 * deliberately off: a small-but-heavy JPEG still needs the re-encode.
 */
const MAX_EDGE = 480
const QUALITY = 0.82

export type PhotoError = "unreadable" | "notAnImage"

export interface PhotoResult {
  dataUrl?: string
  error?: PhotoError
}

export async function preparePhoto(file: File): Promise<PhotoResult> {
  // Checked before the canvas touches it: a PDF handed to `<img>` fails with
  // the same "unreadable" as a corrupt JPEG, and the two deserve different
  // sentences.
  if (!file.type.startsWith("image/")) return { error: "notAnImage" }

  const { dataUrl, error } = await downscaleImage(file, {
    maxEdge: MAX_EDGE,
    format: "image/jpeg",
    quality: QUALITY
  })

  return error ? { error: "unreadable" } : { dataUrl }
}
