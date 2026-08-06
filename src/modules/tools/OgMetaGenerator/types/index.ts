/**
 * Tool-scoped types.
 */

/** `og:type`. The subset with no extra required properties of its own. */
export type OgType = "website" | "article" | "book" | "profile" | "video.other"

export type TwitterCard = "summary" | "summary_large_image" | "player"

/** How the tags are written out. */
export type OutputFormat = "html" | "next"

/** Which social card is being previewed. */
export type Platform = "facebook" | "x" | "telegram" | "linkedin"

/**
 * Everything the visitor types. One flat record, all strings — an empty string
 * means "not provided", and a field that is not provided produces NO tag.
 */
export interface MetaDraft {
  title: string
  description: string
  image: string
  imageAlt: string
  url: string
  siteName: string
  type: OgType
  locale: string
  twitterCard: TwitterCard
  twitterSite: string
}

/** One `<meta>` line, before it is written as HTML. */
export interface MetaTag {
  /** `property` for Open Graph, `name` for Twitter and the basic tags. */
  attribute: "property" | "name"
  key: string
  content: string
}

export interface TagGroups {
  basic: MetaTag[]
  og: MetaTag[]
  twitter: MetaTag[]
}

export type IssueLevel = "error" | "warning"

/**
 * One thing wrong with the draft.
 *
 * `key` is an i18n key, not a sentence: the rules live in `utils/validate.ts`
 * and the wording lives in the message bundles, so neither can be changed by
 * editing the other.
 */
export interface ValidationIssue {
  level: IssueLevel
  key: string
  values?: Record<string, string | number>
}

/** What loading the image URL in the browser actually found. */
export type ImageProbe =
  | { status: "idle" | "loading" }
  | { status: "error" }
  | { status: "ready"; width: number; height: number }
