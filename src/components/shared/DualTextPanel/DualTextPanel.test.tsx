import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import common from "../../../../messages/common/uz.json"
import { DualTextPanel } from "./DualTextPanel"

/**
 * The panel five tools share: Latin↔Cyrillic, Base64, URL encode, hashes, JSON.
 *
 * Only the parts that are behaviour live here. The reading window — the change
 * that took a converted article out of a 200px porthole on a phone — is a
 * height computed by the browser, and jsdom lays nothing out, so it was
 * measured on the running page instead of faked with a class assertion here.
 */

function renderPanel(props: Partial<Parameters<typeof DualTextPanel>[0]> = {}) {
  return render(
    <NextIntlClientProvider locale="uz" messages={common}>
      <DualTextPanel
        sourceText="salom"
        convertedText="салом"
        sourcePlaceholder="Matn kiriting"
        sourceLabel="Lotin matn"
        targetLabel="Kirill natija"
        onSourceChange={() => {}}
        {...props}
      />
    </NextIntlClientProvider>
  )
}

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
  })
})

describe("DualTextPanel", () => {
  /**
   * The button was icon-only and `ghost` — the lowest-emphasis treatment in the
   * system — for the action every one of these tools exists to end with. Most
   * visitors are not developers, and two overlapping squares is a developer
   * convention with no meaning outside software. A person who cannot find it
   * scrolls the result and selects it by hand, which is what the analytics
   * looked like.
   */
  it("says what the copy button does, in words", () => {
    // Arrange / Act
    renderPanel()

    // Assert — the visible text, not only the accessible name.
    expect(
      screen.getByRole("button", { name: /nusxalash/i })
    ).toHaveTextContent(/nusxalash/i)
  })

  it("copies the converted text, not the source", async () => {
    // Arrange
    renderPanel()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /nusxalash/i }))

    // Assert
    await vi.waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("салом")
    )
  })

  it("offers nothing to copy before there is a result", () => {
    // Arrange / Act — a button that silently does nothing is worse than a
    // button that is visibly unavailable.
    renderPanel({ convertedText: "" })

    // Assert
    expect(screen.getByRole("button", { name: /nusxalash/i })).toBeDisabled()
  })

  /**
   * Two of the five tools render their own target content — a digest list and
   * a JSON tree — and they take a different layout path from plain text. This
   * is the regression guard for them.
   */
  it("renders a tool's own target content untouched", () => {
    // Arrange / Act
    renderPanel({
      customTargetContent: <p>maxsus natija</p>
    })

    // Assert
    expect(screen.getByText("maxsus natija")).toBeInTheDocument()
  })

  it("shows the empty state instead of an empty box", () => {
    // Arrange / Act
    renderPanel({ convertedText: "", sourceText: "" })

    // Assert
    expect(screen.getByText(common.Common.resultWillAppear)).toBeInTheDocument()
  })
})
