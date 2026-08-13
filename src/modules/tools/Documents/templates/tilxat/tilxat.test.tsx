import { fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"

import common from "../../../../../../messages/common/uz.json"
import shared from "../../../../../../messages/tools/documents/uz.json"
import messages from "../../../../../../messages/tools/tilxat/uz.json"
import { Documents } from "../../Documents"
import { TILXAT_TEMPLATE } from "./index"

/**
 * The tool, driven the way a visitor drives it. `utils/document.test.ts`
 * proves the paper; this proves the form is CONNECTED to it — a field that
 * updates state but never reaches the sheet is the bug class a
 * fill-in-the-form tool ships.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider
      locale="uz"
      messages={{ ...messages, ...shared, ...common }}
    >
      <Documents template={TILXAT_TEMPLATE} />
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

/**
 * Is that day offered at all? A disabled day cannot be chosen by anyone.
 *
 * Closes the popover on the way out, so two checks in a row do not toggle it
 * shut and then look for a calendar that is no longer mounted.
 */
function dayIsOffered(field: HTMLElement, day: number) {
  fireEvent.click(field)
  const grid = screen.getByRole("grid")
  const cell = within(grid)
    .getAllByRole("button")
    .find((button) => button.textContent?.trim() === String(day))
  const offered = Boolean(cell && !cell.hasAttribute("disabled"))
  fireEvent.keyDown(grid, { key: "Escape" })
  return offered
}

const sheet = () => document.getElementById("document-sheet") as HTMLElement

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
  })
})

beforeAll(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 7, 13))
})

afterAll(() => {
  vi.useRealTimers()
})

