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

  it("gives the country code BACK when the field is cleared in place", () => {
    // Arrange — the reported bug: select-all + Delete took "+998" with the
    // number and nothing brought it back.
    renderTool()
    const phone = screen.getByLabelText("Telefon")
    fireEvent.focus(phone)
    expect(phone).toHaveValue("+998 ")
    fireEvent.change(phone, { target: { value: "998901234567" } })

    // Act
    fireEvent.change(phone, { target: { value: "" } })

    // Assert
    expect(phone).toHaveValue("+998 ")
  })

  it("prints no bare country code for a field nobody filled in", () => {
    // Arrange — the other half of the same rule: what is offered on focus
    // must not survive as a phone number on the paper.
    renderTool()
    const phone = screen.getByLabelText("Telefon")
    fireEvent.focus(phone)

    // Act
    fireEvent.blur(phone)

    // Assert
    expect(phone).toHaveValue("")
    expect(sheet().textContent).not.toContain("+998")
  })

  it("finishes a bare national number when the visitor leaves the field", () => {
    // Arrange
    renderTool()
    const phone = screen.getByLabelText("Telefon")

    // Act — nine digits, no country code.
    fireEvent.change(phone, { target: { value: "901234567" } })
    fireEvent.blur(phone)

    // Assert
    expect(phone).toHaveValue("+998 90 123 45 67")
  })

  it("leaves a foreign number in its own country's grouping", () => {
    // Arrange — the Uzbek 2-3-2-2 shape is wrong everywhere else, and this
    // is the one line of a CV whose job is being called back.
    renderTool()
    const phone = screen.getByLabelText("Telefon")

    // Act
    fireEvent.change(phone, { target: { value: "+44 20 7946 0958" } })
    fireEvent.blur(phone)

    // Assert
    expect(phone).toHaveValue("+44 20 7946 0958")
    expect(sheet().textContent).toContain("+44 20 7946 0958")
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

  it("hands the .docx the SAME script the preview shows", async () => {
    // Arrange — the bug: the headings went through `sheetLabels`, which
    // converts, while the content was passed raw. A Cyrillic document
    // downloaded with Cyrillic headings over Latin text.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))
    fireEvent.click(screen.getByRole("radio", { name: "Кирилл" }))

    const { viewOf, sheetLabels } = await import("./utils/script")
    const stored = JSON.parse(
      localStorage.getItem("webiston:rezyume:v1") ?? "{}"
    )

    // Act — exactly what the download button passes on.
    const exported = viewOf(stored)
    const labels = sheetLabels(stored)

    // Assert — both halves in one alphabet, contacts still shielded.
    expect(exported.fullName).toBe("Каримова Нилуфар Анваровна")
    expect(labels.experience).toBe("Иш тажрибаси")
    expect(exported.contact.email).toBe("nilufar.karimova@example.com")
  })

  it("gives two identical bullets two different keys", () => {
    // Arrange — `key={line}` made repeated wording a DUPLICATE KEY, which is
    // undefined reconciliation, not a duplicate row.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /Ish joyi qo'shish/ }))

    // Act
    fireEvent.change(screen.getByLabelText(/Nima qildingiz/), {
      target: { value: "Bir xil qator.\nBir xil qator.\nUchinchi." }
    })

    // Assert — both survive to the paper.
    const bullets = within(sheet())
      .getAllByRole("listitem")
      .map((item) => item.textContent)
    expect(bullets.filter((text) => text === "Bir xil qator.")).toHaveLength(2)
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
    // The second half of the same bug, and jsdom has no layout to catch it:
    // the FLEX ITEM in the preview's scrolling column carries an explicit
    // `min-height`, which REPLACES the automatic minimum that stops a flex
    // item shrinking below its content. Measured in a real browser, the sheet
    // sat at exactly 1,123px while its content needed 1,401px, and everything
    // past that rendered outside the white paper. The flex item is the
    // `@container` box the zoom measures against, so `shrink-0` lives there.
    expect(paper.parentElement?.className).toContain("shrink-0")
    expect(paper.parentElement?.className).toContain("@container")
  })

  it("sets a serif whose figures sit on the baseline", () => {
    // Arrange / Act — Georgia's OLDSTYLE figures made a phone number and a
    // set of dates look like broken type, and `font-variant-numeric:
    // lining-nums` does not fix it: plain Georgia has no lining set to switch
    // to, so the three variants render pixel-identically.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Assert
    expect(sheet().style.fontFamily).not.toContain("Georgia")
    expect(sheet().style.fontFamily).toContain("Charter")
  })
})

