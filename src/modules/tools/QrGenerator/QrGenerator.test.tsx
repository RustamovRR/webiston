import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import messages from "../../../../messages/tools/qr-generator/uz.json"
import { DEFAULT_STYLE } from "./constants"
import { QrGenerator } from "./QrGenerator"
import { useQrDraftStore } from "./stores/qrDraftStore"

/**
 * The tool, driven the way a visitor drives it.
 *
 * This is the repo's first integration test and it is deliberately the shape
 * `testing-strategy.md` asks for — the Trophy's fat layer. Everything here
 * goes through the rendered UI: type in the box, click a swatch, press clear.
 * None of it reaches into the hook or the store to assert, because the bugs
 * this tool has actually shipped were all in the wiring — a preset that did
 * not clear a gradient, a swap button that was enabled on empty input, a
 * locale switch that emptied the field — and no unit test can see wiring.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <QrGenerator />
    </NextIntlClientProvider>
  )
}

/**
 * `fireEvent`, not `user-event`.
 *
 * `@testing-library/user-event` is the more faithful driver, but it is not a
 * dependency of this repo and these flows — type, click, clear — do not need
 * per-keystroke fidelity to prove the wiring. Adding a package to write the
 * first test in `src/` is the wrong trade.
 */
const type = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } })

/** The code itself, or null when the empty state is showing. */
const codeSvg = () => screen.queryByRole("img")

const input = () => screen.getByRole("textbox", { name: /QR Kod Kirish/i })

beforeEach(() => {
  // The draft store is module scope on purpose (it survives the locale
  // remount), which means it also survives between tests.
  useQrDraftStore.setState({ value: "", style: DEFAULT_STYLE })
})

describe("QR generator", () => {
  it("shows the empty state until there is something to encode", () => {
    // Arrange + Act
    renderTool()

    // Assert
    expect(codeSvg()).toBeNull()
    expect(screen.getByText(/Matn kiriting/i)).toBeInTheDocument()
  })

  it("draws a code as soon as the visitor types", async () => {
    // Arrange
    renderTool()

    // Act
    type(input(), "https://webiston.uz")

    // Assert — a real path, and the module count the encoder chose
    const svg = codeSvg()
    expect(svg).not.toBeNull()
    expect(
      svg?.querySelector("path")?.getAttribute("d")?.length
    ).toBeGreaterThan(100)
    expect(screen.getByText(/×.*modul/)).toBeInTheDocument()
  })

  it("classifies the payload for the badge", async () => {
    // Arrange
    renderTool()

    // Act
    type(input(), "info@webiston.uz")

    // Assert
    expect(screen.getByText("email")).toBeInTheDocument()
  })

  it("grows the symbol when the payload no longer fits", async () => {
    // Arrange
    renderTool()
    type(input(), "hi")
    const small = screen.getByText(/×.*modul/).textContent

    // Act
    type(input(), "")
    type(input(), "x".repeat(120))

    // Assert — the version is chosen by the data, not fixed
    expect(screen.getByText(/×.*modul/).textContent).not.toBe(small)
  })

  it("clears everything on the clear button", async () => {
    // Arrange
    renderTool()
    type(input(), "https://webiston.uz")
    expect(codeSvg()).not.toBeNull()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Tozalash/i }))

    // Assert
    expect(input()).toHaveValue("")
    expect(codeSvg()).toBeNull()
  })

  it("keeps the draft across a remount, which is what a locale switch is", async () => {
    // Arrange
    const { unmount } = renderTool()
    type(input(), "https://webiston.uz/salom")

    // Act — switching locale changes the [locale] segment, so the tree is
    // thrown away and rebuilt. This is that, without the router.
    unmount()
    renderTool()

    // Assert — the reported bug was that this came back empty
    expect(input()).toHaveValue("https://webiston.uz/salom")
    expect(codeSvg()).not.toBeNull()
  })
})

describe("styling", () => {
  it("applies a preset to the code that is on screen", async () => {
    // Arrange
    renderTool()
    type(input(), "https://webiston.uz")
    const before = codeSvg()?.querySelector("path")?.getAttribute("d")

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Nuqtali/i }))

    // Assert — the preview changed, and the preset reports itself as chosen
    expect(codeSvg()?.querySelector("path")?.getAttribute("d")).not.toBe(before)
    expect(screen.getByRole("button", { name: /Nuqtali/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  it("clears a gradient when a flat preset follows a gradient one", async () => {
    // Arrange
    renderTool()
    type(input(), "https://webiston.uz")

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Brend/i }))
    expect(codeSvg()?.querySelector("linearGradient")).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: /Klassik/i }))

    // Assert — otherwise a teal gradient survives underneath "Klassik"
    expect(codeSvg()?.querySelector("linearGradient")).toBeNull()
  })

  it("names the shape that is selected", async () => {
    // Arrange
    renderTool()
    const group = screen.getByRole("group", { name: "Nuqta shakli" })

    // Assert the default, then act
    expect(within(group).getByText("Kvadrat")).toBeInTheDocument()
    fireEvent.click(within(group).getByRole("button", { name: "Mozaika" }))

    // Assert
    expect(within(group).getByText("Mozaika")).toBeInTheDocument()
  })

  it("warns when the chosen colours will not scan", async () => {
    // Arrange
    renderTool()
    type(input(), "https://webiston.uz")
    expect(screen.queryByRole("status")).toBeNull()

    // Act — a pale ink on white
    useQrDraftStore.getState().updateStyle({ foregroundColor: "#cccccc" })

    // Assert
    expect(await screen.findByRole("status")).toHaveTextContent(/kontrast/i)
  })

  it("offers a vector format first", () => {
    // Arrange + Act
    renderTool()

    // Assert — SVG is the only format that survives print at any size
    const buttons = screen.getAllByRole("button", { name: /SVG|PNG|WEBP/ })
    expect(buttons[0]).toHaveAccessibleName("SVG")
    // Nothing to download until there is a code
    expect(buttons[0]).toBeDisabled()
  })
})
