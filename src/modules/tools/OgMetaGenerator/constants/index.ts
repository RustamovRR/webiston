import type { OgType, OutputFormat, Platform, TwitterCard } from "../types"

/**
 * Tool-scoped constants.
 */

/**
 * The `og:type` values offered.
 *
 * Five, not ten. What this replaces listed `music.song`, `music.album`,
 * `video.movie`, `video.episode` and `video.tv_show` — and then INVENTED the
 * properties each of them requires, emitting `music:duration content="240"`
 * and `book:isbn content="978-0000000000"` for a page it knew nothing about.
 * A type is only offered here if the tags this tool can honestly produce are
 * enough for it.
 */
export const OG_TYPES: readonly OgType[] = [
  "website",
  "article",
  "book",
  "profile",
  "video.other"
]

/**
 * The i18n key for each type.
 *
 * `og:type` values carry dots — `video.other` — and next-intl reads a dot as
 * NESTING, so `t("types.video.other")` looks for `types → video → other` and,
 * finding nothing, renders the key path into the page. It shipped that way for
 * one build: the select's Video option read
 * `OgMetaGeneratorPage.form.types.video.other`.
 */
export const OG_TYPE_KEY: Record<OgType, string> = {
  website: "website",
  article: "article",
  book: "book",
  profile: "profile",
  "video.other": "video"
}

export const TWITTER_CARDS: readonly TwitterCard[] = [
  "summary",
  "summary_large_image",
  "player"
]

export const OUTPUT_FORMATS: readonly OutputFormat[] = ["html", "next"]

/** The cards previewed, in the order this site's audience meets them. */
export const PLATFORMS: readonly Platform[] = [
  "telegram",
  "x",
  "facebook",
  "linkedin"
]

/**
 * Locales offered for `og:locale`, in the `language_TERRITORY` form the
 * Open Graph protocol specifies.
 */
export const OG_LOCALES: readonly string[] = [
  "uz_UZ",
  "en_US",
  "en_GB",
  "ru_RU",
  "tr_TR"
]

/**
 * Length advice, in characters.
 *
 * These are the points where text starts being CUT, not rules — a longer title
 * is legal everywhere. They are stated as recommendations in the UI for
 * exactly that reason.
 */
export const TITLE_IDEAL_MAX = 60
export const TITLE_HARD_MAX = 90
export const DESCRIPTION_IDEAL_MAX = 160
export const DESCRIPTION_HARD_MAX = 200

/**
 * The image every large card is designed around: 1200×630, a 1.91:1 ratio.
 *
 * `MIN_EDGE` is the floor below which platforms stop showing an image at all,
 * and `RATIO_TOLERANCE` is how far from 1.91 the shape can drift before the
 * crop starts removing something the visitor put there on purpose.
 */
export const IMAGE_IDEAL_WIDTH = 1200
export const IMAGE_IDEAL_HEIGHT = 630
export const IMAGE_MIN_EDGE = 200

/**
 * The width above which a platform draws the tall card instead of a thumbnail.
 *
 * Facebook's own guidance is the source of the number, and Telegram and
 * LinkedIn behave the same way — none of the three reads `twitter:card`, so
 * the image itself is what decides.
 */
export const LARGE_CARD_MIN_WIDTH = 600
export const IMAGE_IDEAL_RATIO = IMAGE_IDEAL_WIDTH / IMAGE_IDEAL_HEIGHT
export const IMAGE_RATIO_TOLERANCE = 0.35

/** Per-platform truncation used by the previews. */
export const PLATFORM_LIMITS: Record<
  Platform,
  { title: number; description: number }
> = {
  telegram: { title: 90, description: 200 },
  x: { title: 70, description: 125 },
  facebook: { title: 88, description: 110 },
  linkedin: { title: 120, description: 130 }
}

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = [
  "whatIsOg",
  "notUpdating",
  "imageSize",
  "twitterNeeded",
  "nextjs"
] as const
