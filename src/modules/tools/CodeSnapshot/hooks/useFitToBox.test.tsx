import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { useFitToBox } from "./useFitToBox"

/**
 * The zoom that keeps a wide picture inside the preview panel.
 *
 * Tested here rather than through the tool because jsdom lays nothing out —
 * every element is 0×0 — so the integration test can only ever see the
 * degenerate case. Stubbing the two measurements this hook takes is the only
 * way to pin down arithmetic that got it wrong twice: once by measuring
 * `clientWidth` (which includes the padding) against a `contentRect` (which
 * does not), and once by trusting `ResizeObserver` to fire on `observe()`,
 * which it does not do in a hidden tab.
 */

function Probe({ content }: { content: number | null }) {
  const { boxRef, fit } = useFitToBox(content)
  return (
    <div ref={boxRef} data-testid="box">
      <span data-testid="fit">{fit}</span>
    </div>
  )
}

const realComputedStyle = window.getComputedStyle

/** jsdom reports 0 for every dimension; a box has to be given a size. */
function boxOf(clientWidth: number, padding = 16) {
  Object.defineProperty(HTMLDivElement.prototype, "clientWidth", {
    configurable: true,
    get: () => clientWidth
  })
  window.getComputedStyle = ((element: Element) =>
    ({
      ...realComputedStyle(element),
      paddingLeft: `${padding}px`,
      paddingRight: `${padding}px`
    }) as CSSStyleDeclaration) as typeof window.getComputedStyle
}

const fit = () => Number(screen.getByTestId("fit").textContent)

afterEach(() => {
  // Both stubs sit on shared objects — a prototype and `window` — so leaving
  // them installed would make every later test believe it has a laid-out
  // document with 16px of padding.
  Reflect.deleteProperty(HTMLDivElement.prototype, "clientWidth")
  window.getComputedStyle = realComputedStyle
})

describe("useFitToBox", () => {
  it("shrinks a picture wider than its box", () => {
    // Arrange — 500px of content inside a 200px box (232 minus its padding).
    boxOf(232)

    // Act
    render(<Probe content={500} />)

    // Assert
    expect(fit()).toBeCloseTo(0.4, 5)
  })

  it("never enlarges a picture narrower than its box", () => {
    // Arrange — blowing a small snapshot up would be soft, and would lie about
    // what the exported file looks like.
    boxOf(932)

    // Act
    render(<Probe content={300} />)

    // Assert
    expect(fit()).toBe(1)
  })

  /**
   * The 32px mistake, pinned.
   *
   * The first version seeded the width from `clientWidth`, which INCLUDES the
   * padding, while the `ResizeObserver` that replaced it reports `contentRect`,
   * which does not. The two disagreed by exactly the padding, the wrong one
   * stood until the next resize, and a picture that needed 0.728 was scaled to
   * 0.761 — still overflowing, which looks like the feature not working at all.
   */
  it("measures the content box, not the padding box", () => {
    // Arrange — 400px of border box, 32px of it padding.
    boxOf(400, 16)

    // Act
    render(<Probe content={736} />)

    // Assert — 368/736, not 400/736.
    expect(fit()).toBeCloseTo(0.5, 5)
  })

  it("stays at 1 before the first paint has produced a width", () => {
    // Arrange / Act — there is no picture yet, so there is nothing to fit.
    boxOf(500)
    render(<Probe content={null} />)

    // Assert
    expect(fit()).toBe(1)
  })

  it("stays at 1 rather than collapsing when the box has no width", () => {
    // Arrange — a display:none ancestor, or a tab that has never been laid
    // out. Dividing by it would scale the picture to nothing.
    boxOf(0, 0)

    // Act
    render(<Probe content={500} />)

    // Assert
    expect(fit()).toBe(1)
  })
})
