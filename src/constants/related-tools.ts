import { TOOLS_LIST, type Tool } from "./ui"

/**
 * How many siblings a tool page offers. Four fits one row on a laptop and two
 * on a phone; more turns a helpful aside into a second navigation menu.
 */
export const RELATED_TOOLS_COUNT = 4

/**
 * The tools to offer next to the one being used.
 *
 * Built from data `TOOLS_LIST` already carries — `category` first, then the
 * same `audience` — rather than a hand-written map of 21 × 4 pairings that
 * would rot the first time a tool moved. No new field, no curation step.
 *
 * The reason this exists at all is measurable: every tool page linked to
 * ZERO other tool pages (17 internal links each, none to a sibling), which
 * makes each of them an orphan from the rest of the site. Internal links are
 * the one ranking signal entirely under our control.
 *
 * The document family shares a single card on `/tools` but has four separate
 * routes, so a tool is excluded by its own href AND by the card it belongs
 * to — otherwise the tilxat page would offer the visitor the tilxat page.
 */
export function relatedTools(currentHref: string): Tool[] {
  const current = TOOLS_LIST.find((tool) => tool.href === currentHref)
  const pool = TOOLS_LIST.filter(
    (tool) => tool.href !== currentHref && tool.tKey !== current?.tKey
  )

  const rank = (tool: Tool) =>
    (tool.category === current?.category ? 0 : 2) +
    (tool.audience === current?.audience ? 0 : 1)

  // A stable sort keeps `TOOLS_LIST`'s own "how likely is someone to arrive
  // looking for this" ordering as the tie-break, which is a better default
  // than anything a second heuristic would invent.
  return [...pool]
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, RELATED_TOOLS_COUNT)
}
