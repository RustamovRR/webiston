/**
 * Search terms for the camera tool.
 *
 * Ten, not the ~50 the route used to carry inline in near-identical forms
 * ("kamera recorder" appeared twice in the same array). Search engines
 * deduplicate a repeated phrase; the page's own copy is what ranks.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  "webcam test",
  "test my camera",
  "camera not working",
  "online webcam recorder",
  "webcam screenshot",
  "kamera test",
  "kamerani tekshirish",
  "veb-kamera sinovi",
  "video yozib olish onlayn",
  "bepul kamera testi"
]
