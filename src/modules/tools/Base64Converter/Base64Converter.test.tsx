import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/base64-converter/uz.json"
import { Base64Converter } from "./Base64Converter"
import { useBase64DraftStore } from "./stores/base64DraftStore"

/**
 * The tool, driven the way a visitor drives it.
 *
 * Everything asserted here is a defect this tool actually shipped: base64url
 * rejected as "invalid format", binary payloads decoded into mojibake and
 * presented as success, a size readout that counted UTF-16 code units and
 * called them KB, and a draft that vanished on a locale switch. None of them
 * are visible to a unit test of the maths — they live in the wiring.
 */

/** `DualTextPanel` reads the shared `Common` namespace for its own chrome. */
const messages = { ...commonMessages, ...toolMessages }

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Base64Converter />
    </NextIntlClientProvider>
  )
}

/** `fireEvent`, not `user-event`: the latter is not a dependency of this repo. */
const type = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } })

const source = () =>
  screen.getByRole("textbox", { name: /Oddiy matn|Base64 matn/i })

const output = () => screen.getByRole("region", { name: /natija/i })

const chooseDirection = (label: string) =>
  fireEvent.click(screen.getByRole("radio", { name: label }))

beforeEach(() => {
  // The draft store is module scope on purpose (it survives the locale
  // remount), which means it also survives between tests.
  useBase64DraftStore.getState().reset()
})

describe("encoding", () => {
  it("encodes UTF-8 rather than throwing on a non-Latin-1 character", () => {
    // Arrange + Act — bare `btoa` throws on every one of these
    renderTool()
    type(source(), "Oʻzbekiston")

    // Assert — `Oʻ` is O + U+02BB, so the first three bytes are 4F CA BB and
    // the first group of four characters is T8q7
    expect(output()).toHaveTextContent("T8q7emJla2lzdG9u")
  })

  it("switches to the URL-safe alphabet on request", () => {
    // Arrange
    renderTool()
    type(source(), "~~~?>>>???")
    expect(output().textContent).toMatch(/[+/]/)

    // Act
    fireEvent.click(
      screen.getByRole("checkbox", { name: /URL uchun xavfsiz/i })
    )

    // Assert — base64url swaps +/ for -_ and drops the padding
    expect(output().textContent).not.toMatch(/[+/=]/)
  })

  it("reports both sizes in BYTES", () => {
    // Arrange + Act — the old footer divided the string length by 1024 and
    // called it KB, so a Cyrillic character counted as one byte of the two it
    // actually costs
    renderTool()
    type(source(), "Ўзбекистон")

    // Assert — ten characters, twenty bytes. `formatFileSize` from lib/utils
    // renders the unit, so this also pins that the tool no longer carries its
    // own sixth copy of that formatter.
    expect(screen.getByText("20 B")).toBeInTheDocument()
  })
})

describe("decoding", () => {
  it("accepts the base64url a JWT is made of", () => {
    // Arrange
    renderTool()
    chooseDirection("Dekodlash")

    // Act — the shipped validator was /^[A-Za-z0-9+/]*={0,2}$/, so any `-` or
    // `_` reported "invalid Base64 format"
    type(source(), "eyJzdWIiOiIxMjM0NTY3ODkwIn0")

    // Assert
    expect(output()).toHaveTextContent('{"sub":"1234567890"}')
  })

  it("says the bytes are not text instead of showing mojibake", () => {
    // Arrange
    renderTool()
    chooseDirection("Dekodlash")

    // Act — valid base64 of a PNG header
    type(source(), "iVBORw8=")

    // Assert — `escape`-based decoding mapped every byte to some character and
    // presented pages of garbage as a successful conversion
    expect(screen.getByRole("alert")).toHaveTextContent(/baytlar matn emas/i)
  })

  it("names a truncated paste as a length problem", () => {
    // Arrange
    renderTool()
    chooseDirection("Dekodlash")

    // Act — four characters stand for three bytes, so a remainder of one
    // cannot occur
    type(source(), "QQQQQ")

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/tugallanmagan/i)
  })
})

describe("direction and swap are two different jobs", () => {
  it("choosing a direction leaves the visitor's text alone", () => {
    // Arrange
    renderTool()
    type(source(), "Ali")
    expect(output()).toHaveTextContent("QWxp")

    // Act — the first version wired this control to the SWAP handler and
    // ignored the value it was handed, so picking a direction silently
    // rewrote the input
    chooseDirection("Dekodlash")

    // Assert — the text is untouched and the direction really changed.
    // (`Ali` happens to BE valid base64 — it decodes to 0x02 0x58 — which is
    // why this asserts the direction rather than an error.)
    expect(source()).toHaveValue("Ali")
    expect(screen.getByRole("radio", { name: "Dekodlash" })).toBeChecked()
  })

  it("the swap arrow takes the result back as input", () => {
    // Arrange
    renderTool()
    type(source(), "Ali")

    // Act
    fireEvent.click(
      screen.getByRole("button", { name: "Yo'nalishni almashtirish" })
    )

    // Assert — the round trip is what that button is for
    expect(source()).toHaveValue("QWxp")
    expect(output()).toHaveTextContent("Ali")
  })
})

describe("pasted data URIs", () => {
  it("decodes a data URI without making the visitor trim the prefix", () => {
    // Arrange — the shape base64 usually arrives in: copied from a stylesheet,
    // an <img src> or devtools. The alphabet rule would reject the prefix.
    renderTool()
    chooseDirection("Dekodlash")

    // Act
    type(source(), "data:text/plain;charset=utf-8;base64,QWxp")

    // Assert
    expect(output()).toHaveTextContent("Ali")
  })
})

describe("draft survival", () => {
  it("keeps the work across a remount, which is what a locale switch is", () => {
    // Arrange
    const { unmount } = renderTool()
    type(source(), "Assalomu alaykum")

    // Act
    unmount()
    renderTool()

    // Assert
    expect(source()).toHaveValue("Assalomu alaykum")
  })
})