describe("message keys", () => {
  it("never renders a raw key path in place of a string", () => {
    // Arrange — this shipped: `t("skills")` resolved to an OBJECT, because
    // `skills.legend` is nested under it, so next-intl threw INSUFFICIENT_PATH
    // and printed the literal "ResumePage.form.skills" into the form. It was
    // on screen in a bug report screenshot for a whole session before anyone
    // read it as text rather than as a label.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Act — walk the whole tool, every branch that renders its own copy.
    fireEvent.click(screen.getByRole("radio", { name: "Zamonaviy" }))
    fireEvent.click(screen.getByRole("button", { name: /Ish joyi qo'shish/ }))
    fireEvent.click(screen.getByRole("button", { name: /Til qo'shish/ }))
    fireEvent.click(
      screen.getByRole("button", { name: /O'quv yurti qo'shish/ })
    )

    // Assert
    expect(document.body.textContent).not.toMatch(/ResumePage\.|Common\./)
  })
})

describe("narrow-screen pane switch", () => {
  it("keeps the sheet MOUNTED while the form pane is showing", () => {
    // Arrange — hidden, never unmounted. Unmounting would throw away the
    // sheet's layout on every switch and, worse, take `#resume-sheet` out of
    // the document, which is the only thing the print stylesheet reaches for.
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))

    // Act — the form pane is the default.
    const formTab = screen.getByRole("radio", { name: "Ma'lumotlar" })

    // Assert
    expect(formTab).toBeChecked()
    expect(sheet()).toBeInTheDocument()
    expect(sheet().textContent).toContain("Karimova Nilufar Anvarovna")
  })

  it("switches panes without touching the draft", () => {
    // Arrange
    renderTool()
    fireEvent.change(screen.getByLabelText(/F\.I\.Sh/), {
      target: { value: "Test Foydalanuvchi" }
    })

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Rezyume" }))

    // Assert — the paper is the pane now, and the form kept every word.
    expect(screen.getByRole("radio", { name: "Rezyume" })).toBeChecked()
    expect(sheet().textContent).toContain("Test Foydalanuvchi")
    expect(screen.getByLabelText(/F\.I\.Sh/)).toHaveValue("Test Foydalanuvchi")
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

  it("paints the sheet with a colour picked outside the five presets", () => {
    // Arrange
    renderTool()
    fireEvent.click(screen.getByRole("button", { name: /namuna/i }))
    fireEvent.click(screen.getByRole("radio", { name: "Zamonaviy" }))
    fireEvent.change(screen.getByLabelText(/F\.I\.Sh/), {
      target: { value: "Karimova Nilufar" }
    })

    // Act — the native swatch, the same control the QR tool uses.
    fireEvent.change(screen.getByLabelText("O'z rangingiz"), {
      target: { value: "#0f766e" }
    })

    // Assert — the name carries the accent, so the sheet proves it landed.
    const heading = within(sheet()).getByRole("heading", { level: 1 })
    expect(heading).toHaveStyle({ color: "#0f766e" })
    // And no preset claims to be selected any more.
    expect(screen.getByLabelText("Ko'k")).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  it("says so when a picked colour is too pale to read on paper", () => {
    // Arrange — the guard is a stated problem, not a locked palette: the
    // accent prints every section heading, and a pale one is a CV a
    // recruiter's eye slides straight past.
    renderTool()
    fireEvent.click(screen.getByRole("radio", { name: "Zamonaviy" }))
    const custom = screen.getByLabelText("O'z rangingiz")
    expect(screen.queryByText(/kam o'qiladi/)).not.toBeInTheDocument()

    // Act
    fireEvent.change(custom, { target: { value: "#ffe066" } })

    // Assert
    expect(screen.getByText(/kam o'qiladi/)).toBeInTheDocument()

    // …and it goes away again once the colour can carry text.
    fireEvent.change(custom, { target: { value: "#0f766e" } })
    expect(screen.queryByText(/kam o'qiladi/)).not.toBeInTheDocument()
  })

  it("falls back to a readable accent when a draft holds an old preset id", () => {
    // Arrange — `accent` used to store "kok"; `color: kok` is not an error
    // the browser reports, it silently inherits and the template loses its
    // only colour.
    localStorage.setItem(
      "webiston:rezyume:v1",
      JSON.stringify({ template: "zamonaviy", accent: "kok", fullName: "Test" })
    )

    // Act
    renderTool()

    // Assert
    const heading = within(sheet()).getByRole("heading", { level: 1 })
    expect(heading).toHaveStyle({ color: "#1e5a8a" })
  })
})
