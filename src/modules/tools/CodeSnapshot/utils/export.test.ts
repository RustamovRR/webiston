import { describe, expect, it } from "vitest"

import { snapshotFileName } from "./export"

describe("snapshotFileName", () => {
  it("slugifies the window title", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("useDebounce hook")).toBe("usedebounce-hook.png")
  })

  it("drops an existing extension instead of stacking one on", () => {
    // Arrange / Act / Assert — the title bar usually holds a filename, and
    // `app.tsx.png` would be a file with two extensions.
    expect(snapshotFileName("App.tsx")).toBe("app.png")
    expect(snapshotFileName("server.route.ts")).toBe("server-route.png")
  })

  it("collapses punctuation runs into single hyphens", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("a  ///  b")).toBe("a-b.png")
  })

  it("never leaves a leading or trailing hyphen", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("  --hello--  ")).toBe("hello.png")
  })

  /**
   * The failure this guards: an empty stem yields `.png`, which is a HIDDEN
   * file on macOS and Linux. The reader clicks download and nothing appears.
   */
  it("falls back to a real stem when the title is empty or symbols only", () => {
    // Arrange / Act / Assert
    expect(snapshotFileName("")).toBe("code-snapshot.png")
    expect(snapshotFileName("   ")).toBe("code-snapshot.png")
    expect(snapshotFileName("***")).toBe("code-snapshot.png")
  })

  it("does not produce a name that starts with a dot", () => {
    // Arrange
    const names = ["", "***", "  ", ".ts", "..."].map(snapshotFileName)

    // Act / Assert
    for (const name of names) expect(name.startsWith(".")).toBe(false)
  })
})
