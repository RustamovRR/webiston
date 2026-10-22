import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/latin-cyrillic/uz.json"
import newAlphabetMessages from "../../../../messages/tools/yangi-alifbo/uz.json"
import type { ConverterPage } from "./constants"
import { LatinCyrillicPage } from "./LatinCyrillic"
import { useLatinCyrillicDraftStore, useTransliterationStore } from "./stores"

/**
 * The converter, driven the way a visitor drives it — through the rendered
 * UI, per `testing-strategy.md`'s integration layer. The conversion RULES are
 * the transliteration package's 207 unit tests; nothing here re-proves them.
 * What lives here is the wiring, because that is where this tool's shipped
 * bugs were: a locale switch that emptied the field, an Escape inside the
 * exceptions dialog that wiped the source text, a filename chip that kept
 * naming a file the panel no longer held.
 */

const messages = { ...commonMessages, ...toolMessages }

/** Each route's heading, as its `page.tsx` resolves it on the server. */
const HEADER: Record<ConverterPage, { title: string; description: string }> = {
  "latin-cyrillic": toolMessages.LatinCyrillicPage.ToolHeader,
  "yangi-alifbo": newAlphabetMessages.NewAlphabetPage.ToolHeader
}

function renderTool(page: ConverterPage = "latin-cyrillic") {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <LatinCyrillicPage page={page} {...HEADER[page]} />
    </NextIntlClientProvider>
  )
}

const type = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } })

const sourceBox = () => screen.getByRole("textbox")

/** The result `<pre>`, or null while the target empty state is showing. */
const resultText = () => {
  const region = screen.queryByRole("region", { name: /natija/i })
  return region?.querySelector("pre")?.textContent ?? null
}

beforeEach(() => {
  // Module-scope stores survive between tests exactly the way they survive a
  // locale remount — reset them the same way the QR tests do.
  useLatinCyrillicDraftStore.setState({ sourceText: "" })
  useTransliterationStore.setState({ preferences: {}, exceptions: [] })
  window.localStorage.clear()
})

