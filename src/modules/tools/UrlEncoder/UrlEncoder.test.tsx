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

describe("the two encodings", () => {
  const WHOLE = "https://webiston.uz/search?q=hello world&lang=uz"

  it("keeps a whole URL usable in whole-URL mode", () => {
    // Arrange
    renderTool()

    // Act — this exact string is the tool's own sample, and the old version
    // ran `encodeURIComponent` over it
    type(WHOLE)
    choose("To'liq URL")

    // Assert — only the space moves
    expect(output()).toHaveTextContent(
      "https://webiston.uz/search?q=hello%20world&lang=uz"
    )
  })

  it("escapes the separators in value mode", () => {
    // Arrange + Act — the default, and correct when embedding a link as a
    // parameter value
    renderTool()
    type(WHOLE)

    // Assert
    expect(output()).toHaveTextContent("https%3A%2F%2Fwebiston.uz")
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

    // Act
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

    // Assert
    expect(source()).toHaveValue("hello%20world")
    expect(output()).toHaveTextContent("hello world")
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