describe("tilxat", () => {
  it("starts as a printable blank form, not an error", () => {
    // Arrange / Act
    renderTool()

    // Assert — writing lines, the heading, and no alert anywhere.
    expect(sheet().textContent).toContain("TILXAT")
    expect(sheet().textContent).toContain("______")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("carries a typed name onto the sheet", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(screen.getAllByLabelText(/F\.I\.Sh\. \(to'liq\)/i)[0], {
      target: { value: "Aliyev Vali Salimovich" }
    })

    // Assert — in the body and on the signature line, with initials.
    expect(sheet().textContent).toContain("Aliyev Vali Salimovich")
    expect(sheet().textContent).toContain("Aliyev V.S.")
  })

  it("writes the sum in words the moment it is typed", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(screen.getByLabelText(/Qarz summasi/i), {
      target: { value: "5 000 000" }
    })

    // Assert
    expect(sheet().textContent).toContain("5 000 000 (besh million) so'm")
  })

  it("turns the whole document Cyrillic with one switch", () => {
    // Arrange
    renderTool()
    fireEvent.change(screen.getByLabelText(/Qarz summasi/i), {
      target: { value: "5000000" }
    })
    // The borrower's passport, to prove it survives the script change.
    fireEvent.change(
      screen.getAllByLabelText(/Pasport seriyasi va raqami/i)[0],
      { target: { value: "AB 1234567" } }
    )

    // Act
    fireEvent.click(screen.getByRole("radio", { name: /Кирилл/i }))

    // Assert — prose converted, passport series still Latin.
    expect(sheet().textContent).toContain("ТИЛХАТ")
    expect(sheet().textContent).toContain("беш миллион")
    expect(sheet().textContent).toContain("AB 1234567")
    expect(sheet().textContent).not.toContain("АБ 1234567")
  })

  it("flags an amount it cannot read and blanks the sheet's sum", () => {
    // Arrange
    renderTool()
    const amount = screen.getByLabelText(/Qarz summasi/i)

    // Act / Assert — words never reach the field at all now.
    fireEvent.change(amount, { target: { value: "besh million" } })
    expect(amount).toHaveValue("")
    expect(sheet().textContent).not.toContain("besh million) so'm")

    // Act / Assert — digits DO reach it, and a sum past 18 places gets its
    // own sentence rather than being told to "enter digits only".
    fireEvent.change(amount, { target: { value: "12345678901234567890" } })
    expect(screen.getByRole("alert")).toHaveTextContent(/juda katta/i)
    expect(sheet().textContent).not.toContain("1234567890")
  })

  it("adds the witness block only when a witness is named", () => {
    // Arrange
    renderTool()
    expect(sheet().textContent).not.toContain("Guvohlar")

    // Act
    fireEvent.change(screen.getByLabelText(/1-guvoh/i), {
      target: { value: "Toshmatov Eshmat Akramovich" }
    })

    // Assert
    expect(sheet().textContent).toContain("Guvohlar:")
    expect(sheet().textContent).toContain("Toshmatov E.A.")
  })

  it("copies the script that is on screen", async () => {
    // Arrange
    renderTool()
    fireEvent.change(screen.getByLabelText(/Qarz summasi/i), {
      target: { value: "1000" }
    })
    fireEvent.click(screen.getByRole("radio", { name: /Кирилл/i }))

    // Act
    fireEvent.click(screen.getByRole("button", { name: /nusxalash/i }))

    // Assert
    await vi.waitFor(() => {
      const copied = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0]
      expect(copied).toContain("ТИЛХАТ")
      expect(copied).toContain("бир минг")
    })
  })

  /**
   * The screenshot case, at the keystroke rather than at the error line: the
   * field cannot HOLD garbage, so there is nothing to report and nothing that
   * could reach the paper.
   */
  it("makes a garbage passport impossible to type at all", () => {
    // Arrange
    renderTool()
    const field = screen.getAllByLabelText(/Pasport seriyasi va raqami/i)[0]

    // Act / Assert — verbatim from the owner's two screenshots.
    fireEvent.change(field, { target: { value: "asdfasdfad" } })
    expect(field).toHaveValue("AS")

    fireEvent.change(field, { target: { value: "aa12341234123412341234" } })
    expect(field).toHaveValue("AA 1234123")
    expect(sheet().textContent).not.toContain("1234123412")
  })

  it("still blanks a half-typed passport on the sheet", () => {
    // Arrange — the mask permits legal PREFIXES; only a whole one prints.
    renderTool()

    // Act
    fireEvent.change(
      screen.getAllByLabelText(/Pasport seriyasi va raqami/i)[0],
      { target: { value: "ab123" } }
    )

    // Assert
    expect(sheet().textContent).not.toContain("AB 123")
    expect(sheet().textContent).toContain("pasport ____")
  })

  it("caps JSHSHIR at fourteen digits and refuses letters outright", () => {
    // Arrange
    renderTool()
    const field = screen.getAllByLabelText(/JSHSHIR/i)[0]

    // Act / Assert — the owner's screenshot typed words into this field.
    fireEvent.change(field, { target: { value: "qwefqwefqwefqw" } })
    expect(field).toHaveValue("")

    fireEvent.change(field, { target: { value: "304129001234567890" } })
    expect(field).toHaveValue("30412900123456")
  })

  /**
   * Bold is a proof-reading aid for the SCREEN. Paper wants one weight — an
   * official document that bolds only the filled-in parts announces itself as
   * generated.
   */
  it("drops the bold when the sheet is printed", () => {
    // Arrange / Act
    renderTool()
    const printCss = [...document.querySelectorAll("style")]
      .map((style) => style.textContent ?? "")
      .find((css) => css.includes("document-print"))

    // Assert
    expect(printCss).toContain("@media print")
    expect(printCss).toMatch(
      /body\.document-print #document-sheet strong\s*\{\s*font-weight:\s*400/
    )
  })

  it("normalises a passport when the field is left", () => {
    // Arrange
    renderTool()
    const field = screen.getAllByLabelText(/Pasport seriyasi va raqami/i)[0]

    // Act — typed lazily, then blurred.
    fireEvent.change(field, { target: { value: "ab1234567" } })
    fireEvent.blur(field)

    // Assert — the field AND the sheet show the printed form.
    expect(field).toHaveValue("AB 1234567")
    expect(sheet().textContent).toContain("pasport AB 1234567")
  })

  it("sets what the visitor typed in bold on the sheet", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.change(screen.getAllByLabelText(/F\.I\.Sh\. \(to'liq\)/i)[0], {
      target: { value: "Aliyev Vali Salimovich" }
    })

    // Assert — the value is inside a <strong>; the boilerplate is not.
    const bold = [...sheet().querySelectorAll("strong")].map(
      (el) => el.textContent
    )
    expect(bold).toContain("Aliyev Vali Salimovich")
    expect(sheet().textContent).toContain("manzilida yashovchi")
    expect(bold.join(" ")).not.toContain("manzilida yashovchi")
  })

  it("does not even OFFER a return date before the loan date", () => {
    // Arrange — the picker enforces the rule the error message used to
    // report after the fact, which is the stronger place for it.
    renderTool()
    pickDay(screen.getByLabelText(/Berilgan sana/i), 12)

    // Act / Assert
    const returnField = screen.getByLabelText(/Qaytarish muddati/i)
    expect(dayIsOffered(returnField, 11)).toBe(false)
    expect(dayIsOffered(returnField, 20)).toBe(true)
  })

  it("writes both dates onto the sheet in the document's own format", () => {
    // Arrange / Act
    renderTool()
    pickDay(screen.getByLabelText(/Berilgan sana/i), 12)
    pickDay(screen.getByLabelText(/Qaytarish muddati/i), 20)

    // Assert — and the trigger reads the same way the paper does, rather
    // than the browser's "12/08/2026".
    expect(sheet().textContent).toContain("2026-yil 12-avgust")
    expect(sheet().textContent).toContain("2026-yil 20-avgustgacha")
    expect(screen.getByLabelText(/Berilgan sana/i)).toHaveTextContent(
      "2026-yil 12-avgust"
    )
  })

  it("carries a valid JSHSHIR onto the paper and flags a short one", () => {
    // Arrange
    renderTool()
    const field = screen.getAllByLabelText(/JSHSHIR/i)[0]

    // Act / Assert — valid: printed.
    fireEvent.change(field, { target: { value: "30412900123456" } })
    expect(sheet().textContent).toContain("JSHSHIR: 30412900123456")

    // Act / Assert — short: flagged, absent from the sheet.
    fireEvent.change(field, { target: { value: "3041290" } })
    expect(screen.getByRole("alert")).toHaveTextContent(/14 ta raqam/i)
    expect(sheet().textContent).not.toContain("JSHSHIR")
  })

  it("fills a finished, error-free document from the sample button", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Assert — a worked example, and the tool's own validation accepts it.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(sheet().textContent).toContain("Aliyev Vali Salimovich")
    expect(sheet().textContent).toContain("AB 1234567")
    expect(sheet().textContent).toContain("o'n besh million) so'm")
    expect(sheet().textContent).toContain("Guvohlar:")
  })

  it("clears the whole form at once", () => {
    // Arrange
    renderTool()
    fireEvent.change(screen.getAllByLabelText(/F\.I\.Sh\. \(to'liq\)/i)[0], {
      target: { value: "Aliyev Vali" }
    })

    // Act
    fireEvent.click(screen.getByRole("button", { name: /tozalash/i }))

    // Assert
    expect(sheet().textContent).not.toContain("Aliyev")
  })
})
