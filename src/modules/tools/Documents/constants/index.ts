/**
 * What every document on this page shares: the paper, the writing lines, the
 * calendar and the two scripts. Anything a single document knows — its clauses,
 * its legal sources, its sample — lives in `../templates/<slug>/constants.ts`.
 */

/**
 * What stands in for a field the visitor has not filled yet.
 *
 * Long enough to write on by hand: a printed document with blanks IS the blank
 * form people take to the meeting, so an empty form is a feature, not an error
 * state — nothing here ever refuses to render.
 */
export const BLANK = "______________________"
/** A shorter rule, for a sum's digits or a passport number. */
export const BLANK_SHORT = "____________"

/** The two scripts every document renders in. Ids double as message keys. */
export const DOCUMENT_SCRIPTS = ["lotin", "kirill"] as const

/**
 * The sheet's own colours and face — the PAPER exception.
 *
 * A document is not interface: it must look identical in light and dark mode
 * and identical to what the printer produces, so semantic tokens — which exist
 * to flip with the scheme — are exactly wrong here. Same category as the
 * code-snapshot canvas and the chart palettes (`code-rules.md` §11): named
 * constants in one place, never inline.
 */
export const PAPER = {
  background: "#ffffff",
  ink: "#111111",
  /** Times is what Uzbek official documents are set in; Georgia is the metric-compatible fallback. */
  fontFamily: "'Times New Roman', Georgia, serif"
} as const

/**
 * The sheet's GEOMETRY — applied as inline styles, not utility classes.
 *
 * The same exception as `PAPER`, for a sharper reason. These values were
 * Tailwind utilities (`ml-auto`, `mt-10`, `mb-16`, `w-[58%]`) and the owner's
 * browser rendered the document with several of them missing while others
 * applied — the addressee column sat on the left, the title had no space
 * around it. A document's measurements must not depend on whether a content
 * scan happened to pick up a class that appears in exactly one file.
 *
 * They are also the numbers the .docx export converts to twips, so keeping
 * them in one block is what makes the screen, the printout and the Word file
 * the same document rather than three that drift apart.
 */
export const SHEET = {
  /** The abzas: how an Uzbek document starts a paragraph. */
  firstLineIndent: "1.25cm",
  /** Where the ariza's addressee column begins, as a share of the text width. */
  columnOffset: "42%",
  /**
   * Between INDENTED paragraphs — nearly nothing.
   *
   * The abzas is what separates them; adding a gap on top of it makes every
   * paragraph look like its own section, which is what the owner saw.
   */
  indentedGap: "6px",
  /** Between the lines a document ends with — place, date, signature. */
  paragraphGap: "18px",
  /** Above a title that is not the first thing on the page. */
  headingGapBefore: "28px",
  /** Between a title and the text under it. */
  headingGapAfter: "36px"
} as const

/**
 * The same sheet, in Word's units — the .docx half of the PAPER exception.
 *
 * Word measures in twips: 1440 to the inch, so A4 (210 × 297 mm) is
 * 11906 × 16838 and a 20 mm margin is 1134. Font size is in HALF-points, so
 * 12pt is 24. These are the on-screen sheet's numbers converted once, here,
 * rather than as magic integers inside the exporter — the screen, the printout
 * and the .docx have to stay the same document.
 */
export const PAPER_DOCX = {
  /** A4, in twips. */
  width: 11906,
  height: 16838,
  /** 20mm sides and foot, 22mm head — matching the sheet's padding. */
  margin: 1134,
  marginTop: 1247,
  font: "Times New Roman",
  /** 12pt, in half-points. */
  fontHalfPoints: 24,
  /** ~1.85 line height, in 240ths of a line. */
  lineHeight: 444,
  /** Space after each paragraph, in twips (~5pt) — the abzas separates prose. */
  paragraphGap: 100,
  /** The heading's letter-spacing, in twentieths of a point. */
  headingTracking: 60,
  /** Space under the heading — the sheet's 36px, in twips. */
  headingGap: 540,
  /** The abzas: 1.25 cm, in twips (1.25 / 2.54 × 1440). */
  firstLineIndent: 709,
  /**
   * Left indent for the addressee column, in twips.
   *
   * The text width is 11906 − 1134 − 1134 = 9638 twips; the sheet gives that
   * column 58% of it, so the paragraph starts 42% in. Without this the .docx
   * would right-align the block across the whole page and stop matching the
   * screen and the printout — three documents instead of one.
   */
  headerColumnIndent: 4048
} as const
