import { describe, expect, it } from "vitest"

import { normaliseBreadcrumb } from "./route"

/**
 * The caption line under the title on every share card.
 *
 * The owner caught this on a real card: a request with no `path` rendered a
 * lone `/` where the tagline belongs.
 */

describe("normaliseBreadcrumb", () => {
  it("returns nothing when there is no path, so the tagline shows", () => {
    // Arrange & Act & Assert — `{0,120}` matched the empty string, and
    // `"".replace(/^\/?/, "/")` is `"/"`, which is truthy.
    expect(normaliseBreadcrumb(null)).toBe("")
    expect(normaliseBreadcrumb("")).toBe("")
    expect(normaliseBreadcrumb("   ")).toBe("")
  })

  it("keeps a real path and gives it its leading slash", () => {
    // Arrange & Act & Assert
    expect(normaliseBreadcrumb("books/react/hooks")).toBe("/books/react/hooks")
    expect(normaliseBreadcrumb("/books/react")).toBe("/books/react")
  })

  it("drops anything that is not a path", () => {
    // Arrange & Act & Assert — the value is echoed into the image, so it is
    // treated as untrusted input rather than as our own data.
    expect(normaliseBreadcrumb("https://evil.example/x")).toBe("")
    expect(normaliseBreadcrumb("a".repeat(200))).toBe("")
    expect(normaliseBreadcrumb("<script>")).toBe("")
  })
})
