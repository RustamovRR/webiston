import { act, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/screen-resolution/uz.json"
import { ScreenResolution } from "./ScreenResolution"

/**
 * The tool, driven the way a visitor drives it.
 *
 * The maths has its own unit tests; these cover what the PAGE does with the
 * answers — and specifically that it re-reads on resize, which is the one
 * behaviour the tool exists for and the one the old implementation got wrong
 * (it re-rendered per event with no coalescing, and stored scroll position it
 * never usefully showed).
 */

const messages = { ...commonMessages, ...toolMessages }

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <ScreenResolution />
    </NextIntlClientProvider>
  )
}

const panel = (name: RegExp) => screen.getByRole("region", { name })

/** jsdom fires no `resize` of its own — set the size, then announce it. */
async function resizeTo(width: number, height: number) {
  await act(async () => {
    window.innerWidth = width
    window.innerHeight = height
    window.dispatchEvent(new Event("resize"))
    // The hook coalesces into an animation frame.
    await new Promise((resolve) => requestAnimationFrame(resolve))
  })
}

describe("the live readout", () => {
  it("shows the viewport without the visitor pressing anything", () => {
    // Arrange & Act
    renderTool()

    // Assert — no loading state: reading `window.screen` takes microseconds.
    const readout = within(panel(/viewport — hozirgi holat/i))
    expect(
      readout.getByText(String(window.innerWidth), { exact: false })
    ).toBeInTheDocument()
  })

  it("re-reads when the window is resized", async () => {
    // Arrange
    renderTool()

    // Act
    await resizeTo(1400, 900)

    // Assert — the number, and the breakpoint derived from it, both move.
    const readout = within(panel(/viewport — hozirgi holat/i))
    expect(readout.getByText("1400", { exact: false })).toBeInTheDocument()
    expect(readout.getByText("xl")).toBeInTheDocument()
  })
})

describe("the breakpoint bar", () => {
  it("marks every breakpoint the width has passed, not just the active one", async () => {
    // Arrange
    renderTool()

    // Act — 1400px matches sm, md, lg and xl at once.
    await resizeTo(1400, 900)

    // Assert — all six cells are rendered, so the stacking is visible.
    const bar = within(panel(/tailwind breakpointlari/i))
    for (const name of ["base", "sm", "md", "lg", "xl", "2xl"]) {
      expect(bar.getByText(name)).toBeInTheDocument()
    }
  })

  it("explains which prefix wins", async () => {
    // Arrange
    renderTool()
    // Act
    await resizeTo(800, 600)
    // Assert
    expect(
      within(panel(/tailwind breakpointlari/i)).getByText(/g'olib chiqadi/i)
    ).toBeInTheDocument()
  })
})

describe("the measurements", () => {
  it("separates CSS pixels from device pixels", () => {
    // Arrange & Act — the two are never mixed; a Retina screen is 2× in one
    // column and unchanged in the other.
    renderTool()

    // Assert
    const card = within(panel(/barcha o'lchamlar/i))
    expect(card.getByText(/ekran \(css piksel\)/i)).toBeInTheDocument()
    expect(card.getByText(/ekran \(qurilma piksellari\)/i)).toBeInTheDocument()
  })

  it("says what each measurement is for", () => {
    // Arrange & Act
    renderTool()
    // Assert — the hint is the part that stops someone reaching for
    // `screen.width` in a media query.
    expect(
      within(panel(/barcha o'lchamlar/i)).getByText(
        /media so'rovlari aynan shuni o'lchaydi/i
      )
    ).toBeInTheDocument()
  })
})

describe("the device table", () => {
  it("lists viewport sizes, not marketing resolutions", () => {
    // Arrange & Act
    renderTool()

    // Assert — an iPhone 15 Pro Max is sold as 1290×2796 and measures 430×932.
    const table = within(panel(/keng tarqalgan qurilmalar/i))
    expect(table.getByText("iPhone 15 Pro Max")).toBeInTheDocument()
    expect(table.getByText("430 × 932")).toBeInTheDocument()
  })

  it("marks the row the visitor is currently on", async () => {
    // Arrange
    renderTool()

    // Act
    await resizeTo(1920, 1080)

    // Assert
    expect(
      within(panel(/keng tarqalgan qurilmalar/i)).getByText(/^siz$/i)
    ).toBeInTheDocument()
  })
})

describe("the CSS output", () => {
  it("emits a bounded range for the current width", async () => {
    // Arrange
    renderTool()

    // Act
    await resizeTo(800, 600)

    // Assert — a bare `min-width` would also match every larger screen.
    //
    // Read as text, not by node: `CodeHighlight` wraps each token in its own
    // span, so a query for the whole declaration would never match a single
    // element even though the string is on screen.
    const css = panel(/shu o'lcham uchun css/i).textContent ?? ""
    expect(css).toContain("min-width: 768px")
    expect(css).toContain("max-width: 1023px")
  })
})

describe("what the rebuild removed", () => {
  it("offers no demo data", () => {
    // Arrange & Act — the old tool had a button that loaded a fabricated
    // 1920×1080 snapshot into a page whose entire job is your real screen.
    renderTool()

    // Assert
    expect(screen.queryByText(/demo/i)).not.toBeInTheDocument()
  })
})
