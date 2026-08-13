import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import common from "../../../../../../messages/common/uz.json"
import messages from "../../../../../../messages/tools/ariza/uz.json"
import shared from "../../../../../../messages/tools/documents/uz.json"
import { Documents } from "../../Documents"
import { ARIZA_TEMPLATE } from "./index"

/**
 * The tool, driven the way a visitor drives it. `compose.test.ts` proves the
 * arithmetic; this proves the FORM is wired to it — a category select that
 * updates state but never reaches the sheet is the bug class this shape of
 * tool ships.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider
      locale="uz"
      messages={{ ...messages, ...shared, ...common }}
    >
      <Documents template={ARIZA_TEMPLATE} />
    </NextIntlClientProvider>
  )
}

/**
 * Drive the real date picker: open the popover, click the day.
 *
 * The forms stopped using `<input type="date">`, so a `fireEvent.change` on
 * the field no longer means anything — and that is the point of asserting
 * through the control the visitor actually operates. The clock is frozen so
 * the calendar always opens on the month these tests talk about.
 */
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

describe("ariza", () => {
  it("starts as a printable blank form, not an error", () => {
    // Arrange / Act
    renderTool()

    // Assert
    expect(sheet().textContent).toContain("ARIZA")
    expect(sheet().textContent).toContain("______")
    expect(sheet().textContent).toContain("160-moddasi")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("counts the last working day the moment a date is picked", () => {
    // Arrange
    renderTool()

    // Act — only the application date; the release field stays empty.
    pickDay(screen.getByLabelText(/Ariza sanasi/i), 13)

    // Assert — fourteen calendar days, on the paper, unprompted.
    expect(sheet().textContent).toContain("2026-yil 27-avgust kunidan")
  })

  it("re-counts when the employee category changes", () => {
    // Arrange
    renderTool()
    pickDay(screen.getByLabelText(/Ariza sanasi/i), 13)
    expect(sheet().textContent).toContain("27-avgust")

    // Act — a head of organisation owes two months, not two weeks.
    fireEvent.click(screen.getByRole("combobox", { name: /Xodim toifasi/i }))
    fireEvent.click(screen.getByRole("option", { name: /Tashkilot rahbari/i }))

    // Assert
    expect(sheet().textContent).toContain("2026-yil 13-oktabr kunidan")
    expect(sheet().textContent).not.toContain("27-avgust kunidan")
  })

  it("flags a release date inside the notice period without refusing it", () => {
    // Arrange
    renderTool()
    pickDay(screen.getByLabelText(/Ariza sanasi/i), 13)

    // Act — a week's notice: after the application date, so the calendar
    // allows it; inside the notice period, so the form flags it.
    pickDay(screen.getByLabelText(/Oxirgi ish kuni/i), 20)

    // Assert — the message names the two lawful routes; the date still prints,
    // because MK 160 §8 makes it possible and the visitor chose it.
    expect(screen.getByRole("alert")).toHaveTextContent(/8-qismidagi holatda/i)
    expect(sheet().textContent).toContain("2026-yil 20-avgust kunidan")
  })

  it("carries the addressee and the sender onto the sheet", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(screen.getByLabelText(/Tashkilot nomi/i), {
      target: { value: "«Webiston» MChJ" }
    })
    fireEvent.change(screen.getByLabelText(/F\.I\.Sh\. \(to'liq\)/i), {
      target: { value: "Karimov Salim Anvarovich" }
    })

    // Assert — in the header block and on the signature line, with initials.
    expect(sheet().textContent).toContain("«Webiston» MChJ")
    expect(sheet().textContent).toContain("Karimov Salim Anvarovichdan")
    expect(sheet().textContent).toContain("Karimov S.A.")
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
    expect(sheet().textContent).toContain("Меҳнат кодексининг 160-моддаси")
  })

  it("fills a finished, error-free document from the sample button", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(sheet().textContent).toContain("«Webiston» MChJ direktori")
    expect(sheet().textContent).toContain("Karimov S.A.")
  })
})
