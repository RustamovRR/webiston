import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import common from "../../../../messages/common/uz.json"
import messages from "../../../../messages/tools/code-snapshot/uz.json"
import { CodeSnapshot } from "./CodeSnapshot"
import { DIMMED_OPACITY, THEME_PALETTES } from "./constants"
import {
  type CanvasRecording,
  type DrawnText,
  installCanvasStub
} from "./test-canvas"
import { __resetCanvasLimitCache } from "./utils/canvas-limits"

/**
 * The tool, driven the way a visitor drives it.
 *
 * The Trophy's fat layer, and for this tool it is the only layer that can see
 * the failures that matter. `layout.test.ts` proves the geometry and
 * `highlight.test.ts` proves the token decoding, but neither can tell you
 * whether the theme dropdown is *connected* to the paint — and that is exactly
 * the class of bug a picture-producing tool ships: state changes, the control
 * shows the new value, and the canvas keeps drawing the old one.
 *
 * Every assertion reads the recorded draw calls rather than the component's
 * internals, so the tests survive any refactor that keeps the picture the same.
 */

const FONTS = {
  "jetbrains-mono": "JetBrainsMonoTest",
  "fira-code": "FiraCodeTest",
  "geist-mono": "GeistMonoTest",
  "ibm-plex-mono": "IBMPlexMonoTest"
}

let canvas: CanvasRecording

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={{ ...messages, ...common }}>
      <CodeSnapshot fontFamilies={FONTS} />
    </NextIntlClientProvider>
  )
}

/**
 * The picture on the canvas right now, once the debounce and the font load
 * have settled.
 *
 * Always the LATEST pass, never the accumulation. A paint already in flight
 * when a test acts lands afterwards, and an accumulating recording would show
 * the old snippet and the new one at once — which is how the first version of
 * the reset test "passed" a state it had not actually reached.
 */
async function painted(
  predicate: (texts: DrawnText[]) => boolean = () => true,
  timeout = 5000
) {
  await waitFor(
    () => {
      expect(canvas.latest().length).toBeGreaterThan(0)
      expect(predicate(canvas.latest())).toBe(true)
    },
    { timeout }
  )
  return canvas.latest()
}

/** Every drawn run joined back into one string, for "does it say X" checks. */
const asText = (texts: DrawnText[]) => texts.map((t) => t.text).join("")

/**
 * How many lines the picture has, counted from distinct baselines.
 *
 * The reliable way to see a line break in the recording. `asText` cannot do
 * it: the painter refuses to draw whitespace-only tokens — they were adding
 * empty width to the right of the card — so the joined string has neither the
 * spaces nor the newlines of the source.
 */
const lineCount = (texts: DrawnText[]) => new Set(texts.map((t) => t.y)).size

/**
 * Wait until a paint that STARTED AFTER the given pass count has finished.
 *
 * `painted()` cannot answer this: its condition is already true from the
 * previous picture, so a test that reads a counter straight after an act reads
 * it before the repaint and passes for the wrong reason.
 */
async function repainted(passesBefore: number) {
  await waitFor(
    () => {
      expect(canvas.passes.length).toBeGreaterThan(passesBefore)
    },
    { timeout: 5000 }
  )
}

/** A snippet the detector is certain about, used to drive the paste tests. */
const PYTHON = `import os
from pathlib import Path

def collect(root: str) -> list[str]:
    found = []
    for entry in Path(root).iterdir():
        found.append(str(entry))
    return found
`

/**
 * Paste, the way a browser does it.
 *
 * `fireEvent.paste` alone changes nothing about the value — the real browser
 * inserts the text itself, and jsdom does not. So both halves are driven: the
 * `paste` event that the detector listens to, and the value change that the
 * editor would have received from it.
 */
function pasteInto(element: HTMLElement, text: string) {
  fireEvent.paste(element, {
    clipboardData: { getData: () => text }
  })
  fireEvent.change(element, { target: { value: text } })
}

/**
 * Drop a file on the editor's box.
 *
 * The target is the scroll box, not the textarea: a file has to be accepted
 * anywhere over the picture, including the margin around a short snippet. It
 * is found through the textarea so the test does not hard-code the markup.
 */
function dropOnEditor(file: File) {
  const box = codeInput().closest("div.overflow-auto")
  if (!box) throw new Error("editor drop target not found")
  fireEvent.drop(box, { dataTransfer: { files: [file], types: ["Files"] } })
}

/**
 * Shiki bundles TWO Dracula themes — "Dracula Theme" and "Dracula Theme Soft".
 * An `/Dracula/i` regex matches both and the query throws on the ambiguity,
 * which is the picker doing its job: 65 swatches contain several near-twins.
 */
const DRACULA = "Dracula Theme"

/**
 * jsdom normalises an inline `background-color` to `rgb()`, so a hex from the
 * palette has to be converted before it can be compared with one.
 */
