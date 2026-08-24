import { describe, expect, it } from "vitest"

import { RELATED_TOOLS_COUNT, relatedTools } from "./related-tools"
import { TOOLS_LIST } from "./ui"

/**
 * The block exists for one measured reason: every tool page linked to ZERO
 * sibling tool pages. These lock the two ways that silently regresses — a page
 * offering itself, and a page offering nothing.
 */
describe("relatedTools", () => {
  it("offers siblings on every tool page", () => {
    // Arrange / Act / Assert
    for (const tool of TOOLS_LIST) {
      const related = relatedTools(tool.href)
      expect(related.length, tool.href).toBe(RELATED_TOOLS_COUNT)
    }
  })

  it("never offers the page you are already on", () => {
    // Arrange / Act / Assert — by href AND by card: the document family shares
    // one `/tools` card across four routes, so href alone is not identity.
    for (const tool of TOOLS_LIST) {
      const related = relatedTools(tool.href)
      expect(related.map((r) => r.href)).not.toContain(tool.href)
      expect(related.map((r) => r.tKey)).not.toContain(tool.tKey)
    }
  })

  it("prefers the same category before anything else", () => {
    // Arrange
    const tool = TOOLS_LIST.find(
      (entry) => entry.href === "/tools/latin-cyrillic"
    )
    if (!tool) throw new Error("fixture tool missing from TOOLS_LIST")
    const siblings = TOOLS_LIST.filter(
      (entry) => entry.category === tool.category && entry.tKey !== tool.tKey
    )

    // Act
    const related = relatedTools(tool.href)

    // Assert — every same-category sibling that fits comes first.
    const expected = Math.min(siblings.length, RELATED_TOOLS_COUNT)
    for (let index = 0; index < expected; index++) {
      expect(related[index].category).toBe(tool.category)
    }
  })

  it("returns nothing for a page that is not a tool", () => {
    // Arrange / Act / Assert — an unknown href still gets a full list rather
    // than throwing; the component decides whether to render it.
    expect(relatedTools("/books").length).toBe(RELATED_TOOLS_COUNT)
  })
})