describe("LatinCyrillic converter", () => {
  it("offers the sample and paste actions while the source is empty", () => {
    // Arrange + Act
    renderTool()

    // Assert
    expect(screen.getByText("Namunani sinash")).toBeInTheDocument()
    expect(resultText()).toBeNull()
  })

  it("converts Latin input to Cyrillic in auto mode", async () => {
    // Arrange
    renderTool()

    // Act
    type(sourceBox(), "Salom dunyo")

    // Assert — the 90 ms debounce has to elapse first
    await waitFor(() => expect(resultText()).toBe("Салом дунё"))
    expect(screen.getByRole("radio", { name: "Avto" })).toBeChecked()
  })

  it("resolves the direction from Cyrillic input and flips the panel labels", async () => {
    // Arrange
    renderTool()

    // Act
    type(sourceBox(), "Салом дунё")

    // Assert
    await waitFor(() => expect(resultText()).toBe("Salom dunyo"))
    expect(screen.getByText("Kirill matn")).toBeInTheDocument()
    expect(screen.getByText("Lotin natija")).toBeInTheDocument()
  })

  it("honours an explicit direction over the detector", async () => {
    // Arrange
    renderTool()
    type(sourceBox(), "Салом")

    // Act — the user forces Кирилл on text that is already Cyrillic
    fireEvent.click(screen.getByRole("radio", { name: "Кирилл" }))

    // Assert — identity, because the user said so
    await waitFor(() => expect(resultText()).toBe("Салом"))
  })

  it("swap moves the result into the source and pins the way back", async () => {
    // Arrange
    renderTool()
    type(sourceBox(), "Salom dunyo")
    await waitFor(() => expect(resultText()).toBe("Салом дунё"))

    // Act
    fireEvent.click(
      screen.getByRole("button", { name: "Yo'nalishni almashtirish" })
    )

    // Assert — the source now holds the Cyrillic, converting back to Latin
    expect(sourceBox()).toHaveValue("Салом дунё")
    await waitFor(() => expect(resultText()).toBe("Salom dunyo"))
    expect(screen.getByRole("radio", { name: "Lotin" })).toBeChecked()
  })

  it("sample button fills the source and the sample converts", async () => {
    // Arrange
    renderTool()

    // Act
    fireEvent.click(screen.getByText("Namunani sinash"))

    // Assert
    expect((sourceBox() as HTMLTextAreaElement).value).toMatch(/^Assalomu/)
    await waitFor(() => expect(resultText()).toMatch(/^Ассалому/))
  })

  it("Escape inside the source clears the tool", async () => {
    // Arrange
    renderTool()
    type(sourceBox(), "Salom")
    await waitFor(() => expect(resultText()).toBe("Салом"))

    // Act
    fireEvent.keyDown(sourceBox(), { key: "Escape" })

    // Assert
    expect(sourceBox()).toHaveValue("")
  })

  it("Escape inside the exceptions dialog does NOT clear the source", async () => {
    // Regression: the dialog is portaled outside the tool's DOM but inside
    // its React tree, so its keys bubble to the tool's key handler. Before
    // the containment guard this wiped the visitor's text.
    // Arrange
    renderTool()
    type(sourceBox(), "Salom dunyo")
    fireEvent.click(screen.getByRole("button", { name: "Istisnolar" }))
    const dialogInput = await screen.findByRole("textbox", {
      name: /So'z qo'shing/i
    })

    // Act
    fireEvent.keyDown(dialogInput, { key: "Escape" })

    // Assert — the text survived
    expect(sourceBox()).toHaveValue("Salom dunyo")
  })

  it("an added exception survives conversion and is reported in the footer", async () => {
    // Arrange
    renderTool()
    type(sourceBox(), "Webiston platformasi")
    fireEvent.click(screen.getByRole("button", { name: "Istisnolar" }))
    const dialogInput = await screen.findByRole("textbox", {
      name: /So'z qo'shing/i
    })

    // Act — type the term and submit the form with Enter, like a person
    type(dialogInput, "Webiston")
    fireEvent.submit(dialogInput.closest("form") as HTMLFormElement)

    // Assert — chip in the dialog, term untouched in the result, footer note
    expect(
      screen.getByRole("button", { name: /o'chirish: Webiston|Webiston/i })
    ).toBeInTheDocument()
    await waitFor(() => expect(resultText()).toBe("Webiston платформаси"))
    expect(screen.getByText(/O'zgarishsiz saqlandi/)).toHaveTextContent(
      "Webiston"
    )
  })

  it("rejects a duplicate exception with a visible reason", async () => {
    // Arrange
    renderTool()
    useTransliterationStore.setState({ exceptions: ["Webiston"] })
    fireEvent.click(screen.getByRole("button", { name: "Istisnolar" }))
    const dialogInput = await screen.findByRole("textbox", {
      name: /So'z qo'shing/i
    })

    // Act — same word, different case
    type(dialogInput, "webiston")
    fireEvent.submit(dialogInput.closest("form") as HTMLFormElement)

    // Assert — rejected out loud, input kept for correction
    expect(screen.getByRole("alert")).toHaveTextContent(
      '"webiston" allaqachon ro\'yxatda.'
    )
    expect(dialogInput).toHaveValue("webiston")
    expect(useTransliterationStore.getState().exceptions).toEqual(["Webiston"])
  })

  it("Cmd+Enter copies the result and acknowledges it", async () => {
    // Arrange
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", {
      ...window.navigator,
      clipboard: { writeText }
    })
    renderTool()
    type(sourceBox(), "Salom")
    await waitFor(() => expect(resultText()).toBe("Салом"))

    // Act
    fireEvent.keyDown(sourceBox(), { key: "Enter", metaKey: true })

    // Assert
    expect(writeText).toHaveBeenCalledWith("Салом")
    await screen.findByText("Nusxalandi!")
    vi.unstubAllGlobals()
  })

  it("keeps the draft when the tool remounts, as on a locale switch", async () => {
    // Arrange — first mount, the visitor types
    const first = renderTool()
    type(sourceBox(), "Salom dunyo")
    await waitFor(() => expect(resultText()).toBe("Салом дунё"))

    // Act — the [locale] segment change unmounts and remounts the tree
    first.unmount()
    renderTool()

    // Assert — the module-scope draft survived the remount
    expect(sourceBox()).toHaveValue("Salom dunyo")
    await waitFor(() => expect(resultText()).toBe("Салом дунё"))
  })
})

describe("the new alphabet, behind both front doors", () => {
  it("converts 1995 Latin into the new alphabet on the Latin-Cyrillic page", async () => {
    // Arrange
    renderTool()
    type(sourceBox(), "O'zbekiston, Toshkent shahri")

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Yangi lotin" }))

    // Assert
    await waitFor(() => expect(resultText()).toBe("Özbekiston, Toşkent şahri"))
    expect(screen.getByText("Yangi lotin natija")).toBeInTheDocument()
  })

  it("takes Cyrillic straight into the new alphabet", async () => {
    // Arrange
    renderTool()
    fireEvent.click(screen.getByRole("radio", { name: "Yangi lotin" }))

    // Act
    type(sourceBox(), "Тошкент шаҳри")

    // Assert — and the source panel names what it read
    await waitFor(() => expect(resultText()).toBe("Toşkent şahri"))
    expect(screen.getByText("Kirill matn")).toBeInTheDocument()
  })

  it("Lotin brings new-alphabet text back to the 1995 Latin", async () => {
    // Arrange
    renderTool()
    type(sourceBox(), "Toşkent şahri")

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Lotin" }))

    // Assert
    await waitFor(() => expect(resultText()).toBe("Toshkent shahri"))
    expect(screen.getByText("Yangi lotin matn")).toBeInTheDocument()
  })

  it("Avto never guesses the new alphabet: new-alphabet text goes to Cyrillic", async () => {
    // Arrange
    renderTool()

    // Act
    type(sourceBox(), "Toşkent şahri")

    // Assert
    await waitFor(() => expect(resultText()).toBe("Тошкент шаҳри"))
    expect(screen.getByRole("radio", { name: "Avto" })).toBeChecked()
  })

  it("the yangi-alifbo page opens on the new alphabet, under its own heading", async () => {
    // Arrange + Act
    renderTool("yangi-alifbo")
    type(sourceBox(), "O'zbekiston")

    // Assert
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      HEADER["yangi-alifbo"].title
    )
    expect(screen.getByRole("radio", { name: "Yangi lotin" })).toBeChecked()
    await waitFor(() => expect(resultText()).toBe("Özbekiston"))
  })

  it("offers every alphabet there too — the same tool, not a cut-down one", async () => {
    // Arrange
    renderTool("yangi-alifbo")
    type(sourceBox(), "Toşkent şahri")

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "Кирилл" }))

    // Assert — and the file, download and exceptions actions are all there
    await waitFor(() => expect(resultText()).toBe("Тошкент шаҳри"))
    expect(screen.getByRole("button", { name: "Istisnolar" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Fayl" })).toBeEnabled()
  })

  it("each page remembers its own choice", () => {
    // Arrange — the visitor pins Кирилл on the Latin-Cyrillic page
    const first = renderTool()
    fireEvent.click(screen.getByRole("radio", { name: "Кирилл" }))
    first.unmount()

    // Act
    const second = renderTool("yangi-alifbo")

    // Assert — the other page still opens on its own default…
    expect(screen.getByRole("radio", { name: "Yangi lotin" })).toBeChecked()
    second.unmount()

    // …and the first one kept the pin
    renderTool()
    expect(screen.getByRole("radio", { name: "Кирилл" })).toBeChecked()
  })

  it("swap sends new-alphabet text back to the alphabet it started in", async () => {
    // Arrange
    renderTool("yangi-alifbo")
    type(sourceBox(), "Toshkent shahri")
    await waitFor(() => expect(resultText()).toBe("Toşkent şahri"))

    // Act
    fireEvent.click(
      screen.getByRole("button", { name: "Yo'nalishni almashtirish" })
    )

    // Assert
    expect(sourceBox()).toHaveValue("Toşkent şahri")
    expect(screen.getByRole("radio", { name: "Lotin" })).toBeChecked()
    await waitFor(() => expect(resultText()).toBe("Toshkent shahri"))
  })

  it("swap still turns round when the text was already in the target", async () => {
    // Arrange — Lotin pinned over Latin text: the result IS the input
    renderTool()
    fireEvent.click(screen.getByRole("radio", { name: "Lotin" }))
    type(sourceBox(), "Salom dunyo")
    await waitFor(() => expect(resultText()).toBe("Salom dunyo"))

    // Act
    fireEvent.click(
      screen.getByRole("button", { name: "Yo'nalishni almashtirish" })
    )

    // Assert — it goes to Cyrillic, as the old direction flip did
    expect(screen.getByRole("radio", { name: "Кирилл" })).toBeChecked()
    await waitFor(() => expect(resultText()).toBe("Салом дунё"))
  })

  it("swap sends a half-converted document back to the 1995 Latin", async () => {
    // Arrange — one ö makes this read as new-alphabet text already
    renderTool("yangi-alifbo")
    type(sourceBox(), "Toshkent shahri, Özbekiston")
    await waitFor(() => expect(resultText()).toBe("Toşkent şahri, Özbekiston"))

    // Act
    fireEvent.click(
      screen.getByRole("button", { name: "Yo'nalishni almashtirish" })
    )

    // Assert
    expect(screen.getByRole("radio", { name: "Lotin" })).toBeChecked()
    await waitFor(() =>
      expect(resultText()).toBe("Toshkent shahri, O'zbekiston")
    )
  })

  it("the draft follows the visitor from one page to the other", async () => {
    // Arrange — typed on the Latin-Cyrillic page
    const first = renderTool()
    type(sourceBox(), "Toshkent shahri")
    await waitFor(() => expect(resultText()).toBe("Тошкент шаҳри"))
    first.unmount()

    // Act — the link to the new-alphabet page is a soft navigation
    renderTool("yangi-alifbo")

    // Assert
    expect(sourceBox()).toHaveValue("Toshkent shahri")
    await waitFor(() => expect(resultText()).toBe("Toşkent şahri"))
  })

  it("the sample shows all four new letters and the tutuq", async () => {
    // Arrange
    renderTool("yangi-alifbo")

    // Act
    fireEvent.click(screen.getByText("Namunani sinash"))

    // Assert — ö ğ ş ç, and sanʼat's apostrophe as U+02BC
    await waitFor(() =>
      expect(resultText()).toBe(
        "Assalomu alaykum! Özbekiston — gözal mamlakat. Bugun Toşkent şahrida işçilar sanʼat va madaniyat haqida suhbatlaşdi."
      )
    )
  })
})

