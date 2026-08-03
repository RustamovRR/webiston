import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/url-encoder/uz.json"
import { useUrlDraftStore } from "./stores/urlDraftStore"
import { UrlEncoder } from "./UrlEncoder"

/**
 * The tool, driven the way a visitor drives it.
 *
 * The two defects at the top are the ones that made this tool wrong rather
 * than merely dated: one encoder for two different jobs, and a decoder that
 * ignored the `+` every browser puts in a query string.
 */

const messages = { ...commonMessages, ...toolMessages }

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <UrlEncoder />
    </NextIntlClientProvider>
  )
}

const source = () =>
  screen.getByRole("textbox", { name: /Oddiy matn|Kodlangan matn/i })

const output = () => screen.getByRole("region", { name: /natija/i })

const type = (value: string) =>
  fireEvent.change(source(), { target: { value } })

const choose = (label: string) =>
  fireEvent.click(screen.getByRole("radio", { name: label }))

beforeEach(() => {
  useUrlDraftStore.getState().reset()
})

describe("the tool decides, and says what it decided", () => {
  const WHOLE = "https://webiston.uz/search?q=hello world&lang=uz"

  it("keeps a pasted link usable without being told to", () => {
    // Arrange + Act — no controls touched. The first rebuild defaulted to
    // value encoding, so pasting a link produced https%3A%2F%2F… and the
    // person who came to fix a space got something unusable.
    renderTool()
    type(WHOLE)

    // Assert — only the space moves
    expect(output()).toHaveTextContent(
      "https://webiston.uz/search?q=hello%20world&lang=uz"
    )
  })

  it("still escapes the separators when asked for a value", () => {
    // Arrange + Act — the override, correct when embedding a link as a
    // parameter of another URL
    renderTool()
    type(WHOLE)
    choose("Qiymat")

    // Assert
    expect(output()).toHaveTextContent("https%3A%2F%2Fwebiston.uz")
  })

  it("turns itself to decoding when the input is escaped", () => {
    // Arrange + Act — the whole point of Avto
    renderTool()
    type("hello%20world")

    // Assert
    expect(output()).toHaveTextContent("hello world")
    expect(screen.getByText(/Avto: ochilmoqda/i)).toBeInTheDocument()
  })
})

describe("saying what happened", () => {
  it("names the no-op instead of looking broken", () => {
    // Arrange + Act — the reported bug: decoding text that was never encoded
    // returns it verbatim, so both panels showed the same 108 characters and
    // the tool looked like it was doing nothing
    renderTool()
    choose("Dekodlash")
    type("https://webiston.uz/jira/boards/112")

    // Assert
    expect(screen.getByText(/ochiladigan narsa yo'q/i)).toBeInTheDocument()
  })

  it("uses the right sentence for a no-op while ENCODING", () => {
    // Arrange + Act — `encodeURIComponent("hello")` also returns it verbatim,
    // and "nothing to decode" is the wrong sentence for that
    renderTool()
    type("hello")

    // Assert
    expect(
      screen.getByText(/kodlanishi kerak bo'lgan belgi yo'q/i)
    ).toBeInTheDocument()
  })

  it("keeps the breakdown when the scope is overridden to value", () => {
    // Arrange
    renderTool()
    type("https://webiston.uz/a?b=1")

    // Act — the output becomes https%3A%2F%2F…, which is not a URL
    choose("Qiymat")

    // Assert — the INPUT still is one, so the panel stays
    expect(
      screen.getByRole("region", { name: /URL tarkibi/i })
    ).toBeInTheDocument()
  })

  it("spots a double-encoded URL and offers the second pass", () => {
    // Arrange — %2520 is %20 that went through an encoder twice: a redirect
    // parameter, a proxy, a form posting its own action
    renderTool()
    type("hello%2520world")

    // Assert
    expect(screen.getByText(/ikki marta kodlangan/i)).toBeInTheDocument()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Yana bir marta/i }))

    // Assert — one click, no explanation needed
    expect(output()).toHaveTextContent("hello world")
  })
})

describe("decoding", () => {
  it("reads + as a space in value mode", () => {
    // Arrange
    renderTool()
    choose("Dekodlash")

    // Act — `decodeURIComponent("Ali+Valiyev")` returns it unchanged, so every
    // query string copied out of an address bar decoded wrong, silently
    type("Ali+Valiyev")

    // Assert
    expect(output()).toHaveTextContent("Ali Valiyev")
  })

  it("reports a broken escape instead of failing silently", () => {
    // Arrange + Act
    renderTool()
    choose("Dekodlash")
    type("100%")

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/yolg'iz %/i)
  })
})

describe("the breakdown", () => {
  it("splits the query into one row per parameter", () => {
    // Arrange — the old tool parsed the URL and then printed the query as one
    // opaque blob, which is the thing a person came here to read
    renderTool()
    choose("Dekodlash")

    // Act — the structure is read from the ENCODED side, so a value holding
    // %26 stays ONE parameter instead of splitting into two
    type("https://webiston.uz/search?q=Ali+Valiyev&tag=a&tag=b")

    // Assert — including the repeated key, which a plain object would collapse
    const panel = screen.getByRole("region", { name: /URL tarkibi/i })
    expect(within(panel).getByText("webiston.uz")).toBeInTheDocument()
    expect(within(panel).getByText("Ali Valiyev")).toBeInTheDocument()
    expect(within(panel).getAllByText("tag")).toHaveLength(2)
  })

  it("stays away when the text is not a URL", () => {
    // Arrange + Act
    renderTool()
    type("just some text")

    // Assert — it never guesses that something is a URL
    expect(screen.queryByRole("region", { name: /URL tarkibi/i })).toBeNull()
  })
})

describe("direction and swap are two different jobs", () => {
  it("choosing a direction leaves the input alone", () => {
    // Arrange
    renderTool()
    type("hello world")

    // Act
    choose("Dekodlash")

    // Assert
    expect(source()).toHaveValue("hello world")
  })

  it("the swap arrow takes the result back as input", () => {
    // Arrange
    renderTool()
    type("hello world")

    // Act
    fireEvent.click(
      screen.getByRole("button", { name: "Yo'nalishni almashtirish" })
    )

    // Assert — and it pins the opposite direction rather than leaving Avto to
    // flip straight back
    expect(source()).toHaveValue("hello%20world")
    expect(output()).toHaveTextContent("hello world")
    expect(screen.getByRole("radio", { name: "Dekodlash" })).toBeChecked()
  })
})

describe("draft survival", () => {
  it("keeps the work across a remount, which is what a locale switch is", () => {
    // Arrange
    const { unmount } = renderTool()
    type("https://webiston.uz")

    // Act
    unmount()
    renderTool()

    // Assert
    expect(source()).toHaveValue("https://webiston.uz")
  })
})
