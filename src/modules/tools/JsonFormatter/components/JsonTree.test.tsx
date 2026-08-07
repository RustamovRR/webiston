import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"

import messages from "../../../../../messages/tools/json-formatter/uz.json"
import { JsonTree } from "./JsonTree"

/**
 * The tree's large-document guards, pinned. Without them a 5,000-item array
 * at depth 2 rendered every row on mount — measured live: the view switch
 * took 3.95 s and put 180,000 nodes in the DOM.
 */

function renderTree(value: unknown) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <JsonTree value={value} />
    </NextIntlClientProvider>
  )
}

describe("JsonTree", () => {
  it("opens a small document to the overview depth", () => {
    // Arrange + Act
    renderTree({ a: { b: { c: 1 } } })

    // Assert — depth-0 and depth-1 branches arrive open
    const expanders = screen.getAllByRole("button")
    expect(expanders[0]).toHaveAttribute("aria-expanded", "true")
    expect(expanders[1]).toHaveAttribute("aria-expanded", "true")
  })

  it("starts a branch with many children folded, regardless of depth", () => {
    // Arrange
    const wide = { items: Array.from({ length: 60 }, (_, i) => i) }

    // Act
    renderTree(wide)

    // Assert — the 60-item branch is folded and shows its count instead
    const itemsRow = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("items"))
    expect(itemsRow).toHaveAttribute("aria-expanded", "false")
    expect(itemsRow).toHaveTextContent("60 element")
  })

  it("reveals a large branch in slices, not all at once", () => {
    // Arrange — 150 children: one chunk of 100, then the remaining 50
    const wide = Array.from({ length: 150 }, (_, i) => i)
    renderTree(wide)

    // Act — open the folded root
    fireEvent.click(screen.getAllByRole("button")[0])

    // Assert — first chunk plus the "show more" row naming the remainder
    expect(screen.getByText("99")).toBeInTheDocument()
    expect(screen.queryByText("100")).toBeNull()
    const more = screen.getByText(/Yana 50 ta/)
    expect(more).toHaveTextContent("50 ta qoldi")

    // Act — reveal the rest
    fireEvent.click(more)

    // Assert
    expect(screen.getByText("149")).toBeInTheDocument()
    expect(screen.queryByText(/Yana/)).toBeNull()
  })
})
