import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import common from "../../../../../../messages/common/uz.json"
import shared from "../../../../../../messages/tools/documents/uz.json"
import messages from "../../../../../../messages/tools/tatil/uz.json"
import { Documents } from "../../Documents"
import { TATIL_TEMPLATE } from "./index"

/**
 * The tool, driven the way a visitor drives it. `compose.test.ts` proves the
 * arithmetic; this proves the FORM is wired to it — a kind select that updates
 * state but never reaches the sheet is the bug class this shape of tool ships.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider
      locale="uz"
      messages={{ ...messages, ...shared, ...common }}
    >
      <Documents template={TATIL_TEMPLATE} />
    </NextIntlClientProvider>
  )
}

/** Drive the real date picker — see `ariza.test.tsx`. */
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
  vi.setSystemTime(new Date(2026, 8, 9))
})

afterAll(() => {
  vi.useRealTimers()
})

describe("ta'til arizasi", () => {
  it("starts as a printable blank form, not an error", () => {
    // Arrange / Act
    renderTool()

    // Assert
    expect(sheet().textContent).toContain("ARIZA")
    expect(sheet().textContent).toContain("______")
    expect(sheet().textContent).toContain("yillik mehnat ta'tilini")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("counts the end date — past the holiday — the moment a start is picked", () => {
    // Arrange
    renderTool()

    // Act — 24 September, 21 days (the form's default).
    pickDay(screen.getByLabelText(/Boshlanish sanasi/i), 24)

    // Assert — on the paper, and the form names the holiday that moved it.
    expect(sheet().textContent).toContain("24-sentabrdan 15-oktabrgacha")
    expect(screen.getByText(/O'qituvchi va murabbiylar kuni/)).toBeVisible()
  })

  it("re-counts without the holiday when the leave becomes unpaid", () => {
    // Arrange
    renderTool()
    pickDay(screen.getByLabelText(/Boshlanish sanasi/i), 24)

    // Act
    fireEvent.click(screen.getByRole("combobox", { name: /Ta'til turi/i }))
    fireEvent.click(screen.getByRole("option", { name: /O'z hisobidan/i }))

    // Assert — plain calendar days, the unpaid wording, and a reason field.
    expect(sheet().textContent).toContain("24-sentabrdan 14-oktabrgacha")
    expect(sheet().textContent).toContain("ish haqi saqlanmaydigan ta'til")
    expect(screen.getByLabelText(/Sabab/i)).toBeInTheDocument()
  })

  it("flags a short annual leave without refusing it", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(screen.getByLabelText(/Necha kalendar kun/i), {
      target: { value: "7" }
    })

    // Assert — the message names the lawful route; the length still prints.
    expect(screen.getByRole("alert")).toHaveTextContent(/231-modda/)
    expect(sheet().textContent).toContain("7 kalendar kun")
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
    expect(sheet().textContent).toContain("АРИЗА")
    expect(sheet().textContent).toContain("дастурчи")
    expect(sheet().textContent).toContain("таътилини")
  })

  it("fills a finished, error-free document from the sample button", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Assert — 9 September + 15 days = 24 September; +21 days past 1 October.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(sheet().textContent).toContain("24-sentabrdan 15-oktabrgacha")
    expect(sheet().textContent).toContain("Karimov S.A.")
  })
})
