import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import common from "../../../../../../messages/common/uz.json"
import shared from "../../../../../../messages/tools/documents/uz.json"
import messages from "../../../../../../messages/tools/tushuntirish/uz.json"
import { Documents } from "../../Documents"
import { TUSHUNTIRISH_TEMPLATE } from "./index"

/**
 * The tool, driven the way a visitor drives it. `compose.test.ts` proves the
 * prose; this proves the FORM is wired to it — a stance select that updates
 * state but never reaches the sheet is the bug class this shape of tool ships,
 * and here it would silently change the legal meaning of the document.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider
      locale="uz"
      messages={{ ...messages, ...shared, ...common }}
    >
      <Documents template={TUSHUNTIRISH_TEMPLATE} />
    </NextIntlClientProvider>
  )
}

/** Drive the real date picker: open the popover, click the day. */
function pickDay(field: HTMLElement, day: number) {
  fireEvent.click(field)
  const grid = screen.getByRole("grid")
  const cell = within(grid)
    .getAllByRole("button")
    .find((button) => button.textContent?.trim() === String(day))
  if (!cell) throw new Error(`Day ${day} is not offered by the calendar`)
  fireEvent.click(cell)
}

const sheet = () => document.getElementById("document-sheet") as HTMLElement

beforeAll(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 7, 13))
})

afterAll(() => {
  vi.useRealTimers()
})

describe("tushuntirish xati", () => {
  it("starts as a printable blank form, not an error", () => {
    // Arrange / Act
    renderTool()

    // Assert
    expect(sheet().textContent).toContain("TUSHUNTIRISH XATI")
    expect(sheet().textContent).toContain("______")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("opens on the middle stance rather than admitting fault", () => {
    // Arrange / Act — an untouched form must not put an admission on the paper
    // on the visitor's behalf.
    renderTool()

    // Assert
    expect(sheet().textContent).toContain("uzrli sabab tufayli sodir bo'ldi")
    expect(sheet().textContent).not.toContain("to'liq tan olaman")
  })

  it("swaps the closing sentence when the stance changes", () => {
    // Arrange
    renderTool()

    // Act — the one control on this page with legal weight.
    fireEvent.click(screen.getByRole("combobox", { name: /Xat qanday/i }))
    fireEvent.click(
      screen.getByRole("option", { name: /Intizomni buzganim yo'q/i })
    )

    // Assert — the denial replaces the previous ending, it does not join it.
    expect(sheet().textContent).toContain("mehnat intizomini buzganim yo'q")
    expect(sheet().textContent).not.toContain(
      "uzrli sabab tufayli sodir bo'ldi"
    )
  })

  it("carries the addressee, the sender and the initials onto the sheet", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(screen.getByLabelText(/Tashkilot nomi/i), {
      target: { value: "«Webiston» MChJ" }
    })
    fireEvent.change(screen.getByLabelText(/F\.I\.Sh\. \(to'liq\)/i), {
      target: { value: "Karimov Salim Anvarovich" }
    })

    // Assert
    expect(sheet().textContent).toContain("«Webiston» MChJ")
    expect(sheet().textContent).toContain("Karimov Salim Anvarovichdan")
    expect(sheet().textContent).toContain("Karimov S.A.")
  })

  it("turns a typed explanation into paragraphs on the paper", () => {
    // Arrange
    renderTool()

    // Act — Enter in the textarea means a new paragraph in the document.
    fireEvent.change(screen.getByLabelText(/Izoh — nima uchun/i), {
      target: { value: "Birinchi sabab.\nIkkinchi sabab." }
    })

    // Assert — both present, and as separate paragraphs rather than one line.
    const paragraphs = Array.from(sheet().querySelectorAll("p")).map(
      (node) => node.textContent
    )
    expect(paragraphs).toContain("Birinchi sabab.")
    expect(paragraphs).toContain("Ikkinchi sabab.")
  })

  it("flags a note dated before the incident it explains", () => {
    // Arrange — the note's picker is bounded below by the incident date, so
    // the clash is only reachable by moving the INCIDENT forward afterwards.
    renderTool()
    pickDay(screen.getByLabelText(/Xat sanasi/i), 13)

    // Act
    pickDay(screen.getByLabelText(/Holat sanasi/i), 25)

    // Assert — a document that describes the future gets said out loud.
    expect(screen.getByRole("alert")).toHaveTextContent(/holat sanasidan/i)
  })

  it("turns the whole document Cyrillic with one switch", () => {
    // Arrange
    renderTool()
    fireEvent.change(screen.getByLabelText(/Lavozimingiz/i), {
      target: { value: "dasturchi" }
    })

    // Act
    fireEvent.click(screen.getByRole("radio", { name: /Кирилл/i }))

    // Assert
    expect(sheet().textContent).toContain("ТУШУНТИРИШ ХАТИ")
    expect(sheet().textContent).toContain("дастурчи")
  })

  it("fills a finished, error-free document from the sample button", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Assert — the incident is dated the day BEFORE the note, which is the
    // sequence a real one follows.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(sheet().textContent).toContain("«Webiston» MChJ direktori")
    expect(sheet().textContent).toContain("2026-yil 12-avgust kuni")
    expect(sheet().textContent).toContain("Karimov S.A.")
  })
})
