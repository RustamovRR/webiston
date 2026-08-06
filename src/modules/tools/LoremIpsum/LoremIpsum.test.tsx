import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/lorem-ipsum/uz.json"
import { LoremIpsum } from "./LoremIpsum"
import { useLoremDraftStore } from "./stores/loremDraftStore"

/**
 * The tool, driven the way a visitor drives it.
 */

const messages = { ...commonMessages, ...toolMessages }

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <LoremIpsum />
    </NextIntlClientProvider>
  )
}

const text = () => useLoremDraftStore.getState().text
const panel = () => screen.getByRole("region", { name: /namunaviy matn/i })
const chooseRadio = (name: RegExp) =>
  fireEvent.click(screen.getByRole("radio", { name }))

beforeEach(() => {
  useLoremDraftStore.getState().reset()
})

describe("the first text", () => {
  it("is on screen without the visitor pressing anything", () => {
    // Arrange & Act — a generator that opens empty asks for a click before it
    // has shown anything.
    renderTool()

    // Assert
    expect(text()).not.toBe("")
    expect(text().split("\n\n")).toHaveLength(3)
  })

  it("renders paragraphs as prose, not as one monospace block", () => {
    // Arrange & Act — plain filler is meant to be JUDGED by eye, so it is set
    // in the reading face at reading measure.
    renderTool()

    // Assert
    expect(within(panel()).getAllByText(/\w/, { selector: "p" }).length).toBe(3)
  })
})

describe("the controls", () => {
  it("regenerates when what is being asked for changes", () => {
    // Arrange
    renderTool()
    const before = text()

    // Act
    chooseRadio(/gap/i)

    // Assert
    expect(text()).not.toBe(before)
    expect(text()).not.toContain("\n\n")
  })

  it("does NOT regenerate when only the display format changes", () => {
    // Arrange
    renderTool()
    const before = text()

    // Act — switching plain to HTML is a display decision.
    chooseRadio(/html/i)

    // Assert
    expect(text()).toBe(before)
    expect(panel()).toHaveTextContent("<p>")
  })

  it("hides the classic opening toggle for a list that is not Latin", () => {
    // Arrange — the old tool offered it for all five word lists and then
    // ignored it on four of them.
    renderTool()
    expect(screen.getByLabelText(/lorem ipsum/i)).toBeInTheDocument()

    // Act
    fireEvent.change(screen.getByLabelText(/so'zlar/i), {
      target: { value: "uzbek" }
    })

    // Assert
    expect(screen.queryByLabelText(/lorem ipsum/i)).toBeNull()
    expect(text().toLowerCase()).not.toContain("lorem ipsum")
  })

  it("re-clamps the amount when the unit changes under it", () => {
    // Arrange — 3 bytes is not a document, and 5,000 paragraphs is not a
    // request anyone meant to make.
    renderTool()

    // Act
    chooseRadio(/bayt/i)

    // Assert
    expect(useLoremDraftStore.getState().amount).toBe(512)
    expect(new TextEncoder().encode(text()).length).toBe(512)
  })
})

describe("the Cyrillic list", () => {
  it("writes Uzbek in the other alphabet, derived from the same words", () => {
    // Arrange & Act — plenty of Uzbek publishing is still Cyrillic, and no
    // competitor offers filler in it.
    renderTool()
    fireEvent.change(screen.getByLabelText(/so'zlar/i), {
      target: { value: "uzbekCyrillic" }
    })

    // Assert
    expect(text()).toMatch(/[а-яёқғҳў]/i)
    expect(text()).not.toMatch(/[a-z]{3}/i)
  })
})

describe("state that has to survive", () => {
  it("keeps the text across the remount a locale switch performs", () => {
    // Arrange
    const { unmount } = renderTool()
    const before = text()

    // Act
    unmount()
    renderTool()

    // Assert
    expect(text()).toBe(before)
  })
})

describe("no message renders as its own key", () => {
  it("keeps every label out of key-path fallback", () => {
    // Arrange & Act — next-intl renders the KEY PATH when a message fails to
    // parse; a `<p>` in the HTML answer is enough to cause it.
    renderTool()

    // Assert
    expect(document.body.textContent).not.toContain("LoremIpsumPage.")
  })
})
