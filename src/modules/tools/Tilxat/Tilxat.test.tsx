import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import common from "../../../../messages/common/uz.json"
import messages from "../../../../messages/tools/tilxat/uz.json"
import { Tilxat } from "./Tilxat"

/**
 * The tool, driven the way a visitor drives it. `utils/document.test.ts`
 * proves the paper; this proves the form is CONNECTED to it — a field that
 * updates state but never reaches the sheet is the bug class a
 * fill-in-the-form tool ships.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={{ ...messages, ...common }}>
      <Tilxat />
    </NextIntlClientProvider>
  )
}

const sheet = () => document.getElementById("tilxat-sheet") as HTMLElement

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
  })
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

    // Act
    fireEvent.change(screen.getByLabelText(/Qarz summasi/i), {
      target: { value: "besh million" }
    })

    // Assert — the form says so, the paper never guesses.
    expect(screen.getByRole("alert")).toHaveTextContent(/faqat son/i)
    expect(sheet().textContent).not.toContain("besh million) so'm")
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
   * The screenshot case, end to end: garbage in the passport field shows a
   * red error under the input AND never reaches the paper.
   */
  it("keeps a garbage passport off the sheet and says why", () => {
    // Arrange
    renderTool()

    // Act — verbatim from the owner's screenshot.
    fireEvent.change(
      screen.getAllByLabelText(/Pasport seriyasi va raqami/i)[0],
      { target: { value: "aa12341234123412341234" } }
    )

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/2 harf va 7 raqam/i)
    expect(sheet().textContent).not.toContain("aa1234")
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

  it("refuses a return date before the loan date", () => {
    // Arrange
    renderTool()
    fireEvent.change(screen.getByLabelText(/Berilgan sana/i), {
      target: { value: "2026-08-12" }
    })

    // Act
    fireEvent.change(screen.getByLabelText(/Qaytarish muddati/i), {
      target: { value: "2026-08-11" }
    })

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/oldin bo'la olmaydi/i)
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
