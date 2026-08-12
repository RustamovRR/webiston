import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import common from "../../../../messages/common/uz.json"
import messages from "../../../../messages/tools/code-snapshot/uz.json"
import { CodeSnapshot } from "./CodeSnapshot"
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
  predicate: (texts: DrawnText[]) => boolean = () => true
) {
  await waitFor(
    () => {
      expect(canvas.latest().length).toBeGreaterThan(0)
      expect(predicate(canvas.latest())).toBe(true)
    },
    { timeout: 5000 }
  )
  return canvas.latest()
}

/** Every drawn run joined back into one string, for "does it say X" checks. */
const asText = (texts: DrawnText[]) => texts.map((t) => t.text).join("")

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
    await chooseOption(/Mavzu/i, /Dracula/i)

    // Assert
    const after = new Set(
      (
        await painted((texts) => texts.some((t) => !before.has(t.fillStyle)))
      ).map((t) => t.fillStyle)
    )
    expect([...after].some((colour) => !before.has(colour))).toBe(true)
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
      /Mavzu/i,
      /Til/i,
      /^Shrift$/i,
      /Shrift o'lchami/i,
      /Qator balandligi/i,
      /Chekka bo'shliq/i,
      /Oyna/i,
      /Fon/i
    ]) {
      expect(screen.getByRole("combobox", { name })).toBeInTheDocument()
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
