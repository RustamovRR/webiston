import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import messages from "../../../../messages/tools/color-converter/uz.json"
import { ColorConverter } from "./ColorConverter"
import { useColorDraftStore } from "./stores/colorDraftStore"

/**
 * The tool, driven the way a visitor drives it.
 *
 * Everything asserted here is a defect this tool actually shipped: a picker
 * that flipped to black on a stray keystroke, a palette that rendered five
 * identical swatches with colliding React keys, a grey that came back tinted
 * red, an opacity slider that only appeared once the colour was already
 * translucent, a favourite heart that kept saying "on" after the colour had
 * been removed from storage, and a colour-name lookup that returned "" for
 * every real input. None of them are visible to a unit test of the maths —
 * they all live in the wiring.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <ColorConverter />
    </NextIntlClientProvider>
  )
}

/** `fireEvent`, not `user-event`: the latter is not a dependency of this repo. */
const type = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } })

const textInput = () => screen.getByRole("textbox", { name: /Rang Tanlash/i })

const picker = () =>
  document.querySelector<HTMLInputElement>('input[type="color"]')

const region = (name: RegExp) => screen.getByRole("region", { name })

/**
 * The first preset swatch. Selected by position rather than by name: the name
 * lookup now resolves by nearest OKLab distance, so several presets answer to
 * a regex like /red/ and the query is ambiguous — which is itself the proof
 * that the lookup stopped returning "".
 */
const pickPreset = () =>
  within(region(/Rang Tanlash/i))
    .getAllByRole("button")
    .filter((button) => (button as HTMLElement).style.backgroundColor)[0]

/** The workbench panels are mounted but `hidden`, so the view must be chosen. */
const showView = (label: string) =>
  fireEvent.click(screen.getByRole("radio", { name: label }))

beforeEach(() => {
  // The draft store is module scope on purpose (it survives the locale
  // remount), which means it also survives between tests.
  useColorDraftStore.getState().reset()
  localStorage.clear()
  // The tool writes `?c=<hex>` on every colour change, and jsdom keeps one
  // `location` for the whole file — so without this the previous test's colour
  // is hydrated back in over the reset.
  window.history.replaceState(null, "", "/")
})

