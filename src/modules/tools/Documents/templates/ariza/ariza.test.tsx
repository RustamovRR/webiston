import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"

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

const sheet = () => document.getElementById("document-sheet") as HTMLElement

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
    fireEvent.change(screen.getByLabelText(/Ariza sanasi/i), {
      target: { value: "2026-08-13" }
    })

    // Assert — fourteen calendar days, on the paper, unprompted.
    expect(sheet().textContent).toContain("2026-yil 27-avgust kunidan")
  })

  it("re-counts when the employee category changes", () => {
    // Arrange
    renderTool()
    fireEvent.change(screen.getByLabelText(/Ariza sanasi/i), {
      target: { value: "2026-08-13" }
    })
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
    fireEvent.change(screen.getByLabelText(/Ariza sanasi/i), {
      target: { value: "2026-08-13" }
    })

    // Act — a week's notice.
    fireEvent.change(screen.getByLabelText(/Oxirgi ish kuni/i), {
      target: { value: "2026-08-20" }
    })

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
