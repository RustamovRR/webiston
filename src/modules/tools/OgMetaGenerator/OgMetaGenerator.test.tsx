import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/og-meta-generator/uz.json"
import { OgMetaGenerator } from "./OgMetaGenerator"
import { useOgDraftStore } from "./stores/ogDraftStore"

/**
 * The tool, driven the way a visitor drives it.
 *
 * The first test is the one that matters: what shipped here built every tag
 * as `content="${value}"` with no escaping, so a title containing a straight
 * quote produced markup that breaks the moment it is pasted into a `<head>`.
 */

const messages = { ...commonMessages, ...toolMessages }

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <OgMetaGenerator />
    </NextIntlClientProvider>
  )
}

const field = (name: RegExp) => screen.getByLabelText(name)
const type = (name: RegExp, value: string) =>
  fireEvent.change(field(name), { target: { value } })

const output = () => screen.getByRole("region", { name: /natija/i })
const checks = () => screen.getByRole("region", { name: /tekshiruv/i })

beforeEach(() => {
  useOgDraftStore.getState().reset()
})

describe("the tags it writes", () => {
  it("escapes a quote instead of ending the attribute with it", () => {
    // Arrange & Act
    renderTool()
    type(/^sarlavha/i, 'React "Hooks" & Context')

    // Assert
    expect(output()).toHaveTextContent(
      'content="React &quot;Hooks&quot; &amp; Context"'
    )
  })

  it("writes no tag for a field the visitor left empty", () => {
    // Arrange & Act — the old generator always appended robots and googlebot
    // lines, and printed section headings above empty sections.
    renderTool()

    // Assert
    const text = output().textContent ?? ""
    expect(text).not.toContain("robots")
    expect(text).not.toContain("og:title")
    expect(text).toContain("og:type")
  })

  it("invents no properties for a type that has its own", () => {
    // Arrange
    renderTool()
    type(/^sarlavha/i, "Kitob haqida")

    // Act — choosing `book` used to add `book:isbn content="978-0000000000"`,
    // and `profile` added `profile:first_name content="First"`.
    fireEvent.change(field(/kontent turi/i), { target: { value: "book" } })

    // Assert
    const text = output().textContent ?? ""
    expect(text).toContain('content="book"')
    expect(text).not.toContain("book:isbn")
  })

  it("switches to the Next.js metadata shape, escaped for JavaScript", () => {
    // Arrange
    renderTool()
    type(/^sarlavha/i, 'React "Hooks"')

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Next.js" }))

    // Assert
    const text = output().textContent ?? ""
    expect(text).toContain("export const metadata: Metadata")
    expect(text).toContain('title: "React \\"Hooks\\""')
    expect(text).not.toContain("&quot;")
  })
})

describe("the checks", () => {
  it("names a relative image URL, the commonest reason a card has no picture", () => {
    // Arrange & Act
    renderTool()
    type(/rasm manzili/i, "/og.png")

    // Assert
    expect(checks()).toHaveTextContent(/nisbiy/i)
  })

  it("says the large card has no image to be large with", () => {
    // Arrange & Act
    renderTool()
    type(/^sarlavha/i, "Sarlavha")

    // Assert
    expect(checks()).toHaveTextContent(/katta rasm/i)
  })

  it("reports a long title as a warning, and still accepts every character", () => {
    // Arrange — the old form REFUSED keystrokes past 70 characters and called
    // an error callback that was wired to nothing.
    renderTool()
    const long = "a".repeat(95)

    // Act
    type(/^sarlavha/i, long)

    // Assert
    expect(field(/^sarlavha/i)).toHaveValue(long)
    expect(checks()).toHaveTextContent(/95/)
  })
})

describe("the preview", () => {
  it("truncates the title the way the chosen platform does", () => {
    // Arrange
    renderTool()
    const title = "A".repeat(120)
    type(/^sarlavha/i, title)
    const card = screen.getByRole("region", { name: /ulashish kartasi/i })

    // Act — Telegram cuts at 90, X at 70, so the same title differs.
    const onTelegram = within(card).getByText(/^A+…$/).textContent ?? ""
    fireEvent.click(screen.getByRole("radio", { name: "X" }))
    const onX = within(card).getByText(/^A+…$/).textContent ?? ""

    // Assert
    expect(onTelegram.length).toBe(90)
    expect(onX.length).toBe(70)
  })
})

describe("state that has to survive", () => {
  it("keeps the form across the remount a locale switch performs", () => {
    // Arrange
    const { unmount } = renderTool()
    type(/^sarlavha/i, "Saqlanishi kerak")

    // Act
    unmount()
    renderTool()

    // Assert — ten fields of hand-written copy used to vanish on a language
    // click, because the whole form lived in `useState`.
    expect(field(/^sarlavha/i)).toHaveValue("Saqlanishi kerak")
  })
})