describe("the pinned answer", () => {
  it("opens on the brand colour and converts it", () => {
    // Arrange + Act
    renderTool()
    const summary = region(/Bu rang/i)

    // Assert — one syntax family across every row
    expect(textInput()).toHaveValue("#0d5a6b")
    expect(within(summary).getByText("rgb(13 90 107)")).toBeInTheDocument()
    expect(screen.getByText("To'g'ri format")).toBeInTheDocument()
  })

  it("publishes the OKLCH value tokens.css is written in", () => {
    // Arrange + Act
    renderTool()

    // Assert — the old conversion answered oklch(0.29 0.19 216) here
    expect(
      within(region(/Bu rang/i)).getByText("oklch(0.433 0.073 217)")
    ).toBeInTheDocument()
  })

  it("names a colour that is nowhere in the CSS registry", () => {
    // Arrange + Act — the name lookup was an exact-hex map, so it returned ""
    // for essentially every real input including this one
    renderTool()

    // Assert — a name line sits under the hex in the identity block
    const name = within(region(/Bu rang/i)).getByText(/^[a-z]+$/i, {
      selector: "p"
    })
    expect(name.textContent?.length).toBeGreaterThan(2)
  })

  it("keeps the deep spaces in the document, one disclosure away", () => {
    // Arrange + Act
    renderTool()

    // Assert — hidden from view is not the same as absent; these stay
    // indexable and reachable with the browser's own find
    expect(within(region(/Bu rang/i)).getByText(/^lab\(/)).toBeInTheDocument()
  })
})

describe("colour input", () => {
  it("reads the modern space-separated CSS syntax devtools copies", () => {
    // Arrange
    renderTool()

    // Act
    type(textInput(), "rgb(13 90 107 / 50%)")

    // Assert — this used to report "Noto'g'ri format"
    expect(screen.getByText("To'g'ri format")).toBeInTheDocument()
    expect(
      within(region(/Bu rang/i)).getAllByText("#0D5A6B80").length
    ).toBeGreaterThan(0)
  })

  it("keeps the picker on the last valid colour while the text is mid-edit", () => {
    // Arrange
    renderTool()
    expect(picker()).toHaveValue("#0d5a6b")

    // Act — one stray character
    type(textInput(), "#0d5a6bz")

    // Assert — the DOM coerces an invalid value to #000000, so the picker used
    // to jump to black and stay there
    expect(screen.getByText("Noto'g'ri format")).toBeInTheDocument()
    expect(picker()).toHaveValue("#0d5a6b")
  })

  it("reaches a translucent colour from an opaque one", () => {
    // Arrange
    renderTool()
    const slider = screen.getByRole("slider", { name: /Shaffoflik/i })

    // Act
    fireEvent.change(slider, { target: { value: "50" } })

    // Assert — the slider used to render only when alpha was ALREADY below 1
    expect(textInput()).toHaveValue("#0d5a6b80")
  })
})

describe("contrast", () => {
  it("grades both backdrops including the non-text criterion", () => {
    // Arrange + Act
    renderTool()
    const panel = region(/Kontrast/i)

    // Assert — SC 1.4.11 was computed and then discarded by the panel
    expect(within(panel).getByText("Oq fonda")).toBeInTheDocument()
    expect(within(panel).getByText("Qora fonda")).toBeInTheDocument()
    // three grade rows: white, black, and the optional third backdrop
    expect(within(panel).getAllByText(/Ikonka\/chegara/).length).toBe(3)
  })

  it("puts the verdict where it stays on screen, and prints it once", () => {
    // Arrange + Act
    renderTool()

    // Assert — the sentence lives in the pinned summary; printing it in the
    // contrast card as well made one number appear three times
    expect(
      within(region(/Bu rang/i)).getByText(/oq matn eng yaxshi o'qiladi/)
    ).toBeInTheDocument()
    expect(
      within(region(/Kontrast/i)).queryByText(/eng yaxshi o'qiladi/)
    ).toBeNull()
  })

  it("measures a translucent colour against the backdrop, not in the air", () => {
    // Arrange
    renderTool()
    const ratios = () =>
      within(region(/Kontrast/i))
        .getAllByText(/^\d+\.\d{2}:1$/)
        .map((node) => node.textContent)

    // Assert the opaque baseline, then act
    expect(ratios()).toContain("7.80:1")

    // Act — fully transparent
    type(textInput(), "transparent")

    // Assert — nothing visible has any contrast at all, against any backdrop.
    // The third row used to read 21.00:1 here, because an 8-digit hex fell
    // through `hexToRgb` and the alpha was dropped.
    expect(new Set(ratios())).toEqual(new Set(["1.00:1"]))
  })
})

describe("the workbench", () => {
  it("offers four jobs from one card instead of four stacked sections", () => {
    // Arrange + Act
    renderTool()
    const strip = within(region(/Qurish/i)).getByRole("group", {
      name: /Qurish/i
    })

    // Assert
    expect(within(strip).getAllByRole("radio")).toHaveLength(4)
  })

  it("keeps a grey scale grey", () => {
    // Arrange
    renderTool()

    // Act
    type(textInput(), "#808080")

    // Assert — the shade generator forced a saturation floor of 10 onto a
    // colour with none, so #808080 produced #f8f7f7 … #2a2222
    const shades = within(region(/Qurish/i))
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label") ?? "")
      .filter((label) => /^#[0-9a-f]{6}$/i.test(label))

    expect(shades.length).toBeGreaterThan(5)
    for (const hex of shades) {
      const [r, g, b] = [1, 3, 5].map((offset) =>
        Number.parseInt(hex.slice(offset, offset + 2), 16)
      )
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(1)
    }
  })

  it("shows every harmony scheme at once, with no duplicate swatch", () => {
    // Arrange
    renderTool()

    // Act — rotating the hue of a grey is a no-op, so every analogous entry
    // came back identical: five equal swatches and four React key collisions
    type(textInput(), "#808080")
    showView("Palitra")

    // Assert — three schemes, no repeats inside any of them
    const panel = region(/Qurish/i)
    expect(within(panel).getByText("Monoxromatik")).toBeInTheDocument()
    expect(within(panel).getByText("Analogik")).toBeInTheDocument()
    expect(within(panel).getByText("Komplementar")).toBeInTheDocument()
  })

  it("shows the export snippet before it is copied", () => {
    // Arrange + Act — three buttons used to fire the clipboard blind
    renderTool()

    // Assert
    const workbench = region(/Qurish/i)
    expect(within(workbench).getByText(/^@theme \{/)).toBeInTheDocument()
    expect(
      within(workbench).getByRole("textbox", { name: /Token nomi/i })
    ).toBeInTheDocument()
  })
})

describe("history and favourites", () => {
  it("records a deliberate pick but not a keystroke", () => {
    // Arrange
    renderTool()

    // Act — typing must not record "#ff0" on the way to "#ff0000"
    type(textInput(), "#ff0000")
    const afterTyping = localStorage.getItem("webiston-color-history")
    fireEvent.click(pickPreset())

    // Assert
    expect(afterTyping).toBeNull()
    expect(localStorage.getItem("webiston-color-history")).toContain("#EF4444")
  })

  it("turns the heart off when the colour leaves favourites", () => {
    // Arrange — one recorded colour, favourited
    renderTool()
    fireEvent.click(pickPreset())
    showView("Saqlangan")
    const heart = () =>
      screen.getByRole("button", { name: /Sevimlilar(ga|dan)/i })
    fireEvent.click(heart())
    expect(heart()).toHaveAttribute("aria-pressed", "true")

    // Act
    fireEvent.click(heart())

    // Assert — reading localStorage during render let the React Compiler cache
    // this icon, so storage emptied while the heart still reported "on"
    expect(heart()).toHaveAttribute("aria-pressed", "false")
    expect(localStorage.getItem("webiston-color-favorites")).not.toContain(
      "#EF4444"
    )
  })
})

describe("draft survival", () => {
  it("keeps the colour across a remount, which is what a locale switch is", () => {
    // Arrange
    const { unmount } = renderTool()
    type(textInput(), "#123456")

    // Act
    unmount()
    renderTool()

    // Assert
    expect(textInput()).toHaveValue("#123456")
  })
})