describe("stored preference migration", () => {
  const STORAGE_KEY = "latin-cyrillic-storage"

  const rehydrateFrom = async (state: object, version: number) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version }))
    await useTransliterationStore.persist.rehydrate()
    return useTransliterationStore.getState()
  }

  it("keeps a v3 visitor's pinned direction, as the alphabet it led to", async () => {
    // Arrange + Act
    const state = await rehydrateFrom(
      { preference: "cyrillic-to-latin", exceptions: ["Webiston"] },
      3
    )

    // Assert
    expect(state.preferences).toEqual({ "latin-cyrillic": "latin" })
    expect(state.exceptions).toEqual(["Webiston"])
  })

  it("leaves a v3 'auto' to the route defaults", async () => {
    // Arrange + Act
    const state = await rehydrateFrom({ preference: "auto", exceptions: [] }, 3)

    // Assert
    expect(state.preferences).toEqual({})
  })

  it.each([
    ["an option this build does not know", { "latin-cyrillic": "foo" }],
    ["a null map", null]
  ])(
    "ignores a v4 record holding %s, and still converts",
    async (_, preferences) => {
      // Arrange — same version, so zustand skips `migrate` entirely
      await rehydrateFrom({ preferences, exceptions: [] }, 4)

      // Act
      renderTool()
      type(sourceBox(), "Salom")

      // Assert — the route default, and no crash on the first keystroke
      expect(screen.getByRole("radio", { name: "Avto" })).toBeChecked()
      await waitFor(() => expect(resultText()).toBe("Салом"))
    }
  )

  it("survives a v2 record with no exception list and a junk value", async () => {
    // Arrange + Act — "constructor" is a key every plain object inherits
    const state = await rehydrateFrom({ preference: "constructor" }, 2)

    // Assert
    expect(state.preferences).toEqual({})
    expect(state.exceptions).toEqual([])
  })
})

