import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it } from "vitest"

import common from "../../../../messages/common/uz.json"
import messages from "../../../../messages/tools/rezyume/uz.json"
import { ResumeBuilder } from "./ResumeBuilder"

/**
 * The tool, driven the way a visitor drives it.
 *
 * Everything here is a behaviour that was REPORTED as wrong or confusing:
 * rows that reorder when you expected them to collapse, a form that grows
 * past reading, a phone field with no shape, and a preview that silently cut
 * a long summary. A green test is the only thing that keeps them fixed.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={{ ...messages, ...common }}>
      <ResumeBuilder />
    </NextIntlClientProvider>
  )
}

const sheet = () => document.getElementById("resume-sheet") as HTMLElement

beforeEach(() => {
  localStorage.clear()
})

describe("resume builder", () => {
  it("starts empty and says so instead of printing a blank page", () => {
    // Arrange / Act
    renderTool()

    // Assert
    expect(sheet().textContent).toContain("Chapdagi maydonlarni to'ldiring")
    expect(screen.queryByLabelText(/Yuqoriga/)).not.toBeInTheDocument()
  })

  it("fills a finished CV from the sample button", () => {
    // Arrange / Act
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Assert — the sheet, not the form.
    expect(sheet().textContent).toContain("Karimova Nilufar Anvarovna")
    expect(sheet().textContent).toContain("«Texnomart» MChJ")
    expect(sheet().textContent).toContain("2024-yil mart — hozirgacha")
  })

  it("masks the phone into the shape a document writes", () => {
    // Arrange
    renderTool()
    const phone = screen.getByLabelText("Telefon")

    // Act — digits only, the way someone types them.
    fireEvent.change(phone, { target: { value: "998901234567" } })

    // Assert
    expect(phone).toHaveValue("+998 90 123 45 67")
    expect(sheet().textContent).toContain("+998 90 123 45 67")
  })

  it("adds a row, and the row is open so it can be typed into", () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Ish joyi qo'shish/ }))

    // Assert
    expect(screen.getByLabelText("Lavozimingiz")).toBeInTheDocument()
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument()
  })

  it("COLLAPSES a row instead of reordering it — the reported confusion", async () => {
    // Arrange
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /Ish joyi qo'shish/ }))
    fireEvent.change(screen.getByLabelText("Lavozimingiz"), {
      target: { value: "Katta savdo maslahatchisi" }
    })

    // Act — the caption is the toggle; chevrons no longer mean "move".
    // Queried by NAME, not by `expanded`: the MonthPickers on the row are
    // popover triggers and carry `aria-expanded` too.
    const toggle = screen.getByRole("button", {
      name: /Katta savdo maslahatchisi/
    })
    fireEvent.click(toggle)

    // Assert — the state flips immediately; the fields leave once the exit
    // animation finishes, which is why this waits rather than asserting now.
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await waitFor(() =>
      expect(screen.queryByLabelText("Lavozimingiz")).not.toBeInTheDocument()
    )
    // Collapsed, the row still says WHICH job it is — otherwise collapsing
    // four of them leaves four identical grey bars.
    expect(
      screen.getByRole("button", { name: /Katta savdo maslahatchisi/ })
    ).toBeInTheDocument()
  })

  it("reorders with the arrows, and the SHEET follows", () => {
    // Arrange — two jobs, second one distinguishable.
    renderTool()
    const add = screen.getByRole("button", { name: /Ish joyi qo'shish/ })
    fireEvent.click(add)
    fireEvent.change(screen.getByLabelText("Lavozimingiz"), {
      target: { value: "Birinchi" }
    })
    fireEvent.click(add)
    const roles = screen.getAllByLabelText("Lavozimingiz")
    fireEvent.change(roles[1], { target: { value: "Ikkinchi" } })

    const before = sheet().textContent ?? ""
    expect(before.indexOf("Birinchi")).toBeLessThan(before.indexOf("Ikkinchi"))

    // Act — move the second one up.
    fireEvent.click(screen.getAllByLabelText("Yuqoriga")[1])

    // Assert — recency order is the whole convention of a CV.
    const after = sheet().textContent ?? ""
    expect(after.indexOf("Ikkinchi")).toBeLessThan(after.indexOf("Birinchi"))
  })

  it("removes the row the visitor asked for, not its neighbour", () => {
    // Arrange — the bug stable ids exist to prevent.
    renderTool()
    const add = screen.getByRole("button", { name: /Til qo'shish/ })
    fireEvent.click(add)
    fireEvent.click(add)
    const names = screen.getAllByLabelText("Til")
    fireEvent.change(names[0], { target: { value: "Ingliz" } })
    fireEvent.change(names[1], { target: { value: "Arab" } })

    // Act — delete the FIRST.
    fireEvent.click(screen.getAllByLabelText("O'chirish")[0])

    // Assert
    expect(sheet().textContent).toContain("Arab")
    expect(sheet().textContent).not.toContain("Ingliz")
  })

  it("switches the whole document to Cyrillic but never the contacts", () => {
    // Arrange
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Кирилл" }))

    // Assert — the name converts, the email does not. An address that has
    // been transliterated is an address that does not exist.
    const text = sheet().textContent ?? ""
    expect(text).toContain("Каримова Нилуфар Анваровна")
    expect(text).toContain("nilufar.karimova@example.com")
    expect(text).toContain("+998 90 123 45 67")
  })

  it("prints the headings in the DOCUMENT's language, not the site's", () => {
    // Arrange — the interface is Uzbek throughout this file.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))
    expect(sheet().textContent).toContain("Ish tajribasi")

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Ruscha" }))

    // Assert
    expect(sheet().textContent).toContain("Опыт работы")
    // And the script toggle is gone: Russian has one alphabet here.
    expect(
      screen.queryByRole("radio", { name: "Кирилл" })
    ).not.toBeInTheDocument()
  })

  it("keeps the draft across a remount — the afternoon's work", () => {
    // Arrange
    const first = renderTool()
    fireEvent.change(screen.getByLabelText(/F\.I\.Sh/), {
      target: { value: "Test Foydalanuvchi" }
    })
    first.unmount()

    // Act
    renderTool()

    // Assert
    expect(screen.getByLabelText(/F\.I\.Sh/)).toHaveValue("Test Foydalanuvchi")
  })

  it("shows a long summary in full instead of clipping it", () => {
    // Arrange — the reported bug: `overflow-hidden` on the sheet silently cut
    // the document while the printout showed two pages.
    renderTool()
    const long = "Juda uzun matn. ".repeat(120)
    fireEvent.change(screen.getByLabelText(/Qisqacha o'zingiz/), {
      target: { value: long }
    })

    // Assert
    const paper = sheet()
    expect(paper.textContent).toContain(long.trim())
    expect(paper.className).not.toContain("overflow-hidden")
  })
})

describe("resume sheet, per template", () => {
  it("renders the Zamonaviy sidebar sections", () => {
    // Arrange
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Zamonaviy" }))

    // Assert — the sidebar carries contact/skills/languages.
    const aside = within(sheet()).getByRole("complementary")
    expect(aside.textContent).toContain("+998 90 123 45 67")
    expect(aside.textContent).toContain("Ko'nikmalar")
    expect(aside.textContent).toContain("O'zbek — ona tili")
  })

  it("offers the accent picker only for the template that paints with it", () => {
    // Arrange / Act / Assert
    renderTool()
    expect(screen.queryByLabelText("Ko'k")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("radio", { name: "Zamonaviy" }))
    expect(screen.getByLabelText("Ko'k")).toBeInTheDocument()
  })
})
