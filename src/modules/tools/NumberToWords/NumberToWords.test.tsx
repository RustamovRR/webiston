import { fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import common from "../../../../messages/common/uz.json"
import messages from "../../../../messages/tools/number-to-words/uz.json"
import { NumberToWords } from "./NumberToWords"

/**
 * The tool, driven the way an accountant drives it.
 *
 * `utils/words.test.ts` proves the numerals and `utils/amount.test.ts` proves
 * the parser; neither can tell you whether the field is CONNECTED to them.
 * That is the class of bug a one-input tool ships: the words are right in a
 * unit test and the box shows the previous amount, or the mode control changes
 * state and nothing else.
 */

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={{ ...messages, ...common }}>
      <NumberToWords />
    </NextIntlClientProvider>
  )
}

const field = () => screen.getByLabelText(/Summani kiriting/i)
const type = (value: string) => fireEvent.change(field(), { target: { value } })

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
  })
})

describe("number to words", () => {
  it("waits for a number instead of showing an error", () => {
    // Arrange / Act — an empty field is a state, not a mistake, and a red
    // message on a box nobody has typed in yet is wrong.
    renderTool()

    // Assert
    expect(
      screen.getByText(messages.NumberToWordsPage.result.empty)
    ).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("writes the sum in both scripts at once", () => {
    // Arrange
    renderTool()

    // Act
    type("1250000")

    // Assert — the two columns are the whole proposition of this tool.
    expect(
      screen.getByText("Bir million ikki yuz ellik ming so'm")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Бир миллион икки юз эллик минг сўм")
    ).toBeInTheDocument()
  })

  it("reads a sum pasted with spaces and a comma", () => {
    // Arrange — the shape a sum arrives in from 1C or a spreadsheet.
    renderTool()

    // Act
    type("1 250 000,50")

    // Assert
    expect(
      screen.getByText("Bir million ikki yuz ellik ming so'm ellik tiyin")
    ).toBeInTheDocument()
  })

  it("echoes the amount back in groups of three", () => {
    // Arrange / Act — the only way to catch a missing zero before the sum
    // reaches a document.
    renderTool()
    type("1250000")

    // Assert
    expect(screen.getByText("1 250 000")).toBeInTheDocument()
  })

  it("drops the currency in plain mode", () => {
    // Arrange
    renderTool()
    type("2026")
    expect(screen.getByText("Ikki ming yigirma olti so'm")).toBeInTheDocument()

    // Act
    fireEvent.click(screen.getByRole("radio", { name: /Oddiy son/i }))

    // Assert
    expect(screen.getByText("Ikki ming yigirma olti")).toBeInTheDocument()
  })

  /**
   * Uzbek reads a decimal as a fraction whose denominator changes with the
   * number of places. Rather than invent that grammar, plain mode names the
   * whole part — and says so, instead of dropping it in silence.
   */
  it("says when a fractional part was left out", () => {
    // Arrange
    renderTool()
    fireEvent.click(screen.getByRole("radio", { name: /Oddiy son/i }))

    // Act
    type("12,50")

    // Assert
    expect(
      screen.getByText(messages.NumberToWordsPage.result.fractionIgnored)
    ).toBeInTheDocument()
  })

  it("turns the capital off when it is not wanted", () => {
    // Arrange
    renderTool()
    type("1000")
    expect(screen.getByText("Bir ming so'm")).toBeInTheDocument()

    // Act
    fireEvent.click(screen.getByLabelText(/Bosh harf/i))

    // Assert
    expect(screen.getByText("bir ming so'm")).toBeInTheDocument()
  })

  it("refuses text instead of naming part of it", () => {
    // Arrange / Act
    renderTool()
    type("12ab")

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(
      /raqamga o'xshamayapti/i
    )
    expect(field()).toHaveAttribute("aria-invalid", "true")
  })

  it("says so rather than half-naming a number past the limit", () => {
    // Arrange / Act — 19 digits.
    renderTool()
    type("1".repeat(19))

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(/juda katta/i)
  })

  it("copies the script that was asked for", async () => {
    // Arrange
    renderTool()
    type("1000")

    // Act — the Cyrillic card's button, not the Latin one.
    const buttons = screen.getAllByRole("button", { name: /nusxalash/i })
    fireEvent.click(buttons[1])

    // Assert
    await vi.waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Бир минг сўм")
    )
  })

  it("empties the field when cleared", () => {
    // Arrange
    renderTool()
    type("1000")

    // Act
    fireEvent.click(screen.getByRole("button", { name: /tozalash/i }))

    // Assert
    expect(field()).toHaveValue("")
    expect(
      screen.getByText(messages.NumberToWordsPage.result.empty)
    ).toBeInTheDocument()
  })
})
