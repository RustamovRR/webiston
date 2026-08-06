import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"

import commonMessages from "../../../../messages/common/uz.json"
import toolMessages from "../../../../messages/tools/device-info/uz.json"
import { DeviceInfo } from "./DeviceInfo"

/**
 * The tool, driven the way a visitor drives it.
 *
 * The detection rules have their own unit tests against real user-agent
 * strings; these cover what the PAGE does with the answers.
 */

const messages = { ...commonMessages, ...toolMessages }

function renderTool() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <DeviceInfo />
    </NextIntlClientProvider>
  )
}

const group = (name: RegExp) => screen.getByRole("region", { name })

describe("the snapshot", () => {
  it("shows every group without the visitor pressing anything", () => {
    // Arrange & Act
    renderTool()

    // Assert — six groups, and the page had no loading state to sit in:
    // reading `navigator` takes microseconds.
    for (const name of [
      /brauzer/i,
      /tizim/i,
      /ekran va oyna/i,
      /qurilma/i,
      /tarmoq/i,
      /afzalliklar/i
    ]) {
      expect(group(name)).toBeInTheDocument()
    }
  })

  it("keeps a row the browser cannot answer, and says so", () => {
    // Arrange & Act — jsdom implements neither the Network Information API
    // nor `deviceMemory`, which is also the state on Firefox and Safari.
    renderTool()

    // Assert — a row that disappears reads as a bug; what the browser refuses
    // to say is an answer too.
    expect(
      within(group(/tarmoq/i)).getAllByText(/brauzer bermaydi/i).length
    ).toBeGreaterThan(0)
  })

  it("reports the window separately from the screen", () => {
    // Arrange & Act — CSS media queries measure the window, so that is the
    // number a designer needs; the old tool only reported the screen.
    renderTool()

    // Assert
    const display = within(group(/ekran va oyna/i))
    expect(display.getByText(/oyna \(viewport\)/i)).toBeInTheDocument()
    expect(
      display.getByText(`${window.innerWidth} × ${window.innerHeight}`)
    ).toBeInTheDocument()
  })
})

describe("values that change while you look", () => {
  it("follows the browser going offline", () => {
    // Arrange
    renderTool()
    const network = () => within(group(/tarmoq/i))
    expect(network().getByText("Ha")).toBeInTheDocument()

    // Act — a page that reports this once and then lies until you press
    // refresh is worse than one that does not report it.
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true
      })
      window.dispatchEvent(new Event("offline"))
    })

    // Assert
    expect(network().getByText("Yo'q")).toBeInTheDocument()

    // Cleanup — the property is global to the test environment.
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true
    })
  })
})

describe("the mobile rows", () => {
  it("reports the safe area, which no JavaScript API exposes directly", () => {
    // Arrange & Act — the value that decides whether a button lands under the
    // iPhone home bar. It is read by applying `env(safe-area-inset-*)` as
    // padding to a hidden element and asking what the browser computed.
    renderTool()

    // Assert — zero on a desktop, which is a real answer rather than a
    // missing one.
    const display = within(group(/ekran va oyna/i))
    expect(display.getByText(/xavfsiz zona/i)).toBeInTheDocument()
    expect(display.getByText("0 / 0 / 0 / 0")).toBeInTheDocument()
  })

  it("leaves no probe element behind in the document", () => {
    // Arrange & Act — the probe is appended, measured and removed; one left
    // per re-read would be a leak on every resize event.
    renderTool()

    // Assert
    expect(document.querySelectorAll("body > div[style]").length).toBe(0)
  })
})

describe("the copy control", () => {
  it("is ONE button, not two that look identical", () => {
    // Arrange & Act — the first version put two bare `CopyButton`s side by
    // side; both render an icon and no text, so the toolbar showed two
    // indistinguishable buttons whose only difference was an accessible name.
    renderTool()

    // Assert
    expect(
      screen.getAllByRole("button", { name: /^nusxalash$/i })
    ).toHaveLength(1)
  })

  it("offers the data as a Markdown table as well as JSON", () => {
    // Arrange — the reason anyone copies this page is to paste it into an
    // issue, and 40 lines of JSON read worse there than a table.
    renderTool()

    // Act — Radix opens on `pointerdown`, not on `click`, so a plain click
    // event leaves the menu shut.
    fireEvent.pointerDown(
      screen.getByRole("button", { name: /^nusxalash$/i }),
      {
        button: 0,
        ctrlKey: false
      }
    )

    // Assert
    expect(
      screen.getByRole("menuitem", { name: /markdown/i })
    ).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: /json/i })).toBeInTheDocument()
  })
})

describe("no message renders as its own key", () => {
  it("keeps every label out of key-path fallback", () => {
    // Arrange & Act
    renderTool()

    // Assert
    expect(document.body.textContent).not.toContain("DeviceInfoPage.")
  })
})