function hexToRgb(hex: string) {
  // `#abc` is `#aabbcc`; the bundle really does contain both forms.
  const full =
    hex.length === 4 ? hex.replace(/[0-9a-f]/gi, (digit) => digit + digit) : hex
  const [r, g, b] = [1, 3, 5].map((at) =>
    Number.parseInt(full.slice(at, at + 2), 16)
  )
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * The editor IS the picture: one textarea, overlaid on the canvas.
 *
 * The canvas is `aria-hidden` on purpose — it carries no text a screen reader
 * could use, and the textarea over it holds the accessible name. So it is
 * queried by element rather than by role; there is no role to query.
 */
const codeInput = () => screen.getByRole("textbox", { name: /rasmga/i })
const preview = () => document.querySelector("canvas") as HTMLCanvasElement

/**
 * Radix renders its listbox in a portal, so the options are not inside the
 * trigger's card. Open by trigger name, then pick by option name.
 */
async function chooseOption(triggerName: RegExp, optionName: RegExp) {
  const trigger = screen.getByRole("combobox", { name: triggerName })
  fireEvent.click(trigger)
  const option = await screen.findByRole("option", { name: optionName })
  fireEvent.click(option)
}

beforeEach(() => {
  canvas = installCanvasStub()
  // The probe caches at module scope, and the stub decides its answer.
  __resetCanvasLimitCache()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  // jsdom keeps one document for the whole file, so a hash set by a share
  // test would reopen that picture in every test after it — including the
  // ones that assert the STARTER snippet is on screen. Cleared here rather
  // than at the end of each test body, which a failing assertion skips.
  window.location.hash = ""
})

describe("code snapshot", () => {
  it("paints the starter snippet on first render", async () => {
    // Arrange / Act
    renderTool()
    const texts = await painted()

    // Assert — the whole starter function reached the canvas, split into
    // coloured runs rather than drawn as one blob.
    const joined = asText(texts)
    expect(joined).toContain("export")
    expect(joined).toContain("greet")
    expect(new Set(texts.map((t) => t.fillStyle)).size).toBeGreaterThan(1)
  })

  it("redraws what the visitor types", async () => {
    // Arrange
    renderTool()
    await painted()

    // Act
    fireEvent.change(codeInput(), { target: { value: "const answer = 42" } })

    // Assert
    const texts = await painted((t) => asText(t).includes("42"))
    const joined = asText(texts)
    expect(joined).toContain("answer")
    expect(joined).not.toContain("greet")
  })

  /**
   * The wiring bug this exists for: a theme that updates the dropdown and the
   * state but never reaches `codeToTokens`, leaving the picture on the old
   * palette. Colours are the only observable that can tell the difference.
   */
  it("repaints in the new palette when the theme changes", async () => {
    // Arrange
    renderTool()
    const before = new Set((await painted()).map((t) => t.fillStyle))

    // Act
    fireEvent.click(screen.getByRole("radio", { name: DRACULA }))

    // Assert
    const after = new Set(
      (
        await painted((texts) => texts.some((t) => !before.has(t.fillStyle)))
      ).map((t) => t.fillStyle)
    )
    expect([...after].some((colour) => !before.has(colour))).toBe(true)
  })

  /**
   * The swatch has to show the theme's OWN colours, not a hand-copied guess.
   * They come from `theme-palette.json`, generated by the same `codeToTokens`
   * call the painter uses — so this asserts the two agree by checking that the
   * swatch's background is literally what the canvas paints the card with.
   */
  it("shows every bundled theme as a swatch in its own colours", async () => {
    // Arrange / Act
    renderTool()
    await painted()
    const swatches = screen.getAllByRole("radio", { name: /./ })

    // Assert — all 65, not a curated handful. The count is the tool's headline
    // claim and a picker that quietly shows 20 makes it a lie.
    const themeSwatches = swatches.filter((el) =>
      el.closest("fieldset")?.textContent?.includes("Mavzu")
    )
    expect(themeSwatches).toHaveLength(THEME_PALETTES.length)
    expect(THEME_PALETTES).toHaveLength(65)

    // And the count is SAID, in the visitor's language. `toBeTruthy()` would
    // pass on the literal "CodeSnapshotPage.style.themeCount", which is what a
    // missing key renders as — so the assertion rejects it by name. Not
    // hypothetical: a dev server holding a message cache older than the key
    // puts exactly that on screen.
    const group = screen.getByRole("group", { name: /Mavzu/i })
    expect(group.textContent).toContain("65 ta mavzu")
    expect(group.textContent).not.toMatch(/CodeSnapshotPage\./)

    // Dracula's card is #282A36; the swatch has to say so too.
    const dracula = THEME_PALETTES.find((theme) => theme.id === "dracula")
    const chip = screen
      .getByRole("radio", { name: DRACULA })
      .parentElement?.querySelector<HTMLElement>("[style*='background-color']")
    expect(chip?.style.backgroundColor).toBe(hexToRgb(dracula?.bg ?? ""))
  })

  /**
   * A regression guard for a bug jsdom cannot see.
   *
   * Picking a theme used to jump the window **906px** down. The swatches are
   * native radios styled through a hidden input, and the input was `sr-only` —
   * Tailwind collapses that to 1×1px with `clip-path: inset(50%)`, so it has
   * no visible area at all. Clicking moves focus to it, the browser scrolls a
   * zero-area element into view, and the arithmetic runs away: `input.focus()`
   * alone moved the page **1135px**, while `focus({ preventScroll: true })`
   * moved it 0 — which is what named the cause.
   *
   * jsdom has no layout, so the scroll itself cannot be asserted here. What
   * CAN be pinned is the cause: the focusable input has to carry the geometry
   * of the swatch you can see. Measured after the fix, in a real browser:
   * page moved **0**, and the scroll box still reveals a swatch below its fold.
   */
  it("keeps the swatch radios sized, not collapsed to a point", async () => {
    // Arrange — the two swatch grids only. `SegmentedControl` in
    // `@webiston/ui` still uses `sr-only`, and it was checked rather than
    // assumed: clicking 1x/2x/3x moves the page **0px**. The runaway needs a
    // tall scroll container to happen in, which the scale control is not, so
    // there is no defect there to fix and no reason to touch a component 20
    // other tools render.
    renderTool()
    await painted()
    const swatches = screen
      .getAllByRole("radio")
      .filter((radio) =>
        /Mavzu|Fon/.test(
          radio.closest("fieldset")?.querySelector("legend")?.textContent ?? ""
        )
      )

    // Assert
    expect(swatches.length).toBeGreaterThan(60)
    const collapsed = swatches.filter((radio) =>
      radio.className.split(/\s+/).includes("sr-only")
    )
    expect(collapsed).toEqual([])
  })

  it("paints the gradient a background chip stands for", async () => {
    // Arrange
    renderTool()
    await painted()
    const gradientsBefore = canvas.gradients
    const passesBefore = canvas.passes.length

    // Act — "Shafaq" is a gradient preset, and so is the default "Yarim tun",
    // so the observable is a NEW gradient, not the first one.
    fireEvent.click(screen.getByRole("radio", { name: /Shafaq/i }))

    // Assert
    await repainted(passesBefore)
    expect(canvas.gradients).toBeGreaterThan(gradientsBefore)
  })

  /**
   * The observable here is the fill COLOUR, not whether a fill happened.
   *
   * The first version of this test counted gradients, and a mutation that
   * deleted the `kind === "none"` early return survived it — correctly, as it
   * turns out: that path then fills with `transparent`, which is a no-op. The
   * requirement was never "do not call fillRect", it is "nothing opaque covers
   * the canvas", and only the recorded `fillStyle` can say that.
   */
  it("leaves nothing opaque behind the transparent background", async () => {
    // Arrange
    renderTool()
    await painted()
    const fillsBefore = canvas.fills.length
    const passesBefore = canvas.passes.length

    // Act
    fireEvent.click(screen.getByRole("radio", { name: /Shaffof/i }))

    // Assert — waiting for the repaint FIRST is what makes this a test rather
    // than a coin flip: read the recording too early and it is unchanged
    // simply because nothing has been drawn yet.
    await repainted(passesBefore)
    const fullBleed = canvas.fills
      .slice(fillsBefore)
      .filter((fill) => fill.x === 0 && fill.y === 0)
    expect(fullBleed.every((fill) => fill.fillStyle === "transparent")).toBe(
      true
    )
  })

  /**
   * Language has to change the TOKENISATION, not just a label. Plain text is
   * the sharpest probe: one grammar-less run per line instead of many.
   */
  it("re-tokenises when the language changes", async () => {
    // Arrange
    renderTool()
    const before = await painted()
    const colouredRuns = before.length

    // Act — "Markdown" tokenises a TypeScript function completely differently.
    await chooseOption(/Til/i, /^Markdown$/i)

    // Assert — same characters, different number of runs.
    const after = await painted((texts) => texts.length !== colouredRuns)
    expect(after.length).not.toBe(colouredRuns)
    expect(asText(after)).toContain("greet")
  })

  it("draws line numbers only when they are switched on", async () => {
    // Arrange
    renderTool()
    const before = await painted()
    expect(before.some((t) => t.text === "1")).toBe(false)

    // Act
    fireEvent.click(screen.getByLabelText(/Qator raqamlarini/i))

    // Assert — 1..4 for the four-line starter snippet.
    const after = await painted((texts) => texts.some((t) => t.text === "1"))
    const numbers = after.filter((t) => /^\d+$/.test(t.text)).map((t) => t.text)
    expect(numbers).toEqual(["1", "2", "3", "4"])
  })

  it("changes the font size in the drawn font string", async () => {
    // Arrange
    renderTool()
    const before = await painted()
    expect(before.every((t) => t.font.includes("14px"))).toBe(true)

    // Act
    await chooseOption(/Shrift o'lchami/i, /^24px$/)

    // Assert
    const after = await painted((texts) =>
      texts.some((t) => t.font.includes("24px"))
    )
    expect(after.every((t) => t.font.includes("24px"))).toBe(true)
  })

  it("switches the family when a different font is chosen", async () => {
    // Arrange
    renderTool()
    const before = await painted()
    expect(before[0].font).toContain(FONTS["jetbrains-mono"])

    // Act
    await chooseOption(/^Shrift$/i, /Geist Mono/i)

    // Assert
    const after = await painted((texts) =>
      texts.some((t) => t.font.includes(FONTS["geist-mono"]))
    )
    expect(after.every((t) => t.font.includes(FONTS["geist-mono"]))).toBe(true)
  })

  /**
   * Scale must change the BACKING STORE and leave the CSS size alone. Getting
   * this backwards is how a tool ships a preview that grows when you pick 3x
   * and an export that never gets sharper.
   */
  it("scales the backing store without resizing the preview", async () => {
    // Arrange
    renderTool()
    await painted()
    // Wait for the geometry to SETTLE, not merely for a paint to have
    // happened. `painted()` returns on the first pass, and an early pass can
    // still be carrying a smaller layout — reading the CSS width there
    // captures a number that changes again a tick later, and the test then
    // compares two different pictures. The settled state is the one where the
    // backing store is exactly the chosen scale times the CSS size.
    await waitFor(() => {
      const css = Number.parseFloat(preview().style.width)
      expect(preview().width).toBe(Math.round(css * 2))
    })
    // Both numbers have to be read NOW: the element is reused across renders,
    // so holding a reference and reading `.height` after the act compares 3x
    // against 3x and proves nothing.
    const cssWidth = preview().style.width
    const widthAt2x = preview().width
    const heightAt2x = preview().height

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "3x" }))

    // Assert
    await waitFor(() => {
      expect(preview().width).toBeGreaterThan(widthAt2x)
    })
    expect(preview().style.width).toBe(cssWidth)
    // 2 → 3 on both axes, so the shape is unchanged.
    expect(preview().width / preview().height).toBeCloseTo(
      widthAt2x / heightAt2x,
      5
    )
    expect(preview().width / widthAt2x).toBeCloseTo(1.5, 2)
  })

  it("reports the exported pixel size, not the preview size", async () => {
    // Arrange
    renderTool()
    await painted()

    // Act
    const caption = await screen.findByText(/piksel/)

    // Assert — the caption multiplies by the scale, so it matches the file.
    const [width, height] =
      caption.textContent?.match(/\d+/g)?.map(Number) ?? []
    expect(width).toBe(preview().width)
    expect(height).toBe(preview().height)
  })

  it("drops the title bar when the frame is removed", async () => {
    // Arrange
    renderTool()
    await painted()
    const withFrame = preview().height

    // Act
    await chooseOption(/Oyna/i, /^Yo'q$/)

    // Assert — the canvas gets shorter by the bar plus both insets.
    await waitFor(() => {
      expect(preview().height).toBeLessThan(withFrame)
    })
  })

  it("puts the window title into the picture", async () => {
    // Arrange
    renderTool()
    await painted()

    // Act
    fireEvent.change(screen.getByLabelText(/Sarlavha/i), {
      target: { value: "App.tsx" }
    })

    // Assert
    const after = await painted((texts) =>
      texts.some((t) => t.text === "App.tsx")
    )
    expect(after.some((t) => t.text === "App.tsx")).toBe(true)
  })

  it("restores every default when reset is pressed", async () => {
    // Arrange
    renderTool()
    await painted()
    fireEvent.change(codeInput(), { target: { value: "const changed = true" } })
    await painted((t) => asText(t).includes("changed"))
    fireEvent.click(screen.getByLabelText(/Boshlang'ich holatga/i))

    // Act
    const after = await painted((t) => asText(t).includes("greet"))

    // Assert
    expect(asText(after)).not.toContain("changed")
    expect(after.every((t) => t.font.includes("14px"))).toBe(true)
  })

  /**
   * Past the browser's per-side canvas cap the picture is silently empty —
   * no throw, no error event, `toBlob` returns null — so the visitor presses
   * Download and receives a broken file. Stepping the scale down and SAYING
   * so is the difference between a smaller image and an inexplicable one.
   */
  it("steps the scale down rather than painting past the canvas cap", async () => {
    // Arrange — the stub resolves the limit to 8192. 200 lines at the
    // default 22px line height is ~4,600 CSS px: 1x fits, 2x does not.
    renderTool()
    await painted()

    // Act
    fireEvent.change(codeInput(), {
      target: {
        value: Array.from({ length: 200 }, (_, i) => `const v${i} = ${i}`).join(
          "\n"
        )
      }
    })

    // Assert — the notice names both the wanted scale and the used one.
    const notice = await screen.findByText(
      /mumkin emas/,
      {},
      { timeout: 15000 }
    )
    expect(notice.textContent).toMatch(/2x/)
    expect(notice.textContent).toMatch(/1x/)
  }, 20000)

  it("says so when no scale at all can hold the picture", async () => {
    // Arrange
    renderTool()
    await painted()

    // Act — far past any cap; there is no scale that works.
    fireEvent.change(codeInput(), {
      target: {
        value: Array.from({ length: 2000 }, (_, i) => `line ${i}`).join("\n")
      }
    })

    // Assert — an alert, not a blank canvas and a dead button.
    const alert = await screen.findByRole("alert", {}, { timeout: 15000 })
    expect(alert.textContent).toBeTruthy()
  }, 20000)

  /**
   * The wiring bug this exists for: a Format button that rewrites the state
   * but never reaches the canvas, so the code the visitor exports is still the
   * unformatted one they were looking at.
   */
  it("formats the code and repaints the picture with it", async () => {
    // Arrange — one line holding two statements.
    renderTool()
    await painted()
    fireEvent.change(codeInput(), { target: { value: "const x=1;const y=2" } })
    await painted((t) => lineCount(t) === 1)

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Formatlash/i }))

    // Assert — the observable is the LINE COUNT, not the drawn characters.
    // The painter skips whitespace-only tokens (it has to; they were adding
    // phantom width to the card), so the joined text of the picture has no
    // spaces in it at all and cannot be searched for "const x = 1".
    const after = await painted((t) => lineCount(t) === 2)
    expect(lineCount(after)).toBe(2)
    expect((codeInput() as HTMLTextAreaElement).value).toBe(
      "const x = 1;\nconst y = 2;"
    )
  })

  it("disables the button for a language Prettier cannot parse", async () => {
    // Arrange
    renderTool()
    await painted()
    expect(screen.getByRole("button", { name: /Formatlash/i })).toBeEnabled()

    // Act — Rust is one of the 342 grammars with no Prettier parser.
    await chooseOption(/Til/i, /^Rust$/i)

    // Assert — disabled, not hidden: a control that vanishes as you scroll a
    // 360-entry dropdown is harder to understand than one visibly unavailable.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Formatlash/i })).toBeDisabled()
    })
  })

  it("says so when the code cannot be parsed", async () => {
    // Arrange
    renderTool()
    await painted()
    fireEvent.change(codeInput(), { target: { value: "const = = 1" } })
    await painted()

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Formatlash/i }))

    // Assert — half-pasted code is the normal state of a snippet, so a button
    // that silently does nothing is the worst available outcome.
    const alert = await screen.findByRole("alert")
    expect(alert.textContent).toMatch(/sintaksis/i)
  })

  /**
   * The whole point of the detector: nobody finds one entry in a list of 360.
   * This drives a real `paste` event rather than calling the util, because the
   * failure worth catching is the wiring — a detector that runs and whose
   * answer never reaches the picker or the tokeniser.
   */
  it("switches the language to the one it detects in a paste", async () => {
    // Arrange
    renderTool()
    await painted()
    expect(screen.getByRole("combobox", { name: /Til/i }).textContent).toMatch(
      /TypeScript/i
    )

    // Act
    pasteInto(codeInput(), PYTHON)

    // Assert — the picker AND the picture. Python's `def` is a keyword only
    // under the Python grammar, so a picker that changed without the
    // tokeniser following would still be a bug.
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /Til/i }).textContent
      ).toMatch(/Python/i)
    })
    const after = await painted((t) => asText(t).includes("def"))
    expect(asText(after)).toContain("collect")
  })

  it("says what it did and lets the visitor undo it", async () => {
    // Arrange
    renderTool()
    await painted()

    // Act
    pasteInto(codeInput(), PYTHON)
    const notice = await screen.findByRole("status")

    // Assert — a guess that silently replaces a choice is a guess nobody
    // trusts, and there would be no way to know why the colours changed.
    expect(notice.textContent).toMatch(/Python/i)
    // In the visitor's language, not as a key path. A missing key renders as
    // the literal "CodeSnapshotPage.style.detected", which the `Python` match
    // above would happily accept once the interpolation fell through.
    expect(notice.textContent).not.toMatch(/CodeSnapshotPage\./)
    expect(notice.textContent).toMatch(/Til aniqlandi/i)
    fireEvent.click(screen.getByRole("button", { name: /Bekor qilish/i }))
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /Til/i }).textContent
      ).toMatch(/TypeScript/i)
    })
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("leaves the language alone when it cannot tell", async () => {
    // Arrange
    renderTool()
    await painted()

    // Act — prose is the most common wrong paste, and a wrong switch is
    // worse than no switch.
    pasteInto(codeInput(), "Bu shunchaki matn, hech qanday kod emas aslida.")

    // Assert
    await painted()
    expect(screen.getByRole("combobox", { name: /Til/i }).textContent).toMatch(
      /TypeScript/i
    )
    expect(screen.queryByRole("status")).toBeNull()
  })

  /**
   * A dropped file answers three questions at once — code, language, and the
   * filename for the title bar — and the wiring bug worth catching is any one
   * of them not arriving.
   */
  it("takes the code, the language and the title from a dropped file", async () => {
    // Arrange
    renderTool()
    await painted()

    // Act
    dropOnEditor(
      new File(['fn main() {\n    println!("salom");\n}'], "greet.rs")
    )

    // Assert
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /Til/i }).textContent
      ).toMatch(/Rust/i)
    })
    expect((codeInput() as HTMLTextAreaElement).value).toContain("println!")
    expect(screen.getByLabelText(/Sarlavha/i)).toHaveValue("greet.rs")
    const after = await painted((t) => asText(t).includes("println!"))
    expect(asText(after)).not.toContain("greet(")
  })

  it("says the picture will take the file while it is being dragged", async () => {
    // Arrange
    renderTool()
    await painted()
    const box = codeInput().closest("div.overflow-auto")
    if (!box) throw new Error("editor drop target not found")

    // Act
    fireEvent.dragOver(box, { dataTransfer: { types: ["Files"] } })

    // Assert — a target that accepts a drop has to look like one before the
    // pointer is released, and it has to say so in the visitor's language.
    const hint = await screen.findByText(/tashlang/i)
    expect(hint.textContent).not.toMatch(/CodeSnapshotPage\./)

    // Leaving turns it off.
    //
    // NOT tested here: crossing onto a CHILD. `dragleave` also fires when the
    // pointer moves from the box onto the canvas inside it, and the handler
    // uses `relatedTarget` to tell the two apart — but jsdom delivers
    // `relatedTarget` as `undefined` on a synthetic `dragleave` (probed), so
    // every drag-leave looks identical from in here. That half is verified in
    // a real browser instead; see the initiative.
    fireEvent.dragLeave(box, { relatedTarget: document.body })
    await waitFor(() => {
      expect(screen.queryByText(/tashlang/i)).toBeNull()
    })
  })

  it("refuses a binary file instead of painting garbage", async () => {
    // Arrange
    renderTool()
    await painted()
    const before = (codeInput() as HTMLTextAreaElement).value

    // Act — a PNG renamed `.ts`. `File.type` is empty for most of the
    // extensions this tool cares about, so the content is what decides.
    dropOnEditor(new File(["\u0089PNG\u0000\u0000IHDR binary"], "image.ts"))

    // Assert
    const alert = await screen.findByRole("alert")
    expect(alert.textContent).toMatch(/matnli fayl emas/i)
    expect((codeInput() as HTMLTextAreaElement).value).toBe(before)
  })

  /**
   * The control ray.so does not have and snappify charges for.
   *
   * `focusLines` and the dimming have existed since Phase 1 and were tested
   * in `layout.test.ts` — with no way to reach them. This is the UI, so the
   * assertion is on the PICTURE: the lines outside the focus set are drawn at
   * reduced alpha, which is the whole point.
   */
  it("dims the other lines when a line number is clicked", async () => {
    // Arrange — the gutter only exists when the numbers are on.
    renderTool()
    await painted()
    fireEvent.click(screen.getByLabelText(/Qator raqamlarini/i))
    await painted((t) => t.some((x) => x.text === "1"))

    const passesBefore = canvas.passes.length

    // Act
    fireEvent.click(screen.getByRole("button", { name: /2-qatorni/i }))

    // Assert — the PICTURE, read back from the recording. The painter dims by
    // setting `globalAlpha`, not by changing colours, so alpha is the only
    // observable that can tell a focused snapshot from an unfocused one.
    await repainted(passesBefore)
    const drawn = canvas.latest()
    // `DIMMED_OPACITY` exactly, not "less than 1": the gutter numbers are
    // ALWAYS drawn at 0.4 — furniture, not content — so "something is faint"
    // is true of every snapshot and would prove nothing.
    expect(drawn.some((t) => t.alpha === DIMMED_OPACITY)).toBe(true)
    expect(drawn.some((t) => t.alpha === 1)).toBe(true)

    // And the button reports its state to assistive tech.
    expect(screen.getByRole("button", { name: /2-qatorni/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: /1-qatorni/i })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  it("stops dimming when the focus set becomes empty again", async () => {
    // Arrange
    renderTool()
    await painted()
    fireEvent.click(screen.getByLabelText(/Qator raqamlarini/i))
    await painted((t) => t.some((x) => x.text === "1"))
    fireEvent.click(screen.getByRole("button", { name: /2-qatorni/i }))
    await painted((t) => t.some((x) => x.alpha < 1))

    // Act — clicking the same line again removes it.
    const passesBefore = canvas.passes.length
    fireEvent.click(screen.getByRole("button", { name: /2-qatorni/i }))

    // Assert — an empty focus set means "no focus", NOT "focus nothing".
    // Getting that backwards dims the entire snapshot, and `layout.test.ts`
    // caught it once as a deliberate mutation; this is the same rule reached
    // through the UI.
    await repainted(passesBefore)
    expect(canvas.latest().some((t) => t.alpha === DIMMED_OPACITY)).toBe(false)
    // The gutter numbers keep their own 0.4; only the FOCUS dimming is gone.
    expect(canvas.latest().some((t) => t.alpha === 1)).toBe(true)
  })

  it("offers no line-number targets when the numbers are off", async () => {
    // Arrange / Act
    renderTool()
    await painted()

    // Assert — the gutter has zero width, so a hit area over it would be an
    // invisible button sitting on the code.
    expect(screen.queryByRole("button", { name: /qatorni/i })).toBeNull()
  })

  it("clears the focus set from the panel", async () => {
    // Arrange
    renderTool()
    await painted()
    fireEvent.click(screen.getByLabelText(/Qator raqamlarini/i))
    await painted((t) => t.some((x) => x.text === "1"))
    fireEvent.click(screen.getByRole("button", { name: /3-qatorni/i }))
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /3-qatorni/i })
      ).toHaveAttribute("aria-pressed", "true")
    })

    // Act
    fireEvent.click(screen.getByRole("button", { name: /Fokusni tozalash/i }))

    // Assert — an empty focus set means "no focus", NOT "focus nothing";
    // getting that backwards dims the entire snapshot.
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /3-qatorni/i })
      ).toHaveAttribute("aria-pressed", "false")
    })
    expect(
      screen.queryByRole("button", { name: /Fokusni tozalash/i })
    ).toBeNull()
  })

  /**
   * A link has to reopen the PICTURE, not merely the code.
   *
   * The failure this exists for is a restore that sets some state and misses
   * the rest — the snippet comes back under the default theme, or at the
   * default size, and the person who was sent it sees something the sender
   * never made.
   */
  it("reopens a shared link with every setting it carried", async () => {
    // Arrange — a hand-written fragment in the uncompressed format, so the
    // test does not depend on `CompressionStream` being present in jsdom.
    window.location.hash = `#0${encodeURIComponent(
      JSON.stringify({
        c: "const shared = true",
        l: "javascript",
        t: "dracula",
        f: "geist-mono",
        s: 24,
        n: true,
        ti: "shared.js"
      })
    )}`

    // Act — wait for a pass that carries ALL of it. The settings do not
    // arrive in one paint: the code lands as soon as the grammar resolves,
    // while the font only reaches the canvas after `document.fonts` settles,
    // so asserting them against the first matching frame is a race.
    renderTool()
    const drawn = await painted(
      (t) =>
        asText(t).includes("shared") &&
        t.some((x) => x.font.includes(FONTS["geist-mono"])) &&
        t.some((x) => x.text === "shared.js") &&
        t.some((x) => x.text === "1"),
      // Longer than the default on purpose: this one waits on a grammar
      // download, a font load AND several settling paints, so under the full
      // suite's parallel load it is the first to run out of a 5s budget.
      // Twice failed that way in a full run and passed alone.
      15000
    )

    // Assert — the code, the font, the size, the title and the gutter all
    // came back, and they came back IN THE PICTURE.
    expect(asText(drawn)).toContain("shared")
    expect(drawn.some((t) => t.font.includes(FONTS["geist-mono"]))).toBe(true)
    expect(drawn.some((t) => t.font.includes("24px"))).toBe(true)
    expect(drawn.some((t) => t.text === "shared.js")).toBe(true)
    expect(drawn.some((t) => t.text === "1")).toBe(true)
    expect(screen.getByRole("combobox", { name: /Til/i }).textContent).toMatch(
      /JavaScript/i
    )
  })

  it("ignores a broken link instead of blanking the tool", async () => {
    // Arrange — junk after a `#` is far more often a chat client mangling a
    // URL than a message worth showing.
    window.location.hash = "#not-a-real-fragment"

    // Act
    renderTool()

    // Assert — the starter snippet, exactly as if there were no hash at all.
    const drawn = await painted((t) => asText(t).includes("greet"))
    expect(asText(drawn)).toContain("greet")
    expect(screen.queryByRole("alert")).toBeNull()
  })

  /**
   * A preset has to move the PICTURE, and move all of it.
   *
   * The failure worth catching is one that sets the theme and forgets the
   * padding, or vice versa — the visitor presses "Slayd" and gets something
   * that is neither the old look nor the new one.
   */
  it("applies a whole look when a preset is pressed", async () => {
    // Arrange
    renderTool()
    const before = await painted()
    expect(before.every((t) => t.font.includes("14px"))).toBe(true)

    // Act — "Slayd" is 24px on a solid slate sheet with a macOS frame.
    fireEvent.click(screen.getByRole("button", { name: /^Slayd$/ }))

    // Assert — the size reached the canvas, and so did the background.
    const after = await painted((t) => t.some((x) => x.font.includes("24px")))
    expect(after.every((t) => t.font.includes("24px"))).toBe(true)
    expect(
      canvas.fills.some((fill) => fill.x === 0 && fill.fillStyle === "#1e293b")
    ).toBe(true)
  })

  it("leaves the code, the language and the font alone", async () => {
    // Arrange
    renderTool()
    await painted()
    await chooseOption(/^Shrift$/i, /Geist Mono/i)
    await painted((t) => t.some((x) => x.font.includes(FONTS["geist-mono"])))

    // Act
    fireEvent.click(screen.getByRole("button", { name: /^Minimal$/ }))

    // Assert — a preset decides where the picture is GOING, not what is in it
    // or which face someone already chose. Overwriting the font is the one
    // thing a preset has no business doing.
    const after = await painted((t) => asText(t).includes("greet"))
    expect(after.every((t) => t.font.includes(FONTS["geist-mono"]))).toBe(true)
    expect(screen.getByRole("combobox", { name: /Til/i }).textContent).toMatch(
      /TypeScript/i
    )
  })

  /**
   * The format picker governs the DOWNLOAD, and the file has to match.
   *
   * The wiring bug worth catching: a picker that changes state and a
   * `toBlob` still asked for PNG — the visitor picks WebP, gets a 2 MB file
   * named `.webp` that is really a PNG, and nothing anywhere says so.
   */
  it("asks the encoder for the format that was chosen", async () => {
    // Arrange — record what `toBlob` is asked for. jsdom cannot encode, so
    // the request itself is the observable.
    const asked: (string | undefined)[] = []
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(((
      callback: BlobCallback,
      type?: string
    ) => {
      asked.push(type)
      callback(new Blob(["x"], { type: type ?? "image/png" }))
    }) as typeof HTMLCanvasElement.prototype.toBlob)
    renderTool()
    await painted()

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "WEBP" }))
    fireEvent.click(screen.getByRole("button", { name: /^Yuklab olish$/ }))

    // Assert
    await waitFor(() => {
      expect(asked).toContain("image/webp")
    })
  })

  it("copies to the clipboard as PNG whatever the download format is", async () => {
    // Arrange — a working clipboard has to be supplied. jsdom has neither
    // `ClipboardItem` nor `clipboard.write`, so without this the copy button
    // reports failure and the component falls back to a DOWNLOAD, which
    // correctly uses the chosen format — and the test would then be watching
    // the fallback while claiming to watch the clipboard.
    const written: Record<string, unknown>[] = []
    vi.stubGlobal(
      "ClipboardItem",
      class {
        constructor(public items: Record<string, unknown>) {
          written.push(items)
        }
      }
    )
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write: async () => {} }
    })

    const asked: (string | undefined)[] = []
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(((
      callback: BlobCallback,
      type?: string
    ) => {
      asked.push(type)
      callback(new Blob(["x"], { type: type ?? "image/png" }))
    }) as typeof HTMLCanvasElement.prototype.toBlob)
    renderTool()
    await painted()

    // Act
    fireEvent.click(screen.getByRole("radio", { name: "WEBP" }))
    fireEvent.click(screen.getByRole("button", { name: /^Nusxalash$/ }))

    // Assert — `ClipboardItem` is specified around a small set of mandatory
    // types and `image/png` is the one every engine implements. A WebP on the
    // clipboard is a picture nobody can paste.
    await waitFor(() => {
      expect(written.some((item) => "image/png" in item)).toBe(true)
    })
    expect(asked).toContain("image/png")
    expect(asked).not.toContain("image/webp")
  })

  /**
   * The picture cross-fades on a style change and NEVER on a keystroke.
   *
   * Both halves matter. A canvas cannot transition its contents, so the only
   * way to ease a repaint is to keep the old bitmap and dissolve it — but
   * doing that while someone types reads as lag, not polish, and copies a
   * multi-megapixel bitmap on every debounced keystroke for nothing.
   */
  /**
   * ONE repaint per theme change, never two.
   *
   * This is the defect the owner reported as a flicker, and it was measured on
   * the running page before it was fixed: choosing a preset painted the new
   * geometry with the PREVIOUS theme's colours, then repainted **278ms** later
   * when the tokens arrived. Two flashes for one decision.
   *
   * The cause was that `theme` is in the paint effect's dependencies, so the
   * effect fired the moment the theme changed — long before the tokeniser had
   * produced any colours for it. The tokens now carry the theme they came
   * from, and the painter refuses to draw until the two agree.
   */
  it("repaints once for a theme change, not twice", async () => {
    // Arrange
    renderTool()
    const before = new Set((await painted()).map((t) => t.fillStyle))
    const passesBefore = canvas.passes.length

    // Act
    fireEvent.click(screen.getByRole("radio", { name: DRACULA }))

    // Assert — wait for the NEW palette to be on the canvas, then count how
    // many pictures it took to get there.
    await painted((texts) => texts.some((t) => !before.has(t.fillStyle)))
    expect(canvas.passes.length - passesBefore).toBe(1)
  })

  it("holds the previous frame when the theme changes", async () => {
    // Arrange
    renderTool()
    await painted()
    const before = canvas.copies
    const passesBefore = canvas.passes.length

    // Act
    fireEvent.click(screen.getByRole("radio", { name: DRACULA }))

    // Assert
    await repainted(passesBefore)
    expect(canvas.copies).toBeGreaterThan(before)
  })

  it("does not cross-fade while the visitor is typing", async () => {
    // Arrange
    renderTool()
    await painted()
    const before = canvas.copies
    const passesBefore = canvas.passes.length

    // Act
    fireEvent.change(codeInput(), { target: { value: "const typed = 1" } })

    // Assert — the character has to appear immediately; a dissolve would put
    // 200ms of ghost between the keystroke and seeing it.
    await repainted(passesBefore)
    expect(canvas.copies).toBe(before)
  })

  it("offers the editor before the first paint, not after", () => {
    // Arrange / Act — no `await`: this is the state a visitor is in while a
    // grammar is still downloading.
    renderTool()

    // Assert — an empty box you cannot type into is not a loading state.
    expect(codeInput()).toBeInTheDocument()
  })

  it("keeps every control reachable by its label", async () => {
    // Arrange / Act
    renderTool()
    await painted()

    // Assert — a canvas is opaque to assistive tech, so the controls beside it
    // carrying real names is the whole accessibility story of this tool.
    for (const name of [
      /Til/i,
      /^Shrift$/i,
      /Shrift o'lchami/i,
      /Qator balandligi/i,
      /Chekka bo'shliq/i,
      /Oyna/i
    ]) {
      expect(screen.getByRole("combobox", { name })).toBeInTheDocument()
    }
    // Theme and background are swatch grids, not dropdowns. A `<fieldset>`
    // with a `<legend>` is what gives each grid a name — without it a screen
    // reader announces 65 unrelated radios with no idea what they choose.
    for (const name of [/Mavzu/i, /Fon/i]) {
      expect(screen.getByRole("group", { name })).toBeInTheDocument()
    }
    // Every action carries a real, translated name. Queried by the Uzbek
    // text on purpose: a missing key renders as the literal
    // "CodeSnapshotPage.actions.copyLink", which this query would not find.
    // Anchored: "Nusxalash" is also a substring of "Havolani nusxalash", and
    // an unanchored regex matches both and throws on the ambiguity.
    for (const action of [
      /^Nusxalash$/,
      /^Yuklab olish$/,
      /^Havolani nusxalash$/
    ]) {
      expect(screen.getByRole("button", { name: action })).toBeInTheDocument()
    }

    // The picture is not a control, but the surface you type into is — and it
    // is the same element, so the tool has exactly one focusable editor.
    expect(preview()).toBeInTheDocument()
    // The canvas exposes no role of its own — the textarea over it is the
    // named, focusable surface, so there is exactly one editor here and not a
    // picture competing with it in the accessibility tree.
    expect(screen.queryByRole("img")).toBeNull()
    expect(codeInput()).toBeInTheDocument()
  })
})
