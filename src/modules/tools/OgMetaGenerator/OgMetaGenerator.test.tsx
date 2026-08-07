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
  // The draft is mirrored into the address bar, so a query string left by one
  // test would be read back as the starting draft of the next.
  window.history.replaceState(null, "", "/")
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

describe("a slow image", () => {
  it("says it is loading instead of reporting that there is none", () => {
    // Arrange & Act — the owner hit this with a real URL that took a second
    // to answer: the card said "Rasm yo'q" while the image was still on its
    // way, so the tool reported an absent picture it was in the middle of
    // fetching.
    renderTool()
    type(/rasm manzili/i, "https://webiston.uz/api/og?title=Salom")

    // Assert
    const card = screen.getByRole("region", { name: /ulashish kartasi/i })
    expect(within(card).getByText(/yuklanmoqda/i)).toBeInTheDocument()
    expect(within(card).queryByText("Rasm yo'q")).toBeNull()
    expect(checks()).toHaveTextContent(/yuklanmoqda va o'lchanmoqda/i)
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

describe("no message renders as its own key", () => {
  it("keeps every label out of key-path fallback", () => {
    // Arrange & Act — next-intl renders the KEY PATH when a message fails to
    // parse, and two things here made that happen: a dot inside a key
    // (`types.video.other` reads as nesting, so the Video option printed
    // `OgMetaGeneratorPage.form.types.video.other` into the select) and a
    // message containing `<head>`, which ICU treats as a rich-text tag with
    // no handler. Both shipped; this catches the whole class.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /import/i }))

    // Assert
    expect(document.body.textContent).not.toContain("OgMetaGeneratorPage.")
    expect(screen.getByRole("option", { name: "Video" })).toBeInTheDocument()
  })
})

describe("importing an existing head", () => {
  it("fills the form from pasted tags", () => {
    // Arrange — the workflow nobody starts without: you already have a page,
    // it shares badly, and you want to fix the tags that are on it.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /import/i }))

    // Act
    fireEvent.change(screen.getByLabelText(/shu yerga qo'ying/i), {
      target: {
        value: `<meta property="og:title" content="Mavjud sarlavha">
                <meta property="og:image" content="https://example.uz/og.png">`
      }
    })
    fireEvent.click(screen.getByRole("button", { name: "O'qish" }))

    // Assert
    expect(field(/^sarlavha/i)).toHaveValue("Mavjud sarlavha")
    expect(field(/rasm manzili/i)).toHaveValue("https://example.uz/og.png")
    expect(screen.getByRole("status")).toHaveTextContent(/2 ta maydon/)
  })

  it("says so when the paste held nothing it recognises", () => {
    // Arrange — a form that simply does not change is indistinguishable from
    // a broken button.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /import/i }))

    // Act
    fireEvent.change(screen.getByLabelText(/shu yerga qo'ying/i), {
      target: { value: "<p>salom</p>" }
    })
    fireEvent.click(screen.getByRole("button", { name: "O'qish" }))

    // Assert
    expect(screen.getByRole("status")).toHaveTextContent(/topilmadi/i)
  })

  it("leaves fields the paste did not mention alone", () => {
    // Arrange
    renderTool()
    type(/sayt nomi/i, "Qo'lda yozilgan")
    fireEvent.click(screen.getByRole("button", { name: /import/i }))

    // Act
    fireEvent.change(screen.getByLabelText(/shu yerga qo'ying/i), {
      target: { value: '<meta property="og:title" content="Faqat sarlavha">' }
    })
    fireEvent.click(screen.getByRole("button", { name: "O'qish" }))

    // Assert — a patch, not a replacement.
    expect(field(/sayt nomi/i)).toHaveValue("Qo'lda yozilgan")
  })
})

describe("the re-scrape links", () => {
  it("appear only once there is a real URL, carrying that URL", () => {
    // Arrange & Act
    renderTool()
    expect(screen.queryByRole("link", { name: /facebook/i })).toBeNull()
    type(/sahifa manzili/i, "https://example.uz/blog/post")

    // Assert
    expect(screen.getByRole("link", { name: /facebook/i })).toHaveAttribute(
      "href",
      "https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fexample.uz%2Fblog%2Fpost"
    )
    // Telegram has no web debugger — refreshing a preview means @WebpageBot.
    expect(screen.getByRole("link", { name: /telegram/i })).toHaveAttribute(
      "href",
      "https://t.me/WebpageBot"
    )
  })
})

describe("the shareable link", () => {
  it("mirrors the draft into the address bar", () => {
    // Arrange & Act — a share card is rarely a solo decision: someone writes
    // the copy, someone else owns the page.
    renderTool()
    type(/^sarlavha/i, "Ulashiladigan sarlavha")

    // Assert
    expect(window.location.search).toContain("t=Ulashiladigan+sarlavha")
  })

  it("restores a draft from the query string on arrival", () => {
    // Arrange — the link a colleague was sent.
    window.history.replaceState(null, "", "/?t=Kelgan&ty=article&loc=en_US")

    // Act
    renderTool()

    // Assert
    expect(field(/^sarlavha/i)).toHaveValue("Kelgan")
    expect(field(/kontent turi/i)).toHaveValue("article")
  })

  it("ignores values the form's own options cannot express", () => {
    // Arrange — the same rule the importer follows.
    window.history.replaceState(null, "", "/?t=Bor&ty=music.song&loc=uz-UZ")

    // Act
    renderTool()

    // Assert
    expect(field(/^sarlavha/i)).toHaveValue("Bor")
    expect(field(/kontent turi/i)).toHaveValue("website")
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
