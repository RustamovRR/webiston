import {
  DESCRIPTION_HARD_MAX,
  DESCRIPTION_IDEAL_MAX,
  IMAGE_IDEAL_RATIO,
  IMAGE_MIN_EDGE,
  IMAGE_RATIO_TOLERANCE,
  TITLE_HARD_MAX,
  TITLE_IDEAL_MAX
} from "../constants"
import type { ImageProbe, MetaDraft, ValidationIssue } from "../types"

/**
 * What is wrong with the draft, in the order it is worth fixing.
 *
 * What this replaces was an "SEO score" out of 100, assembled from arbitrary
 * weights (a title of 30–60 characters was worth 25 points; a site name was
 * worth 10). A number like that cannot be acted on: it does not say what to
 * change, and moving it means nothing outside this page. Every entry here
 * names one concrete thing and why it matters.
 *
 * The rules themselves are the ones that actually break a share card in
 * practice, not a checklist of everything the protocol allows.
 */

/** A URL a crawler can fetch — absolute, http(s). A relative path cannot be. */
function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function validateDraft(
  draft: MetaDraft,
  probe: ImageProbe
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const title = draft.title.trim()
  const description = draft.description.trim()
  const image = draft.image.trim()
  const url = draft.url.trim()

  if (!title) {
    issues.push({ level: "error", key: "titleMissing" })
  } else if (title.length > TITLE_HARD_MAX) {
    issues.push({
      level: "warning",
      key: "titleTooLong",
      values: { length: title.length, max: TITLE_HARD_MAX }
    })
  } else if (title.length > TITLE_IDEAL_MAX) {
    issues.push({
      level: "warning",
      key: "titleLong",
      values: { length: title.length, max: TITLE_IDEAL_MAX }
    })
  }

  if (!description) {
    issues.push({ level: "warning", key: "descriptionMissing" })
  } else if (description.length > DESCRIPTION_HARD_MAX) {
    issues.push({
      level: "warning",
      key: "descriptionTooLong",
      values: { length: description.length, max: DESCRIPTION_HARD_MAX }
    })
  } else if (description.length > DESCRIPTION_IDEAL_MAX) {
    issues.push({
      level: "warning",
      key: "descriptionLong",
      values: { length: description.length, max: DESCRIPTION_IDEAL_MAX }
    })
  }

  if (!image) {
    issues.push({ level: "warning", key: "imageMissing" })
  } else if (!isAbsoluteHttpUrl(image)) {
    // The single commonest reason a share card has no picture: `/og.png`
    // resolves against the crawler's own host, not the author's.
    issues.push({ level: "error", key: "imageRelative" })
  } else if (probe.status === "error") {
    issues.push({ level: "error", key: "imageUnreachable" })
  } else if (probe.status === "ready") {
    if (probe.width < IMAGE_MIN_EDGE || probe.height < IMAGE_MIN_EDGE) {
      issues.push({
        level: "error",
        key: "imageTooSmall",
        values: {
          width: probe.width,
          height: probe.height,
          min: IMAGE_MIN_EDGE
        }
      })
    } else {
      const ratio = probe.width / probe.height
      if (Math.abs(ratio - IMAGE_IDEAL_RATIO) > IMAGE_RATIO_TOLERANCE) {
        issues.push({
          level: "warning",
          key: "imageRatio",
          values: {
            width: probe.width,
            height: probe.height,
            ratio: ratio.toFixed(2)
          }
        })
      }
    }
  }

  if (image && !draft.imageAlt.trim()) {
    issues.push({ level: "warning", key: "imageAltMissing" })
  }

  if (!url) {
    issues.push({ level: "warning", key: "urlMissing" })
  } else if (!isAbsoluteHttpUrl(url)) {
    issues.push({ level: "error", key: "urlRelative" })
  }

  // A large card with no image is a small card with extra steps: X falls back
  // to `summary`, and the visitor is left wondering why their choice did
  // nothing.
  if (draft.twitterCard === "summary_large_image" && !image) {
    issues.push({ level: "warning", key: "largeCardNoImage" })
  }

  return issues
}

export { isAbsoluteHttpUrl }
