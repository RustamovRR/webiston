import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/uuid-generator/uz.json"
import { useUuidDraftStore } from "./stores/uuidDraftStore"
import { UuidGenerator } from "./UuidGenerator"

/**
 * The tool, driven the way a visitor drives it.
 *
 * Two of these pin defects that shipped: the batch not following the version
 * control, and the format control not applying to values already on screen.
 */

const messages = { ...commonMessages, ...toolMessages }

/** RFC 9562 §A.6 — decodes to 2022-02-22 19:22:22 UTC. */
const RFC_V7 = "017F22E2-79B0-7CC3-98C4-DC0C0C07398F"

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <UuidGenerator />
    </NextIntlClientProvider>
  )
}

const chooseRadio = (name: RegExp) =>
  fireEvent.click(screen.getByRole("radio", { name }))

const values = () => useUuidDraftStore.getState().values

const inspectField = () =>
  screen.getByRole("textbox", { name: /tahlil qilish/i })

beforeEach(() => {
  useUuidDraftStore.getState().reset()
})

describe("the first batch", () => {
  it("is on screen without the visitor pressing anything", () => {
    // Arrange & Act — a generator that opens empty asks for a click before it
    // has shown anything.
    renderTool()

    // Assert
    expect(values()).toHaveLength(5)
    expect(screen.getByText(values()[0])).toBeInTheDocument()
  })

  it("gives every value its own copy button", () => {
    // Arrange & Act — the old panel printed the batch into one <pre>, so
    // taking a single identifier meant selecting 36 characters by hand.
    renderTool()

    // Assert
    expect(screen.getAllByRole("button", { name: "Nusxalash" })).toHaveLength(5)
  })
})

describe("the batch follows the controls", () => {
  it("regenerates when the version changes", () => {
    // Arrange
    renderTool()
    const before = values()

    // Act
    chooseRadio(/v7/)

    // Assert — choosing v7 and being left looking at v4 values reads as a
    // broken control, not a pending one.
    expect(values()).not.toEqual(before)
    expect(values()[0][14]).toBe("7")
  })

  it("reformats without regenerating when the format changes", () => {
    // Arrange
    renderTool()
    const before = values()

    // Act — the store held pre-formatted strings before this, so switching
    // format left the old shape on screen until the next generate.
    chooseRadio(/tiresiz/i)

    // Assert
    expect(values()).toEqual(before)
    expect(screen.getByText(before[0].replace(/-/g, ""))).toBeInTheDocument()
  })

  it("treats case as its own axis, so compact + uppercase is reachable", () => {
    // Arrange
    renderTool()

    // Act
    chooseRadio(/tiresiz/i)
    fireEvent.click(screen.getByRole("button", { name: /katta harf/i }))

    // Assert
    expect(
      screen.getByText(values()[0].replace(/-/g, "").toUpperCase())
    ).toBeInTheDocument()
  })

  it("gives a single value the panel to itself", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.click(screen.getByRole("button", { name: "1" }))

    // Assert
    expect(values()).toHaveLength(1)
    expect(screen.getByRole("status")).toHaveTextContent(values()[0])
  })
})

describe("the inspector", () => {
  it("names the version and the creation time of a pasted UUID", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(inspectField(), { target: { value: RFC_V7 } })

    // Assert — the page advertised "UUID validation" in its structured data
    // and had no field to paste a UUID into.
    const verdict = screen.getByRole("status")
    expect(verdict).toHaveTextContent("UUID v7")
    expect(verdict).toHaveTextContent("2022")
    expect(verdict).toHaveTextContent(RFC_V7.toLowerCase())
  })

  it("says what is wrong instead of going quiet", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(inspectField(), { target: { value: "not-a-uuid" } })

    // Assert
    expect(screen.getByRole("status")).toHaveTextContent(/32 ta/)
  })

  it("accepts the Nil UUID, which the shipped validator rejected", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(inspectField(), {
      target: { value: "00000000-0000-0000-0000-000000000000" }
    })

    // Assert
    expect(screen.getByRole("status")).toHaveTextContent(/Nil UUID/)
  })
})

describe("state that has to survive", () => {
  it("keeps the batch across the remount a locale switch performs", () => {
    // Arrange
    const { unmount } = renderTool()
    const before = values()

    // Act — switching language is a soft navigation that remounts the tree.
    unmount()
    renderTool()

    // Assert
    expect(values()).toEqual(before)
    expect(screen.getByText(before[0])).toBeInTheDocument()
  })

  it("clears both panels on Escape, and the batch does not come back on its own", () => {
    // Arrange
    renderTool()
    fireEvent.change(inspectField(), { target: { value: RFC_V7 } })

    // Act
    fireEvent.keyDown(screen.getByRole("region", { name: /v4/i }), {
      key: "Escape"
    })

    // Assert
    expect(values()).toHaveLength(0)
    expect(inspectField()).toHaveValue("")
  })
})

describe("a large batch", () => {
  it("puts one screenful in the DOM, not a thousand rows", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(screen.getByRole("spinbutton", { name: /nechta/i }), {
      target: { value: "1000" }
    })

    // Assert — 1000 rows, each with a copy button, is 1000 mounted components
    // for a list nobody scrolls to the end of.
    expect(values()).toHaveLength(1000)
    const list = screen.getByRole("list")
    expect(within(list).getAllByRole("listitem")).toHaveLength(100)
    expect(
      screen.getByRole("button", { name: /yana 100 ta/i })
    ).toBeInTheDocument()
  })
})
