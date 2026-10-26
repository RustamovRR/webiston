import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Every tool route keeps its client island out of session replay.
 *
 * Read from the filesystem, like `proxy.test.ts`: a new tool that forgets the
 * wrapper ships a page whose results Clarity records verbatim, and nothing
 * else in the gate would notice.
 */

const TOOLS_DIR = path.join(
  import.meta.dirname,
  "../../../app/(app)/[locale]/tools"
)

const toolRoutes = readdirSync(TOOLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
  .map((entry) => entry.name)

describe("PrivateContent on tool routes", () => {
  it("finds the tool routes", () => {
    // Arrange / Act / Assert — an empty list would pass everything below.
    expect(toolRoutes.length).toBeGreaterThan(20)
  })

  it("wraps every tool island", () => {
    // Arrange
    const unwrapped = toolRoutes.filter((route) => {
      const source = readFileSync(
        path.join(TOOLS_DIR, route, "page.tsx"),
        "utf8"
      )
      const island = source.indexOf("<LocaleMessages")
      const wrapper = source.indexOf("<PrivateContent>")
      // Act — the wrapper must open before the island does.
      return island !== -1 && (wrapper === -1 || wrapper > island)
    })

    // Assert
    expect(unwrapped).toEqual([])
  })
})
