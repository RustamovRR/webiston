import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DetailList } from "./DetailList"

/**
 * The rule this file exists to hold: a value shares its label's line when it
 * fits, and takes its own row only when it does not.
 *
 * Worth a test because the version this replaces decided it per FIELD rather
 * than per value, and the result was visible on screen — a fourteen-character
 * address taking a full row while the organisation name directly above it,
 * twice as long, sat inline. Both tools rendered from the same flag, so both
 * were wrong in the same way.
 *
 * The assertion reads a class name, which is normally a smell. Here the class
 * IS the behaviour: `justify-between` is what puts a value on the label's line,
 * and there is nothing else to observe in a layout with no state.
 */

/** Roughly a user-agent string — the case the own-line branch exists for. */
const LONG_VALUE =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

function rowOf(label: string): HTMLElement {
  const term = screen.getByText(label)
  const row = term.parentElement
  if (!row) throw new Error(`no row for "${label}"`)
  return row
}

describe("DetailList", () => {
  it("keeps a short value on its label's line", () => {
    // Arrange + Act
    render(
      <DetailList
        rows={[{ key: "ip", label: "Manzil", value: "213.230.78.204" }]}
        emptyLabel="mavjud emas"
      />
    )

    // Assert
    expect(rowOf("Manzil").className).toContain("justify-between")
  })

  it("keeps a long-ish organisation name inline too", () => {
    // Arrange + Act — the exact pair that looked inconsistent on screen: the
    // same string appeared in two rows and only one of them wrapped.
    render(
      <DetailList
        rows={[
          {
            key: "isp",
            label: "Provayder",
            value: "Uzbektelekom Joint Stock Company"
          },
          {
            key: "org",
            label: "Tashkilot",
            value: "Uzbektelekom Joint Stock Company"
          }
        ]}
        emptyLabel="mavjud emas"
      />
    )

    // Assert — same value, same treatment.
    expect(rowOf("Provayder").className).toContain("justify-between")
    expect(rowOf("Tashkilot").className).toContain("justify-between")
  })

  it("gives a value too long to fit its own row", () => {
    // Arrange + Act
    render(
      <DetailList
        rows={[{ key: "userAgent", label: "User agent", value: LONG_VALUE }]}
        emptyLabel="mavjud emas"
      />
    )

    // Assert
    expect(rowOf("User agent").className).not.toContain("justify-between")
  })

  it("shows the empty label rather than dropping an unanswered row", () => {
    // Arrange + Act
    render(
      <DetailList
        rows={[{ key: "asn", label: "ASN", value: null }]}
        emptyLabel="mavjud emas"
      />
    )

    // Assert — a row that disappears reads as a bug; which field is missing
    // is often the interesting part.
    expect(screen.getByText("ASN")).toBeInTheDocument()
    expect(screen.getByText("mavjud emas")).toBeInTheDocument()
  })

  it("treats a null value as inline, so pending rows do not jump", () => {
    // Arrange + Act — placeholder rows render before the first answer, and a
    // layout that changed shape when the data arrived would defeat the point.
    render(
      <DetailList
        rows={[{ key: "city", label: "Shahar", value: null }]}
        emptyLabel="mavjud emas"
      />
    )

    // Assert
    expect(rowOf("Shahar").className).toContain("justify-between")
  })
})