describe("LatinCyrillic file import", () => {
  it("imports a dropped .txt, normalises it, and shows the filename chip", async () => {
    // Arrange
    renderTool()
    const file = new File(
      ["Birinchi qator.\r\n\r\n\r\n\r\nIkkinchi qator.  "],
      "hujjat.txt",
      { type: "text/plain" }
    )

    // Act — drop on the tool, the way DropZone advertises
    fireEvent.drop(sourceBox(), {
      dataTransfer: { files: [file], types: ["Files"] }
    })

    // Assert — CRLF gone, blank-line run collapsed, trailing space trimmed
    await waitFor(() =>
      expect(sourceBox()).toHaveValue("Birinchi qator.\n\nIkkinchi qator.")
    )
    expect(screen.getByText("hujjat.txt")).toBeInTheDocument()
  })

  it("drops the filename chip once the visitor edits the imported text", async () => {
    // Arrange
    renderTool()
    const file = new File(["Salom"], "hujjat.txt", { type: "text/plain" })
    fireEvent.drop(sourceBox(), {
      dataTransfer: { files: [file], types: ["Files"] }
    })
    await waitFor(() => expect(sourceBox()).toHaveValue("Salom"))

    // Act — one edit; the panel no longer holds the file's text
    type(sourceBox(), "Salom dunyo")

    // Assert
    expect(screen.queryByText("hujjat.txt")).toBeNull()
  })

  it("rejects an unsupported file type out loud and keeps the text", async () => {
    // Arrange
    renderTool()
    type(sourceBox(), "Salom")

    // Act
    fireEvent.drop(sourceBox(), {
      dataTransfer: {
        files: [new File(["x"], "rasm.jpg", { type: "image/jpeg" })],
        types: ["Files"]
      }
    })

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Bu format qo'llab-quvvatlanmaydi"
    )
    expect(sourceBox()).toHaveValue("Salom")
  })
})
