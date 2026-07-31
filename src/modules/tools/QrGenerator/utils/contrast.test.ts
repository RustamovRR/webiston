import { describe, expect, it } from "vitest"
import { checkScannability, contrastRatio } from "./contrast"

describe("contrastRatio", () => {
  it("returns the WCAG extremes for black on white", () => {
    // Arrange & Act & Assert
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1)
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5)
  })

  it("is order-independent", () => {
    // Arrange & Act & Assert
    expect(contrastRatio("#123456", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#123456"),
      5
    )
  })

  it("expands three-digit hex", () => {
    // Arrange & Act & Assert
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 1)
  })
})

describe("checkScannability", () => {
  it("passes the default black on white", () => {
    // Arrange & Act
    const verdict = checkScannability("#000000", "#ffffff")

    // Assert
    expect(verdict.risk).toBe("ok")
  })

  it("flags a pale foreground that a camera would miss", () => {
    // Arrange & Act & Assert — yellow on white is the classic broken code
    expect(checkScannability("#ffe600", "#ffffff").risk).toBe("low")
  })

  it("flags light-on-dark separately from low contrast", () => {
    // Arrange & Act — 21:1, excellent contrast, still commonly unreadable
    const verdict = checkScannability("#ffffff", "#000000")

    // Assert
    expect(verdict.risk).toBe("inverted")
    expect(verdict.ratio).toBeCloseTo(21, 1)
  })

  it("accepts a dark brand colour on white", () => {
    // Arrange & Act & Assert
    expect(checkScannability("#0a3d62", "#ffffff").risk).toBe("ok")
  })
})
